let GL = null;
let prevCoord = undefined;

onload = () => {
    const canvas = document.getElementById(`canvas`);
    canvas.width = 600;
    canvas.height = 600;

    const count = 20;
    let axis = [0, 1, 0];
    let bxis = [0, 0, 1];

    const getMouseCoords = event => {
        const {x, y} = canvas.getBoundingClientRect();
        return [event.clientX - x, event.clientY - y];
    };

    canvas.onmousedown = event => { prevCoord = getMouseCoords(event); };
    canvas.onmouseup = event => { prevCoord = undefined; };
    canvas.onmouse = event => { prevCoord = undefined; };

    canvas.onmousemove = event => {
        if (prevCoord !== undefined) {
            const coord = getMouseCoords(event);
            const v = [coord[0]-prevCoord[0], prevCoord[1]-coord[1], 0];
            if (len(v) !== 0) {
                const a = cross(v, [0, 0, 1]);
                const angle = rad(len(a) / Math.PI);

                const new_axis = rotate(axis, a, angle);
                axis[0] = new_axis[0];
                axis[1] = new_axis[1];
                axis[2] = new_axis[2];
                const new_bxis = rotate(bxis, a, angle);
                bxis[0] = new_bxis[0];
                bxis[1] = new_bxis[1];
                bxis[2] = new_bxis[2];
            }
            prevCoord = coord;
        }
    };

    const image = document.getElementById('image');
    
    GL = canvas.getContext(`webgl2`);

    const { sphere, program, uniforms } = setupScene(count, image);

    const renderFrame = time => {
        const aspect = processResize();

        GL.clearColor(0, 0, 0, 1);
        GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);

        GL.useProgram(program);
    
        GL.bindVertexArray(sphere);
    
        GL.uniform3f(uniforms.axis, ...axis);
        GL.uniform3f(uniforms.bxis, ...bxis);
        GL.uniform3f(uniforms.center, 0, 0, 7);
        GL.uniform1f(uniforms.aspect, aspect);
        GL.uniform1f(uniforms.scale, 3);
        GL.uniform1i(uniforms.tex, 0);
        GL.uniform1i(uniforms.lights, 1);
    
        GL.drawArrays(GL.TRIANGLES, 0, count*(count-1)*6);
    
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

function setupScene(count, image) {
    const attributes = {
        coord: 0,
        texture_coord: 1,
    };

    const program = buildProgram(VS_SRC, FS_SRC, attributes);

    const sphere = createSphereVAO(attributes, count);  

    GL.enable(GL.DEPTH_TEST);

    const uniforms = {};

    for (const name of ['axis', 'bxis', 'center', 'aspect', 'scale', 'lights', 'tex']) {
        uniforms[name] = GL.getUniformLocation(program, name);
    }

    const texture = GL.createTexture();    
    GL.activeTexture(GL.TEXTURE0);
    GL.bindTexture(GL.TEXTURE_2D, texture);
    GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, GL.RGBA, GL.UNSIGNED_BYTE, image);
    GL.generateMipmap(GL.TEXTURE_2D);
    
    const lights = GL.createTexture();
    GL.activeTexture(GL.TEXTURE1);
    GL.bindTexture(GL.TEXTURE_2D, lights);
    GL.texImage2D(GL.TEXTURE_2D, 0, GL.R32F, 4, 1, 0, GL.RED, GL.FLOAT, 
        Float32Array.from([
            4, 3, -3, 30,
        ])
    );
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.NEAREST);
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.NEAREST);

    return { program, sphere, uniforms };
}

function createSphereVAO(attributes, count) {
    const vao = GL.createVertexArray();

    GL.bindVertexArray(vao);

    const buffer = GL.createBuffer();

    GL.bindBuffer(GL.ARRAY_BUFFER, buffer);
    GL.bufferData(GL.ARRAY_BUFFER, makeSphere(count), GL.STATIC_DRAW);
   
    const { coord, texture_coord } = attributes;

    GL.enableVertexAttribArray(coord);
    GL.vertexAttribPointer(coord, 2, GL.FLOAT, false, 16, 0);

    GL.enableVertexAttribArray(texture_coord);
    GL.vertexAttribPointer(texture_coord, 2, GL.FLOAT, false, 16, 8);

    GL.bindVertexArray(null);

    return vao;
}

function makeSphere(count) {
    const vertexes = [];
    for (let i = 0; i < count; i += 1) {
        const plane = [];
        for (let j = 0; j < count; j += 1) {
            let [a, b] = [0, 0];
            const c = count;
            a = Math.abs(i/c - 0.5);
            b = (j/c);
            if (a > 0.9) a = 1;
            plane.push([rad(180/(count-1))*j, rad(360/count)*i, a, b]);
        }
        vertexes.push(plane);
    }

    let triangles = [];
    for (let i = 0; i < count; i += 1) {
        for (let j = 0; j < count - 1; j += 1){
            const [a1, a2] = [vertexes[i][j], vertexes[i][j+1]];
            const [b1, b2] = [vertexes[(i+1+count)%count][j], vertexes[(i+1+count)%count][j+1]];

            triangles = triangles
                .concat(a1).concat(a2).concat(b2)
                .concat(a1).concat(b1).concat(b2);
        }
    }
    console.log(triangles);
    return Float32Array.from(triangles);
}

function rad(degree) {
    return degree * Math.PI / 180;
}

function point(vec) {
    return [...vec, 0, 0];
}

function len(vec) {
    const [v1, v2, v3] = vec;
    return Math.sqrt(v1**2 + v2**2 + v3**2);
}

function normalize(vec) {
    const [v1, v2, v3] = vec;
    const l = len(vec);
    return [v1/l, v2/l, v3/l];
}

function dot(a, b) {
    const [a1, a2, a3] = a;
    const [b1, b2, b3] = b;
    return a1*b1 + a2*b2 + a3*b3;
}

function cross(a, b) {
    const [a1, a2, a3] = a;
    const [b1, b2, b3] = b;
    return [a2*b3 - a3*b2, a3*b1 - a1*b3, a1*b2 - a2*b1];
}

function lapply(t, v) {
    const [t1, t2, t3, t4] = t;
    const [v1, v2, v3] = v;
    const [c1, c2, c3] = cross(v, [t1, t2, t3]);
    return [v1*t4 + c1, v2*t4 + c2, v3*t4 + c3, dot(v, [t1, t2, t3])];
}

function rapply(t, v) {
    const [v1, v2, v3, v4] = v;
    const [t1, t2, t3, t4] = t;
    const [c1, c2, c3] = cross([t1, t2, t3], [v1, v2, v3]);
    return [t4*v1-v4*t1 + c1, t4*v2-v4*t2 + c2, t4*v3-v4*t3 + c3];
}

function rotate(vec, axis, angle) {
    axis = normalize(axis);
    const [a1, a2, a3] = axis;
    const cos = Math.cos(angle/2);
    const sin = Math.sin(angle/2);

    const [r1, r2, r3, r4] = [sin * a1, sin * a2, sin * a3, cos];
    const [l1, l2, l3, l4] = [-r1, -r2, -r3, r4];

    const [o1, o2, o3] = rapply(lapply([l1, l2, l3, l4], vec), [r1, r2, r3, r4])

    return [-o1, -o2, -o3];
}

const VS_SRC = `#version 300 es

in vec2 coord;
in vec2 texture_coord;

uniform vec3 axis;
uniform vec3 bxis;
uniform vec3 center;
uniform float aspect;
uniform float scale;

out vec3 position;
out vec2 tex_coord;
out vec3 cent;

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
    position = rotate(rotate(scale*axis, bxis, coord.x), axis, coord.y) + center;
    cent = center;
    
    tex_coord = texture_coord;
    gl_Position = vec4(position.x, position.y*aspect, -1, position.z);
}
`;

const FS_SRC = `#version 300 es

precision highp float;

in vec3 position;
in vec2 tex_coord;
in vec3 cent;

uniform sampler2D lights;
uniform sampler2D tex;

out vec4 frag_color;

vec3 calculate_normal() {
    vec3 dir1 = dFdx(position);
    vec3 dir2 = dFdy(position);
    
    return normalize(cross(dir2, dir1));
}

void main() {
    vec3 surface_color = texture(tex, tex_coord).rgb;
    float intensity = 0.3;

    vec3 normal = position - cent;

    ivec2 lights_size = textureSize(lights, 0);

    for (int i = 0; i < lights_size.y; i++) {
        vec3 light_pos = vec3(
            texelFetch(lights, ivec2(0, 0), 0).r,
            texelFetch(lights, ivec2(1, 0), 0).r,
            texelFetch(lights, ivec2(2, 0), 0).r
        );

        float light_intensity = texelFetch(lights, ivec2(3, 0), 0).r;
        
        // направление от точки поверхности на источник света:
        vec3 direction = light_pos - position;
        float normal_direction = dot(normal, direction);
        
        if (normal_direction > 0.0) {
            float inv_distance = inversesqrt(dot(direction, direction));

            intensity += 
                light_intensity 
                * normal_direction
                * pow(inv_distance, 3.0);
        }        
    }

    frag_color = vec4(intensity * surface_color, 1);
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