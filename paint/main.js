window.onload = () => {
    // brush
    const brush_img = document.getElementById("brush");
    let brush = null;

    // canvas
    const canvas = document.getElementById("canvas");
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext("2d");
    clearCanvas(ctx);

    // brush size
    const size_inp = document.getElementById("input");
    let size = size_inp.value;
    size_inp.oninput = event => {
        size = size_inp.value;
    };

    // brush color
    const colors_container = document.getElementById("colors");
    const color_canvases = ['black', 'white', 'red', 'green', 'yellow', 'gray', 'blue']
        .map(color => {
            const c = document.createElement("canvas");
            c.width = 50;
            c.height = 50;
            c.style = "border: 2px solid black; margin: 2px";
            const c_ctx = c.getContext("2d");
            c_ctx.fillStyle = color;
            c_ctx.fillRect(0, 0, c_ctx.canvas.width, c_ctx.canvas.height);
            c_ctx.globalCompositeOperation = "destination-in";
            c_ctx.drawImage(brush_img, 0, 0, c_ctx.canvas.width, c_ctx.canvas.height);
            return c;
    })
        .map(color => {
            color.onclick = event => {
                brush = color;
                color_canvases.forEach(color => {
                    color.style = "border: 2px solid black; margin: 2px";
                })
                color.style = "border: 2px solid red; margin: 2px";
            };
            colors_container.appendChild(color);
            return color;
    });

    const getMouseCoords = event => {
        const {x, y} = canvas.getBoundingClientRect();
        return [event.clientX - x, event.clientY - y];
    };

    let prevX = null;
    let prevY = null;

    canvas.onmousedown = event => {
        if (brush === null) {
            alert("choose a color");
        }
        const [x, y] = getMouseCoords(event);
        
        prevX = x;
        prevY = y;
        
        drawBrush(ctx, x, y, brush, size);
    };

    onmousemove = event => {
        if (prevX === null) { return; }

        const [x, y] = getMouseCoords(event);
        
        forEachPixel(prevX, prevY, x, y, (x, y) => {
            drawBrush(ctx, x, y, brush, size);
        });
        
        prevX = x;
        prevY = y;
    };

    onmouseup = event => {
        prevX = null;
        prevY = null;
    };
}

function clearCanvas(ctx) {
    ctx.fillStyle = `black`;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

function drawBrush(ctx, x, y, brush, size) {
    ctx.drawImage(brush, x - size/2, y - size/2, size, size);
}

function forEachPixel(x0, y0, x1, y1, action) {
    const dx = x1-x0;
    const dy = y1-y0; 
    const maxDiff = Math.max(Math.abs(dx), Math.abs(dy));
    
    action(x0, y0);

    if (maxDiff === 0) { return; }

    let x = x0;
    let y = y0;
    for (let i = 0; i < maxDiff; i++) {
        x += dx/maxDiff;
        y += dy/maxDiff;
        action(x, y);
    }
}