let GL = null;

onload = () => {
    const canvas = document.getElementById(`canvas`);
    canvas.width = 600;
    canvas.height = 600;

    GL = canvas.getContext(`webgl2`);

    const { cube, program, uniforms } = setupScene();
    
    const renderFrame = time => {
        const aspect = processResize();

        GL.clearColor(0, 0, 0, 1);
        GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);

        GL.useProgram(program);
    
        GL.bindVertexArray(cube);
    
        GL.uniform3f(uniforms.axis, 
            0, 1, 0
        );
        GL.uniform1f(uniforms.angle, 0);
        GL.uniform3f(uniforms.translation, 0, 0, 7);
        GL.uniform1f(uniforms.aspect, aspect);
    
        GL.drawArrays(GL.TRIANGLES, 0, 36);
    
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


function setupScene() {
    const attributes = {
        coord: 0,
        index: 1,
    };

    const program = buildProgram(VS_SRC, FS_SRC, attributes);

    const cube = createSphereVAO(attributes);  

    GL.enable(GL.DEPTH_TEST);

    const uniforms = {};

    for (const name of ['axis', 'angle', 'translation', 'aspect']) {
        uniforms[name] = GL.getUniformLocation(program, name);
    }

    return { program, cube, uniforms };
}


function createSphereVAO(attributes) {
    const vao = GL.createVertexArray();

    GL.bindVertexArray(vao);

    const buffer = GL.createBuffer();

    GL.bindBuffer(GL.ARRAY_BUFFER, buffer);
    GL.bufferData(GL.ARRAY_BUFFER, makeSphere(), GL.STATIC_DRAW);
   
    const { coord, index } = attributes;

    GL.enableVertexAttribArray(coord);
    GL.vertexAttribPointer(coord, 3, GL.FLOAT, false, 16, 0);

    GL.enableVertexAttribArray(index);
    GL.vertexAttribPointer(index, 1, GL.FLOAT, false, 16, 12);

    GL.bindVertexArray(null);

    return vao;
}

const VS_SRC = `#version 300 es

in vec3 coord;
in float index;  // пока не убираем! (позже пригодится)

uniform vec3 axis;
uniform float angle;
uniform vec3 translation;
uniform float aspect;

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
    float scale = 2.3;

    vec3 position = rotate(scale*coord, axis, angle) + translation;
    
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
