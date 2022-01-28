window.onload = () => {
    // TODO: change brush
    let brush = document.getElementById("brush");

    const canvas = document.getElementById("canvas");
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext("2d");
    
    const inp = document.getElementById("input");
    let size = inp.value;
    inp.oninput = event => {
        size = inp.value;
    };

    clearCanvas(ctx);

    const getMouseCoords = event => {
        const {x, y} = canvas.getBoundingClientRect();
        return [event.clientX - x, event.clientY - y];
    };

    let prevX = null;
    let prevY = null;

    canvas.onmousedown = event => {
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