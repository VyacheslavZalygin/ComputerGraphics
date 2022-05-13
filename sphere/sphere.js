function makeSphere(r, c) {
    // const v0 = [-1, -1, -1, 0];
    // const v1 = [-1, -1,  1, 1];
    // const v2 = [-1,  1, -1, 2];
    // const v3 = [-1,  1,  1, 3];
    // const v4 = [1,  -1, -1, 4];
    // const v5 = [1,  -1,  1, 5];
    // const v6 = [1,   1, -1, 6];
    // const v7 = [1,   1,  1, 7];

    // return Float32Array.from(
    //     v0.concat(v1).concat(v2)
    //     .concat(v1).concat(v2).concat(v3)
    //     .concat(v0).concat(v1).concat(v4)
    //     .concat(v1).concat(v4).concat(v5)
    //     .concat(v0).concat(v2).concat(v4)
    //     .concat(v2).concat(v4).concat(v6)
    //     .concat(v7).concat(v3).concat(v6)
    //     .concat(v3).concat(v6).concat(v2)
    //     .concat(v7).concat(v5).concat(v3)
    //     .concat(v5).concat(v3).concat(v1)
    //     .concat(v7).concat(v5).concat(v6)
    //     .concat(v5).concat(v6).concat(v4)
    // );
    
    const o =  [0, 0, 0];
    const v1 = [1, 0, 0];
    const v2 = from(radians(30), v1);

    return Float32Array.from(
        o.concat(v1).concat(v2)
    );
}

function from(rad, vec) {
    const [a, b, c] = vec;
    const sin = Math.sin(rad);
    const cos = Math.cos(rad);
    return [a*sin, b*cos, с];
}

function add(v1, v2) {
    const [a, b, c] = v1;
    const [d, e, f] = v2;
    return [a+d, b+e, c+f];
}

function len(vec) {

}


function radians(degree) {
    return degree * Math.PI / 180;
}