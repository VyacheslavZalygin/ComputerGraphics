import renderMathInElement from "https://cdn.jsdelivr.net/npm/katex@0.15.3/dist/contrib/auto-render.mjs";

const INPUT = document.getElementById("input");
const CONTAINER = document.getElementById("container");

document.getElementById("button").onclick = drawMath;

function drawMath() {
  CONTAINER.innerHTML = generateMatrix(INPUT.value);
  renderMathInElement(CONTAINER);
}

function generateMatrix(dimen) {
  let matrix = `$$\\begin{matrix}`;
  const basis = generateBasis(Array.from({ length: dimen }, (_, i) => i + 1)).slice(1);
  
  basis.forEach(v => {
    matrix += `& ${withE(v)}`;
  });
  matrix += `\\\\`;
  basis.forEach(a => {
    matrix += `${withE(a)}`;
    basis.forEach(b => {
      matrix += `& ${withE(computeElement(a, b))}`;
    });
    matrix += `\\\\`;
  });

  matrix += `\\end{matrix}$$`;
  return matrix;
}

function withE(v) {
  let minus = ``;
  if (v < 0) minus = `-`
  if (v !== '') return minus + `e_{${Math.abs(v)}}`;
  return minus + "e";
}

function generateBasis(dimen) {
  // 3 -> 1, 2, 3, 12, 13, 23, 123
  let res = [""];
  for (let i = 0; i < dimen.length; i += 1) {
    const head = dimen[i];
    // res.push(head.toString())
    for (const tail of generateBasis(dimen.filter((_, index) => index > i))) {
      res.push(head.toString() + tail.toString());
    }
  }
  res.sort((a, b) => {
    a = parseInt(a);
    b = parseInt(b);
    if (a > b) return 1;
    if (a < b) return -1;
    return 0;
  });
  return res;
}

function computeElement(a, b) {
  let arr = a.split(``).map(v => parseInt(v)).concat(b.split(``).map(v => parseInt(v)));
  let count = 0;
  
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr.length; j++) {
      if (arr[j] > arr[j + 1]) {
	      let tmp = arr[j];
	      arr[j] = arr[j + 1];
	      arr[j + 1] = tmp;
        count += 1;
	    }
	  }
  }
  
  for (let i = 0; i < arr.length-1; i++) {
    if (arr[i] === arr[i+1]) {
      arr[i] = null;
      arr[i+1] = null;
    }
  }
  arr = arr.filter(v => v !== null);
  if (arr.length === 0) return ``;

  let res = parseInt(arr.join(``));
  if (count % 2 != 0) res *= -1;
  return res;
}

drawMath();
