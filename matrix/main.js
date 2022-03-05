onload = () => {
    const canvas = document.createElement('canvas');
    document.body.appendChild(canvas);
    canvas.width = 600;
    canvas.height = 600;

    const ctx = canvas.getContext('2d');

    const drawFrame = t => {
        ctx.setTransform();
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    
        ctx.setTransform(1, 0, 0, 1, 0, -10);
        const globalCos = Math.cos(t/1000);
        const globalSin = Math.sin(t/1000);
        ctx.transform(globalCos, globalSin, -globalSin, globalCos, canvas.width/2, canvas.height/2);   
        for (let i = 0; i < 5; i++) {
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, 50, 20-2*i);   
            ctx.transform(globalCos, globalSin, -globalSin, globalCos, 50, 10+i); 
            ctx.transform(1, 0, 0, 1, 0, -(10-i-1));    
        }
    
        requestAnimationFrame(drawFrame);
    };

    requestAnimationFrame(drawFrame);
}