let GL = null;

onload = () => {
    const canvas = document.createElement('canvas');
    document.body.appendChild(canvas);
    
    canvas.width = 600;
    canvas.height = 600;

    GL = canvas.getContext('webgl2');
    
    setupGeometry();
    const nVerticies = TEAPOT_DATA.length / 6; 

    const drawFrame = ms => {
        GL.clearColor(0, 0, 0, 1);
        GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);

        GL.drawArrays(GL.TRIANGLES, 0, nVerticies);

        requestAnimationFrame(drawFrame);
    };

    requestAnimationFrame(drawFrame);
}

const COORD = 0
const NORMAL = 1;

function setupGeometry() {
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
}

const VS = `#version 300 es

in vec3 coord;
in vec3 normal;

void main() {
    vec3 pos = rotate(coord, 90);
    gl_Position = vec4(pos.xy - vec2(0, 1.5), -1, pos.z + 5.0);
}`;

const FS = `#version 300 es

precision highp float;

out vec4 color;

void main() {
    color = vec4(1, 1, 1, 1);
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