// JS语言拓展库 - 颜色类型拓展
// Gen 1

import "./core.js";

export class Color {
    static rgb2hsl = (r, g, b, a = 1) => {
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const c = max - min;
        const lum = (min + max) / 2;
        let hue, sat, segment, shift;
        if (c === 0) {
            hue = 0;
            sat = 0;
        } else {
            sat = c / (1 - Math.abs(2 * lum - 1));
            switch(max) {
                case r:
                    segment = (g - b) / c;
                    shift = segment < 0 ? 360 / 60 : 0 / 60;
                    hue = segment + shift;
                    break;
                case g:
                    segment = (b - r) / c;
                    shift = 120 / 60;
                    hue = segment + shift;
                    break;
                case b:
                    segment = (r - g) / c;
                    shift = 240 / 60;
                    hue = segment + shift;
                    break;
            }
        }
        return [hue * 60, sat, lum, a];
    }
    static hsl2rgb = (h, s, l, a = 1) => {
        const b = s * Math.min(l, 1 - l);
        const f = (n, k = (n + h / 30) % 12) => l - b * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return [f(0), f(8), f(4), a];
    }
    static rgb2hex = (r, g, b, a = 1) => {
        return '#' + [r, g, b, a].map(x => Math.round(x * 255).toString(16).padStart(2, '0')).join('');
    }
    static hex2rgb = (hex) => {
        const [r, g, b, a] = hex.slice(1).match(/../g).map(h => Number.parseInt(h, 16) / 255);
        return [r, g, b, a ?? 1];
    }
    constructor(r, g, b, a) {
        this.raw = Color.rgb2hsl(r, g, b, a);
    }
    toString() {
        return Color.rgb2hex(...Color.hsl2rgb(...this.raw));
    }
}

export const rgb = (r_hex = 255, g = 255, b = 255, a = 1) =>
    typeof r_hex === "string" ?
        new Color(...Color.hex2rgb(r_hex)) :
        new Color(r_hex / 255, g / 255, b / 255, a);

export const hsl = (h, s, l, a = 1) =>
    new Color(...Color.hsl2rgb(h, s, l, a));

globalThis.assign({rgb, hsl});
