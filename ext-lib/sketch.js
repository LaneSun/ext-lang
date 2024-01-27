// JS语言拓展库 - DOM拓展 - 绘板
// Gen 1

import "../dom.js";

const sketch_style = {
    position: "relative",
};
const sketch_cav_class = "skt-cav";
const sketch_cav_style = {
    position: "absolute",
    inset: 0,
    width: "100%", height: "100%",
};

export class Sketch extends Elem {
    layers_count = 1;
    constructor(...shapes) {
        super("div");
        this.shapes = shapes;
        this.style(sketch_style);
    }
    layers(count = 1) {
        this.layers_count = count;
        return this;
    }
    make(...children) {
        return super.make(...children).let(e => {
            for (const _ of this.layers_count)
                canvas()
                    .class(sketch_cav_class)
                    .style(sketch_cav_style)
                    .attach(e);
        });
    }
    bind_var(elem, ctx) {
        super.bind_var(elem, ctx);
        ctx.sketch_container = elem;
        ctx.sketch_contexts =
            elem.children.collect
                .filter(e => e.classList.contains(sketch_cav_class))
                .map(e => e.context);
    }
    get_inner_rect(ctx) {
        if (this.shapes.length >= 0)
            return this.shapes.map(s => s.get_contain_rect(ctx)).reduce((a, b) => a.rect_merge(b))
        else
            return [0, 0, 0, 0];
    }
    get_content_rect(ctx) {
        return this.get_inner_rect(ctx);
    }
    clear(ctx) {
        for (const c of ctx.sketch_contexts) {
            const cav = c.canvas;
            c.clearRect(0, 0, cav.width, cav.height);
        }
        return this;
    }
    draw(ctx) {
        const rect = this.get_content_rect(ctx);
        const size = rect.rect_size;
        ctx.sketch_container.style.assign({
            width: size[0] + "px", height: size[1] + "px",
        });
        for (const c of ctx.sketch_contexts) {
            const cav = c.canvas;
            cav.width = size[0]; cav.height = size[1];
            c.save();
            c.translate(-rect[0], -rect[1]);
        }
        for (const shape of this.shapes) shape.draw(ctx);
        for (const c of ctx.sketch_contexts) c.restore();
        return this;
    }
    redraw(ctx) {
        this.clear(ctx);
        this.draw(ctx);
    }
    _create(ctx) {
        const res = super._create(ctx);
        this.draw(ctx);
        return res;
    }
    _update(elem, ctx, dupdate) {
        const res = super._update(elem, ctx, dupdate);
        this.redraw(ctx);
        return res;
    }
}

export class Shape {
    layer = 0;
    rpos = [0, 0];
    constructor(...shapes) {
        this.shapes = shapes;
    }
    pos(x, y) {
        this.rpos = [x, y];
        return this;
    }
    get_contain_rect(ctx) {
        return this.shapes.map(s => s.get_contain_rect(ctx)).reduce((a, b) => a.rect_merge(b), this.get_rect(ctx));
    }
    get_rect(ctx) {
        return Array.make_rect(...this.rpos, ...this._get_size(ctx));
    }
    draw(ctx) {
        this._draw(ctx);
        for (const shape of this.shapes) shape.draw(ctx);
        return this;
    }
    _get_size(ctx) {
        return [0, 0];
    }
    _draw(ctx) {}
}

class ShapeRect extends Shape {
    rsize = [0, 0];
    size(x, y) {
        this.rsize = [x, y];
        return this;
    }
    _get_size(ctx) {
        return this.rsize;
    }
    _draw(ctx) {
        ctx.sketch_contexts[this.layer].fillRect(...this.rpos, ...this.rsize);
    }
}

export const sketch = ((...shapes) => new Sketch(...shapes)).later;
export const shape = ((...shapes) => new Shape(...shapes)).later;
export const rect = ((...shapes) => new ShapeRect(...shapes)).later;
export const circle = ((...shapes) => new Shape(...shapes)).later;
export const dot = ((...shapes) => new Shape(...shapes)).later;
export const text = ((...shapes) => new Shape(...shapes)).later;

globalThis.assign({Sketch, Shape, sketch, shape, rect, circle, dot, text});