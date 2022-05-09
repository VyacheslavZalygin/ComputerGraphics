let GL = null;

onload = () => {
    const canvas = document.createElement('canvas');
    document.body.appendChild(canvas);
    
    canvas.width = 600;
    canvas.height = 600;

    GL = canvas.getContext('webgl2');

    GL.enable(GL.DEPTH_TEST);
    
    const uniforms = setupGeometry(['time', 'lights']);
    const nVerticies = TEAPOT_DATA.length / 6;
    setupLights(); 

    const drawFrame = ms => {
        GL.clearColor(0, 0, 0, 1);
        GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);

        GL.uniform1f(uniforms.time, ms / 10);
        GL.uniform1f(uniforms.lights, 0 /* номер текстуры */);

        GL.drawArrays(GL.TRIANGLES, 0, nVerticies);

        requestAnimationFrame(drawFrame);
    };

    requestAnimationFrame(drawFrame);
}

const COORD = 0
const NORMAL = 1;

function setupGeometry(uniforms) {
    GL.bindBuffer(GL.ARRAY_BUFFER, GL.createBuffer());
    GL.bufferData(GL.ARRAY_BUFFER, Float32Array.from(TEAPOT_DATA), GL.STATIC_DRAW);

    GL.vertexAttribPointer(COORD, 3, GL.FLOAT, false, 24, 0);
    GL.vertexAttribPointer(NORMAL, 3, GL.FLOAT, false, 24, 12);
    GL.enableVertexAttribArray(COORD);
    GL.enableVertexAttribArray(NORMAL);

    const program = buildProgram(VS, FS, {
        coord: COORD, 
        normal: NORMAL,
    });

    GL.useProgram(program);

    const result = {};
    for (const name of uniforms) {
        result[name] = GL.getUniformLocation(program, name);
    }

    return result;

}

function flatten(array) {
    const result = [];

    for (const row of array) {
        for (const s of row) {
            result.push(s);
        }
    }

    return result;
}

function setupLights() {
    GL.activeTexture(GL.TEXTURE0);

    const lights =[
        [4, 3, -5, 100, 100, 150],
        [-4, 1, 3, 200, 200, 200],
    ];

    GL.bindTexture(GL.TEXTURE_2D, GL.createTexture());
    GL.texImage2D(GL.TEXTURE_2D, 0, GL.R32F, 4, 2, 0, GL.RED, GL.FLOAT, 
        Float32Array.from(flatten(lights))
    );
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.NEAREST);
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.NEAREST);
}

const VS = `#version 300 es

in vec3 coord;
in vec3 normal;

out vec3 position;
out vec3 fs_normal;

uniform float time;

vec3 rotate(vec3 v, float angle) {
    float cos_a = cos(radians(angle));
    float sin_a = sin(radians(angle));

    return vec3(
        cos_a * v.x + sin_a * v.z,
        v.y, 
        -sin_a * v.x + cos_a * v.z
    );
}

void main() {
    vec3 pos = rotate(coord, time);
    fs_normal = rotate(normal, time);
    pos = vec3(pos.x, pos.y - 2.0, pos.z + 7.0);
    gl_Position = vec4(pos.xy, -1, pos.z);
    position = pos;
}`;

const FS = `#version 300 es

precision highp float;

uniform sampler2D lights;

in vec3 position;
in vec3 fs_normal;
out vec4 color;

void main() {

    ivec2 lights_size = textureSize(lights, 0);
    vec3 total_color = vec3(0, 0, 0);

    for (int i = 0; i < lights_size.y; i++) {
        vec3 light_pos = vec3(
            texelFetch(lights, ivec2(0, i), 0).r,
            texelFetch(lights, ivec2(1, i), 0).r,
            texelFetch(lights, ivec2(2, i), 0).r
        );

        vec3 light_color = vec3(
            texelFetch(lights, ivec2(3, i), 0).r,
            texelFetch(lights, ivec2(4, i), 0).r,
            texelFetch(lights, ivec2(5, i), 0).r
        );

        // направление от точки поверхности на источник света:
        vec3 direction = light_pos - position;
        float normal_direction = dot(fs_normal, direction);

        if (normal_direction > 0.0) {
            float inv_distance = inversesqrt(dot(direction, direction));

            total_color += 
                light_color 
                * (normal_direction
                * pow(inv_distance, 3.0));
        }
    }

    color = vec4(total_color + vec3(0.1, 0.1, 0.1), 1);
}`;

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