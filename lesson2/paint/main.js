const SIZE = 600;

// Попробовать анимировать
onload = () => {
    const canvas = document.getElementById('CANVAS');
    canvas.width = SIZE;
    canvas.height = SIZE;

    const ctx = canvas.getContext('2d');

    ctx.fillStyle = `black`;
    ctx.fillRect(0, 0, SIZE, SIZE);

    let posX = SIZE/2;
    let posY = SIZE/2;
    let size = 11;
    let step = 0.001;
    let color = 0;
    for (let i = 0; i < 100500; i += 1) {
        ctx.fillStyle = `rgb(100,100,${Math.floor(color)})`;
        ctx.fillRect(posX-size/2, posY-size/2, size, size)
        const dirX = Math.cos(i/1000 + Math.PI);
        const dirY = Math.sin(i/1000);
        posX += dirX*step;
        posY += dirY*step;

        step += 0.00001;
        size += 0.0001;
        color += 255/50000;
    }
};