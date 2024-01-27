// JS语言拓展库 - 数学拓展
// Gen 1

import {ext_alias, ext_reader} from "./core.js";

ext_alias(Number.prototype, {
    clamp(min, max) {
        return Math.max(min, Math.min(max, this));
    },
    imul(b) {
        return Math.imul(this, b);
    },
    pow(exponent) {
        return Math.pow(this.exponent);
    },
});

ext_alias(Array.prototype, {
    rect_merge(target) {
        return [
            Math.min(this[0], target[0]),
            Math.min(this[1], target[1]),
            Math.max(this[2], target[2]),
            Math.max(this[3], target[3]),
        ];
    },
});

ext_reader(Array.prototype, {
    rect_size() {
        return [this[2] - this[0], this[3] - this[1]];
    },
});

ext_alias(Array, {
    make_rect(x, y, w, h) {
        return [x, y, x + w, y + h];
    },
});

ext_reader(Number.prototype, {
    abs() { return Math.abs(this); },
    acos() { return Math.acos(this); },
    acosh() { return Math.acosh(this); },
    asin() { return Math.asin(this); },
    asinh() { return Math.asinh(this); },
    atan() { return Math.atan(this); },
    atanh() { return Math.atanh(this); },
    cbrt() { return Math.cbrt(this); },
    ceil() { return Math.ceil(this); },
    clz32() { return Math.clz32(this); },
    cos() { return Math.cos(this); },
    cosh() { return Math.cosh(this); },
    exp() { return Math.exp(this); },
    expm1() { return Math.expm1(this); },
    floor() { return Math.floor(this); },
    fround() { return Math.fround(this); },
    ln() { return Math.log(this); },
    log1p() { return Math.log1p(this); },
    log2() { return Math.log2(this); },
    log10() { return Math.log10(this); },
    round() { return Math.round(this); },
    sign() { return Math.sign(this); },
    sin() { return Math.sin(this); },
    sinh() { return Math.sinh(this); },
    sqrt() { return Math.sqrt(this); },
    tan() { return Math.tan(this); },
    tanh() { return Math.tanh(this); },
    trunc() { return Math.trunc(this); },
});

globalThis.assign({
    PI: Math.PI,
    TAU: Math.PI * 2,
    SQRT1_2: Math.SQRT1_2,
    SQRT2: Math.SQRT2,
    LN2: Math.LN2,
    LN10: Math.LN10,
    LOG2E: Math.LOG2E,
    LOG10E: Math.LOG10E,
    INF: Infinity,
});