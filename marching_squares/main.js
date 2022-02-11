let CTX = null;
onload = () => {
  const canvas = document.getElementById("CANVAS");
  const ctx = canvas.getContext("2d");
  CTX = ctx;

  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  main();
};

function main() {
    const size = 50;
    const r = size*1.5;
    const grid = newGrid(CTX, size);

    const getMouseCoords = event => {
        const {x, y} = CTX.canvas.getBoundingClientRect();
        return [event.clientX - x, event.clientY - y];
    };

    CTX.canvas.onclick = e => {
        const [x, y] = getMouseCoords();
        grid.applyInfluence(x, y, r);
    };
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

function newGrid(ctx, cellSide) {
  const ncols = Math.ceil(ctx.canvas.width / cellSide) + 1;
  const nrows = Math.ceil(ctx.canvas.height / cellSide) + 1;

  const nodeValues = [];
  for (let x = 0; x < ncols; x++) {
    for (let y = 0; y < nrows; y++) {
      nodeValues.push(0);
    }
  }

  const getIndex = (numX, numY) => numX * nrows + numY;

  return {
    cellSide,
    nodeValues,
    ncols,
    nrows,

    getNode: (numX, numY) => {
      if (numX < 0 || numX >= ncols) {
        throw `wrong numX: ${numX}`;
      }
      if (numY < 0 || numY >= nrows) {
        throw `wrong numY: ${numY}`;
      }

      const x = numX * cellSide;
      const y = numY * cellSide;

      return { x, y, value: nodeValues[getIndex(numX, numY)] };
    },

    applyInfluence: (pointX, pointY, r, f) => {
      if (f === undefined) {
        const rr = r * r;

        f = (dd) => {
          if (rr >= dd) {
            return (rr - dd) / rr;
          }
          return 0;
        };
      }

      const minX = Math.floor((pointX - r) / cellSide);
      const minY = Math.floor((pointY - r) / cellSide);
      const maxX = Math.ceil((pointX + r) / cellSide);
      const maxY = Math.ceil((pointY + r) / cellSide);

      for (let numX = minX; numX <= maxX; numX++) {
        for (let numY = minY; numY <= maxY; numY++) {
          const x = numX * cellSide;
          const y = numY * cellSide;
          const dx = pointX - x;
          const dy = pointY - y;
          const dd = dx * dx + dy * dy;

          nodeValues[getIndex(numX, numY)] += f(dd);
        }
      }
    },

    clearGrid: () => {
      for (let i = 0; i < nodeValues.length; i++) {
        nodeValues[i] = 0;
      }
    },
  };
}

/*
0 --0-- 1
|       |
3       1
|       |
3 --2-- 2
*/

const SEGMENT_TABLE = [
  /* 0 */ [[]], // нет таких
  /* 1 */ [[3, 0]], // 0
  /* 2 */ [[0, 1]], // 1
  /* 3 */ [[1, 3]], // 0 1
  /* 4 */ [[2, 1]], // 2
  /* 5 */ [[0, 1], [3, 2]], // 0 2
  /* 6 */ [[0, 2]], // 1 2
  /* 7 */ [[3, 2]], // 0 1 2
  /* 8 */ [[3, 2]], // 3
  /* 9 */ [[0, 2]], // 0 3
  /* 10 */ [[0, 3], [2, 1]], // 1 3
  /* 11 */ [[2, 1]], // 0 1 3
  /* 12 */ [[3, 1]], // 2 3
  /* 13 */ [[0, 1]], // 0 2 3
  /* 14 */ [[3, 0]], // 1 2 3
  /* 15 */ [[]], // 0 1 2 3
];

const SEGMENT_TO_VERTICES = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 0],
];

function getSegments(points, threshold) {
  let index = 0;
  if (points[0].value > threshold) { index |= 1; }
  if (points[1].value > threshold) { index |= 2; }
  if (points[2].value > threshold) { index |= 4; }
  if (points[3].value > threshold) { index |= 8; }

  const getMidpoint = (i, j) => {
    const vi = Math.abs(points[i].value - threshold);
    const vj = Math.abs(points[j].value - threshold);
    return vi / (vi + vj); // плохая формула
  };

  const answer = [];

  for (const segment of SEGMENT_TABLE[index]) {
    const [side1, side2] = segment;
    const [i11, i12] = SEGMENT_TO_VERTICES[side1];
    const [i21, i22] = SEGMENT_TO_VERTICES[side2];
    const m1 = getMidpoint(i11, i12);
    const m2 = getMidpoint(i21, i22);

    const v11 = points[i11];
    const v12 = points[i12];
    const v21 = points[i21];
    const v22 = points[i22];

    answer.push([
      {
        x: v11.x * (1 - m1) + v12.x * m1,
        y: v11.y * (1 - m1) + v12.y * m1,
      },
      {
        x: v21.x * (1 - m2) + v22.x * m2,
        y: v21.y * (1 - m2) + v22.y * m2,
      },
    ]);
  }

  return answer;
}
