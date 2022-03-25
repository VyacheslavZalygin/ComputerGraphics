onload = () => {
  let time_ms = Date.now();
  let tick = 17;

  const canvas = document.createElement("canvas");
  document.body.appendChild(canvas);
  canvas.width = 300;
  canvas.height = 300;
  const ctx = canvas.getContext("2d");

  const timeScale = document.getElementById("timescale");
  const timeInput = document.getElementById("timeinput");
  timeScale.oninput = (event) => {
    tick = parseInt(timeScale.value);
    timeInput.value = tick;
  };
  timeInput.value = tick;
  timeInput.oninput = (event) => {
    if (timeInput.value !== "") {
      tick = parseInt(timeInput.value);
      timeScale.value = tick;
    }
  };

  const drawFrame = (t) => {
    let time = new Date(time_ms);
    ctx.setTransform();
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < 12; i++) {
      const sin = Math.sin(Math.PI * i / 6);
      const cos = Math.cos(Math.PI * i / 6);
      ctx.setTransform(sin, cos, -cos, sin, 150, 150);
      ctx.transform(1, 0, 0, 1, -5, 120);
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, 10, 20);
    }

    // hours
    {
      ctx.setTransform();
      const angle = (Math.PI / 6) * (6 + (time.getHours() + time.getMinutes()/60));
      const sin = Math.sin(angle);
      const cos = Math.cos(angle);
      ctx.setTransform(cos, sin, -sin, cos, 150, 150);
      ctx.transform(1, 0, 0, 1, -15/2, 0);
      drawTriangle(ctx, 15, 40, "red");
    }

    // minutes
    {
      ctx.setTransform();
      const angle = (Math.PI / 30) * (30 + time.getMinutes());
      const sin = Math.sin(angle);
      const cos = Math.cos(angle);
      ctx.setTransform(cos, sin, -sin, cos, 150, 150);
      ctx.transform(1, 0, 0, 1, -10/2, 0);
      drawTriangle(ctx, 10, 70, "yellow");
    }

    // seconds
    {
      ctx.setTransform();
      const angle = (Math.PI / 30) * (30 + time.getSeconds());
      const sin = Math.sin(angle);
      const cos = Math.cos(angle);
      ctx.setTransform(cos, sin, -sin, cos, 150, 150);
      ctx.transform(1, 0, 0, 1, -2, 0);
      drawTriangle(ctx, 4, 100, "rgb(100, 150, 30)")
    }

    time_ms += tick;

    requestAnimationFrame(drawFrame);
  };

  requestAnimationFrame(drawFrame);
};

function drawTriangle(ctx, x, y, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(x/2, y);
    ctx.lineTo(x, 0);
    ctx.fill();
}