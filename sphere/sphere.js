function makeSphere(r, c) {    
    let o = [0, 0, 0];
    let a = [1, 0, 0];
    let b = [0, 1, 0];
    let v1 = turn([1, 0], a, b, rad(30));
    let v2 = turn(v1.slice(0, 2), a, b, rad(30));

    console.log(v1, v2);

    return Float32Array.from(
        point(o).concat(point(a)).concat(point(v1))
        .concat(point(o)).concat(point(v1)).concat(point(v2))
    );
}

function point(vec, i=-1) {
    return [...vec, i]
}

function rad(degree) {
    return degree * Math.PI / 180;
}

function geo(v1, v2) {
    const [a, b, c] = math.cross(v1, v2);
    return [a, -b, c];
}

function fromVec(v, a, b) {
    const [v1, v2] = v;
    const [a1, a2, a3] = a;
    const [b1, b2, b3] = b;

    return [(v1*a1 + v2*b1), (v1*a2 + v2*b2), (v1*a3 + v2+b3)];
}

function turn(v, a, b, angle) {
    const [v1, v2] = v;
    const [a1, a2, a3] = a;
    const [b1, b2, b3] = b;

    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const alpha = (v1*a1 + v2*b1);
    const betta = (v1*a2 + v2*b2);
    const gamma = (v1*a3 + v2*b3);
    const delta = (a2*b1 - a1*b2);
    const omega = (a3*b1 - a1*b3);
    const ro    = (a3*b2 - a2*b3);

    return [(alpha*cos - sin*(betta*delta + gamma*omega)),
            (betta*cos - sin*(alpha*delta - gamma*ro   )),
            (gamma*cos - sin*(alpha*omega + betta*ro   ))];
}