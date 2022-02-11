window.onload = () => {
    // brush
    const brush_img = document.getElementById("brush");
    let brush_ctx = null;

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
    const color_ctxs = ['white', 'black', 'red', 'green', 'yellow', 'gray', 'blue']
        .map(color => {
            const c_ctx = createColorCtx(color, brush_img);
            makeColorBeautifulBrush(c_ctx);
            return [c_ctx, createColorCtx(color, brush_img)];
    })
        .map((el) => {
            const [color_brush, color_ctx] = el;
            console.log(color_ctx);
            color_ctx.canvas.onclick = event => {
                brush_ctx = color_brush;
                color_ctxs.forEach(color => {
                    color.canvas.style = "border: 2px solid black; margin: 2px";
                });
                color_ctx.canvas.style = "border: 2px solid red; margin: 2px";
            };
            colors_container.appendChild(color_ctx.canvas);
            
            return color_ctx;
    });
    color_ctxs[0].canvas.onclick();
 
    const getMouseCoords = event => {
        const {x, y} = canvas.getBoundingClientRect();
        return [event.clientX - x, event.clientY - y];
    };

    let prevX = null;
    let prevY = null;

    canvas.onmousedown = event => {
        if (brush_ctx === null) {
            alert("choose a color");
        }
        const [x, y] = getMouseCoords(event);
        
        prevX = x;
        prevY = y;
        
        drawBrush(ctx, x, y, brush_ctx, size);
    };

    onmousemove = event => {
        if (prevX === null) { return; }

        const [x, y] = getMouseCoords(event);
        
        forEachPixel(prevX, prevY, x, y, (x, y) => {
            drawBrush(ctx, x, y, brush_ctx, size);
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

function drawBrush(ctx, x, y, brush_ctx, size) {
    ctx.drawImage(brush_ctx.canvas, x - size/2, y - size/2, size, size);
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

function makeColorBeautifulBrush(brush_ctx) {
    const data = brush_ctx.getImageData(0, 0, brush_ctx.canvas.width, brush_ctx.canvas.height);
    const pixels = data.data;

    for (let y = 0; y < data.height; y++) {
        for (let x = 0; x < data.width; x++) {
            const offset = 4 * (y*data.width + x);
            
            const dx =2*x/data.width - 1;
            const dy =2*y/data.height - 1;
            const dd = dx*dx + dy*dy;
            
            // alpha component
            pixels[offset + 3] = Math.floor(150 * Math.max(1-dd, 0));
        }
    }
 
    brush_ctx.putImageData(data, 0, 0);
}

function createColorCtx(color, brush_img) {
    const c = document.createElement("canvas");
    c.width = 50;
    c.height = 50;
    c.style = "border: 2px solid black; margin: 2px";
    const c_ctx = c.getContext('2d');
    c_ctx.fillStyle = color;
    c_ctx.fillRect(0, 0, c_ctx.canvas.width, c_ctx.canvas.height);
    c_ctx.globalCompositeOperation = "destination-in";
    c_ctx.drawImage(brush_img, 0, 0, c_ctx.canvas.width, c_ctx.canvas.height);
    return c_ctx;
}