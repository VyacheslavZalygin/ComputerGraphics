function makeSphere(count) {    
    const center = [0, 0, 0];

    let vertexes = [[[1, 0, 0]]];
    const step = Math.PI * 2 / count;
    for (let j = 1; j < count; j += 1) {
        vertexes[0].push(turnInDefaultPlane(vertexes[0][j-1], step));
    }
    for (let i = 1; i < count; i += 1) {
        vertexes.push([]);
        for (let j = 0; j < count; j += 1) {
            vertexes[i].push(turnInArea(vertexes[i-1][j], step));
        }
    }

    return makeTriangles(center, vertexes[0]);
}

function makeTriangles(center, vertexes) {
    let res = [];
    const len = vertexes.length;
    for (let i = 0; i < len; i += 1) {
        const v1 = vertexes[i];
        const v2 = vertexes[(i+1) % len];
        res = res.concat(point(center)).concat(point(v1)).concat(point(v2));
    }

    return Float32Array.from(res);
}

function point(vec, i=2) {
    return [...vec, i]
}

function rad(degree) {
    return degree * Math.PI / 180;
}

function geo(a, b) {
    const [a1, a2, a3] = a;
    const [b1, b2, b3] = b;
    return [(a1*b2-a2*b1), (a1*b3-a3*b1), (a2*b3-a3*b2)];
}

function turnInDefaultPlane(v, angle) {
    const sin = Math.sin(angle);
    const cos = Math.cos(angle);
    const [v1, v2, v3] = v;

    return [(v1*cos - v2*sin), (v2*cos + v1*sin), (v3*cos)];
}   

// Предполагается, что вращение происходит вокруг оси {0, 1, 0}
function turnInArea(v, angle) {
    const sin = Math.sin(angle/2);
    const cos = Math.cos(angle/2);

    const [v1, v2, v3] = v;
    const alpha = v1*cos + v3*sin;
    const betta = v2*cos;
    const gamma = v3*cos - v1*sin; 

    return [(alpha*cos+gamma*sin), (betta*cos), (gamma*cos - alpha*sin)];
}