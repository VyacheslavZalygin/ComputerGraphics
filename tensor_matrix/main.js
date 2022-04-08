import renderMathInElement from "https://cdn.jsdelivr.net/npm/katex@0.15.3/dist/contrib/auto-render.mjs";

const INPUT = document.getElementById("input");
const CONTAINER = document.getElementById("container");

document.getElementById("button").onclick = drawMath;

function drawMath() {
    CONTAINER.innerHTML = generateMatrix(INPUT.value);
    renderMathInElement(CONTAINER);
}

function generateMatrix(dimen) {
    let matrix = `$$\\begin{matrix} & `;
    for (let i = 0; i < dimen; i++) {
        matrix += `e_${}`;
    }
    return matrix;
        `$$
        \\begin{matrix}
        & a & b \\\\ c & d
        \\end{matrix}
        $$`;
}

function basis

function computeElement(a, b) {
    return "e_{-1}";
}

drawMath();