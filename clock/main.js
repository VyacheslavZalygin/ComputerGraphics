onload = () => { 
    const canvas = document.createElement('canvas');
    document.body.appendChild(canvas);
    canvas.width = 300;
    canvas.height = 300;
    
    const ctx = canvas.getContext('2d');

    const drawFrame = t => {
        ctx.setTransform();
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        for (let i = 0; i < 12; i++) {
            const sin = Math.sin(i*Math.PI/6);
            const cos = Math.cos(i*Math.PI/6);
            ctx.setTransform(sin, cos, -cos, sin, 150, 150);
            ctx.transform(1, 0, 0, 1, -5, 120);
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, 10, 20);
        }

        let time = new Date();

        // hours 
        {
            ctx.setTransform();
            const angle = Math.PI/6*(6+time.getHours());
            const sin = Math.sin(angle);
            const cos = Math.cos(angle);
            ctx.setTransform(cos, sin, -sin, cos, 150, 150);
            ctx.transform(1, 0, 0, 1, -7.5, 0);
            ctx.fillStyle = 'red';
            ctx.fillRect(0, 0, 15, 40);
        }

        // minutes
        {
            ctx.setTransform();
            const angle = Math.PI/30*(30+time.getMinutes());
            const sin = Math.sin(angle);
            const cos = Math.cos(angle);
            ctx.setTransform(cos, sin, -sin, cos, 150, 150);
            ctx.transform(1, 0, 0, 1, -5, 0);
            ctx.fillStyle = 'yellow';
            ctx.fillRect(0, 0, 10, 70);
        }
        
        // seconds
        {
            ctx.setTransform();
            const angle = Math.PI/30*(30+time.getSeconds());
            const sin = Math.sin(angle);
            const cos = Math.cos(angle);
            ctx.setTransform(cos, sin, -sin, cos, 150, 150);
            ctx.transform(1, 0, 0, 1, -2, 0);
            ctx.fillStyle = 'rgb(100, 150, 30)';
            ctx.fillRect(0, 0, 4, 100);        
        }
        
        requestAnimationFrame(drawFrame);
    };

    requestAnimationFrame(drawFrame);
};