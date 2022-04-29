let GL = null;

onload = () => {
    const canvas = document.createElement('canvas');
    document.body.appendChild(canvas);

    canvas.width = 600;
    canvas.height = 600;

    GL = canvas.getContext('webgl2');
    setupAttributes();

    const program = buildProgram(VS, FS, {
        coord: COORD,
        color: COLOR
    });

    GL.useProgram(program);

    const drawFrame = () => {
        GL.clearColor(230/255, 129/255, 184/255, 1);
        GL.clear(GL.COLOR_BUFFER_BIT);

        GL.drawArrays(GL.TRIANGLES, 0, 6);

        requestAnimationFrame(drawFrame);
    };

    requestAnimationFrame(drawFrame);
};

const COORD = 0;
const COLOR = 1;

function setupAttributes() {
    const coords = Float32Array.from([ 
        -1, -1, 1, 0, 0,
         1, -1, 1, 0, 0,
         1,  1, 1, 0, 0,
         1,  1, 1, 1, 0,
        -1,  1, 0, 1, 0,
        -1, -1, 0, 1, 1,
    ]);

    GL.bindBuffer(GL.ARRAY_BUFFER, GL.createBuffer());
    GL.bufferData(GL.ARRAY_BUFFER, coords, GL.STATIC_DRAW);

    GL.enableVertexAttribArray(COORD);
    GL.enableVertexAttribArray(COLOR);

    GL.vertexAttribPointer(COORD, 2, GL.FLOAT, false, 20, 0);
    GL.vertexAttribPointer(COLOR, 3, GL.FLOAT, false, 20, 8);
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

const VS = `#version 300 es
in vec2 coord;
in vec3 color;

out vec3 fsColor;

void main() {
    gl_Position = vec4(coord/3.0, 0, 1);
    fsColor = color;
}`;

const FS = `#version 300 es
precision highp float;

in vec3 fsColor;

out vec4 outColor;

void main() {
    outColor = vec4(fsColor, 1);
}`;