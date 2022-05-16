let GL = null;

onload = () => {
    const canvas = document.getElementById(`canvas`);
    canvas.width = 600;
    canvas.height = 600;

    const count = 20;

    GL = canvas.getContext(`webgl2`);

    const { sphere, program, uniforms } = setupScene(count);
    
    const renderFrame = time => {
        const aspect = processResize();

        GL.clearColor(0, 0, 0, 1);
        GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);

        GL.useProgram(program);
    
        GL.bindVertexArray(sphere);
    
        GL.uniform3f(uniforms.axis, 
            0, 1, 0
        );
        GL.uniform3f(uniforms.bxis,
            0, 0, 1
        );
        GL.uniform1f(uniforms.angle, 0);
        GL.uniform3f(uniforms.translation, 0, 0, 7);
        GL.uniform1f(uniforms.aspect, aspect);
        GL.uniform1f(uniforms.scale, 3);
    
        GL.drawArrays(GL.TRIANGLES, 0, count*count*6);
    
        GL.bindVertexArray(null);

        requestAnimationFrame(renderFrame);
    };

    renderFrame(0);
}

function processResize() {
    const width = GL.canvas.clientWidth;
    const height = GL.canvas.clientHeight;
    const aspect = width / height;

    if (GL.canvas.height !== height || GL.canvas.width !== width) {
        GL.canvas.width = width;
        GL.canvas.height = height;
        GL.viewport(0, 0, width, height); 
    }

    return aspect;
}

function setupScene(count) {
    const attributes = {
        coord: 0,
        index: 1,
    };

    const program = buildProgram(VS_SRC, FS_SRC, attributes);

    const sphere = createSphereVAO(attributes, count);  

    GL.enable(GL.DEPTH_TEST);

    const uniforms = {};

    for (const name of ['axis', 'bxis', 'translation', 'aspect', 'scale']) {
        uniforms[name] = GL.getUniformLocation(program, name);
    }

    return { program, sphere, uniforms };
}

function createSphereVAO(attributes, count) {
    const vao = GL.createVertexArray();

    GL.bindVertexArray(vao);

    const buffer = GL.createBuffer();

    GL.bindBuffer(GL.ARRAY_BUFFER, buffer);
    GL.bufferData(GL.ARRAY_BUFFER, makeSphere(count), GL.STATIC_DRAW);
   
    const { coord, index } = attributes;

    GL.enableVertexAttribArray(coord);
    GL.vertexAttribPointer(coord, 2, GL.FLOAT, false, 12, 0);

    GL.enableVertexAttribArray(index);
    GL.vertexAttribPointer(index, 1, GL.FLOAT, false, 12, 8);

    GL.bindVertexArray(null);

    return vao;
}

function makeSphere(count) {
    const vertexes = [];
    for (let i = 0; i < count; i += 1) {
        const plane = [];
        for (let j = 0; j < count; j += 1) {
            plane.push([rad(180/(count-1))*j, rad(360/count)*i]);
        }
        vertexes.push(plane);
    }

    let triangles = [];
    for (let i = 0; i < count; i += 1) {
        for (let j = 0; j < count - 1; j += 1){
            const [a1, a2] = [vertexes[i][j], vertexes[i][j+1]];
            const [b1, b2] = [vertexes[(i+1+count)%count][j], vertexes[(i+1+count)%count][j+1]];

            triangles = triangles
                .concat(point(a1)).concat(point(a2)).concat(point(b2))
                .concat(point(a1)).concat(point(b1)).concat(point(b2));
        }
    }
    console.log(vertexes);
    return Float32Array.from(triangles);
}

function rad(degree) {
    return degree * Math.PI / 180;
}

function point(vec, i=-1) {
    return [...vec, i]
}

const VS_SRC = `#version 300 es

in vec2 coord;
in float index;

uniform vec3 axis;
uniform vec3 bxis;
uniform vec3 translation;
uniform float aspect;
uniform float scale;

// t = t.z e12 - t.y e13 + t.x e23 + t.w e
vec4 lapply(vec4 t, vec3 v) {
    return vec4(t.w * v + cross(v, t.xyz), dot(v, t.xyz));
}

// v = v.x e1 + v.y e2 + v.z e3 + v.w e123
vec3 rapply(vec4 v, vec4 t) {
    return t.w * v.xyz - v.w * t.xyz + cross(t.xyz, v.xyz);
}

vec3 rotate(vec3 coord, vec3 axis, float angle) {
    axis = normalize(axis);
    float cosine_half = cos(angle / 2.0);
    float sine_half = sin(angle / 2.0);

    vec4 rot_r = vec4(sine_half * axis, cosine_half);
    vec4 rot_l = vec4(-rot_r.xyz, rot_r.w);

    return rapply(lapply(rot_l, coord), rot_r);
}

void main() {
    vec3 position = rotate(rotate(scale*axis, bxis, coord.x), axis, coord.y) + translation;
    
    gl_Position = vec4(position.x, position.y*aspect, -1, position.z);
}
`;

const FS_SRC = `#version 300 es

precision highp float;

out vec4 frag_color;

void main() {
    frag_color = vec4(0.8, 0.5, 0.7, 1);
}
`;

function buildProgram(vsSource, fsSource, attributes) {
    const vs = compileShader(vsSource, 'vertex');
    if (vs === null) { return null; }

    const fs = compileShader(fsSource, 'fragment');
    if (fs === null) { return null; }

    const program = GL.createProgram();

    for (const name in attributes) {
        const index = attributes[name];

        GL.bindAttribLocation(program, index, name);
    }
    
    GL.attachShader(program, vs);
    GL.attachShader(program, fs);
    GL.linkProgram(program);

    if (!GL.getProgramParameter(program, GL.LINK_STATUS)) { 
        console.error(GL.getProgramInfoLog(program));

        return null;
    }

    return program;
}

function compileShader(source, type) {
    let glType = type;

    if (type === 'vertex') { glType = GL.VERTEX_SHADER; }
    else if (type === 'fragment') { glType = GL.FRAGMENT_SHADER; }

    const shader = GL.createShader(glType);

    GL.shaderSource(shader, source);
    GL.compileShader(shader);


    if (!GL.getShaderParameter(shader, GL.COMPILE_STATUS)) { 
        console.error(`SHADER TYPE ${type}`);
        console.error(GL.getShaderInfoLog(shader));

        return null;
    }

    return shader;
}