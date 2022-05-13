let GL = null;

onload = () => {
    const canvas = document.createElement('canvas');
    document.body.appendChild(canvas);
    canvas.width = 600;
    canvas.height = 600;

    const image = document.getElementById('image');

    GL = canvas.getContext(`webgl2`);
    GL.enable(GL.DEPTH_TEST);

    const texture = GL.createTexture();    
    GL.activeTexture(GL.TEXTURE0);
    GL.bindTexture(GL.TEXTURE_2D, texture);
    GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, GL.RGBA, GL.UNSIGNED_BYTE, image);
    GL.generateMipmap(GL.TEXTURE_2D);
    
    const lights = GL.createTexture();
    GL.activeTexture(GL.TEXTURE1);
    GL.bindTexture(GL.TEXTURE_2D, lights);
    GL.texImage2D(GL.TEXTURE_2D, 0, GL.R32F, 4, 2, 0, GL.RED, GL.FLOAT, 
        Float32Array.from([
            4, 3, -5, 130,
            -4, 1, 3, 20,
        ])
    );
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.NEAREST);
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.NEAREST);
    
    const { cube, program, uniforms } = setupScene();
    
    const renderFrame = time => {
        const aspect = processResize();

        GL.clearColor(0, 0, 0, 1);
        GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);

        GL.useProgram(program);
    
        GL.bindVertexArray(cube);
    
        GL.uniform3f(uniforms.axis, 1, 3, 1);
        GL.uniform1f(uniforms.angle, time/1000);
        GL.uniform3f(uniforms.translation, 0, 0, 7);
        GL.uniform1f(uniforms.aspect, aspect);
        GL.uniform1f(uniforms.destination, 1.5);
        GL.uniform1i(uniforms.lights, 1);
    
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

    const cube = createCubeVAO(attributes);  

    GL.enable(GL.DEPTH_TEST);

    const uniforms = {};

    for (const name of ['axis', 'angle', 'translation', 'aspect', 'destination', 'lights']) {
        uniforms[name] = GL.getUniformLocation(program, name);
    }

    return { program, cube, uniforms };
}


function createCubeVAO(attributes) {
    const vao = GL.createVertexArray();

    GL.bindVertexArray(vao);

    const buffer = GL.createBuffer();

    GL.bindBuffer(GL.ARRAY_BUFFER, buffer);
    GL.bufferData(GL.ARRAY_BUFFER, makeCube(), GL.STATIC_DRAW);
   
    const { coord, index } = attributes;

    GL.enableVertexAttribArray(coord);
    GL.vertexAttribPointer(coord, 3, GL.FLOAT, false, 16, 0);

    GL.enableVertexAttribArray(index);
    GL.vertexAttribPointer(index, 1, GL.FLOAT, false, 16, 12);

    GL.bindVertexArray(null);

    return vao;
}

function makeCube() {
    const v0 = [-1, -1, -1, 0];
    const v1 = [-1, -1,  1, 1];
    const v2 = [-1,  1, -1, 2];
    const v3 = [-1,  1,  1, 3];
    const v4 = [1,  -1, -1, 4];
    const v5 = [1,  -1,  1, 5];
    const v6 = [1,   1, -1, 6];
    const v7 = [1,   1,  1, 7];

    return Float32Array.from(
        v0.concat(v1).concat(v2)
        .concat(v1).concat(v2).concat(v3)
        .concat(v0).concat(v1).concat(v4)
        .concat(v1).concat(v4).concat(v5)
        .concat(v0).concat(v2).concat(v4)
        .concat(v2).concat(v4).concat(v6)
        .concat(v7).concat(v3).concat(v6)
        .concat(v3).concat(v6).concat(v2)
        .concat(v7).concat(v5).concat(v3)
        .concat(v5).concat(v3).concat(v1)
        .concat(v7).concat(v5).concat(v6)
        .concat(v5).concat(v6).concat(v4)
    ); 
}

const VS_SRC = `#version 300 es

in vec3 coord;
in float index;  // пока не убираем! (позже пригодится)

uniform vec3 axis;
uniform float angle;
uniform vec3 translation;
uniform float aspect;
uniform float destination;

out vec2 tex_coords;
out float cube_x;
out vec3 position;

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

    position = rotate(scale*coord, axis, angle) + translation;
    
    gl_Position = vec4(position.x, position.y*aspect, -1, position.z * destination);

    switch (int(index)) {
        case 0:
            tex_coords = vec2(0, 0);
            break;
        case 1:
            tex_coords = vec2(1, 0);
            break;
        case 2:
            tex_coords = vec2(1, 0);
            break;
        case 3:
            tex_coords = vec2(0, 0);
            break;
        case 4:
            tex_coords = vec2(0, 1);
            break;
        case 5:
            tex_coords = vec2(1, 1);
            break;
        case 6:
            tex_coords = vec2(1, 1);
            break;
        case 7:
            tex_coords = vec2(0, 1);
            break;
        default:
            tex_coords = vec2(0, 0);
    }        
    cube_x = coord.x;
}`;

const FS_SRC = `#version 300 es

precision highp float;
precision highp sampler2D;

in vec2 tex_coords;
in float cube_x;
in vec3 position;

uniform sampler2D tex;
uniform sampler2D lights;

out vec4 frag_color;

vec3 calculate_normal() {
    vec3 dir1 = dFdx(position);
    vec3 dir2 = dFdy(position);
    
    return normalize(cross(dir2, dir1));
}

void main() {
    vec3 surface_color = 
        abs(cube_x) > 0.99
        ? vec3(0.7, 0.7, 0.7)
        : texture(tex, tex_coords).rgb;

    float intensity = 0.3;  // фоновая интенсивность

    vec3 normal = calculate_normal();

    ivec2 lights_size = textureSize(lights, 0);

    for (int i = 0; i < lights_size.y; i++) {
        if (i == 0) {
            continue;
        }
        
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
            // intensity += 0.3;
        }        
    }

    frag_color = vec4(intensity * surface_color, 1);
}`;
