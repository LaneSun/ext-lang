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
    rshapes = [];
    constructor(...items) {
        super("div", ...items);
        this.style(sketch_style);
    }
    shapes(...shapes) {
        this.rshapes = this.rshapes.concat(shapes);
        return this;
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
        if (this.rshapes.length >= 0)
            return this.rshapes.map(s => s.get_contain_rect(ctx)).reduce((a, b) => a.rect_merge(b))
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
            // cav.style.imageRendering = "crisp-edges";
            // c.imageSmoothingEnabled = false;
            cav.width = size[0]; cav.height = size[1];
            c.save();
            c.translate(-rect[0], -rect[1]);
        }
        for (const shape of this.rshapes) shape.draw(ctx);
        for (const c of ctx.sketch_contexts) c.restore();
        return this;
    }
    redraw(ctx) {
        this.clear(ctx);
        this.draw(ctx);
        return this;
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
    rlayer = 0;
    rpos = [0, 0];
    rcenter = [0, 0];
    constructor(...shapes) {
        this.shapes = shapes;
    }
    layer(layer = 0) {
        this.rlayer = layer;
        return this;
    }
    pos(x, y) {
        this.rpos = [x, y];
        return this;
    }
    center(x = 0.5, y = 0.5) {
        this.rcenter = [x, y];
        return this;
    }
    get_spos(ctx) {
        const size = this._get_size();
        return [this.rpos[0] - this.rcenter[0] * size[0], this.rpos[1] - this.rcenter[1] * size[1]];
    }
    get_contain_rect(ctx) {
        return this.shapes
            .map(s => s.get_contain_rect(ctx))
            .reduce((a, b) => a.rect_merge(b), this.get_rect(ctx))
            .rect_move(...this.get_spos(ctx));
    }
    get_rect(ctx) {
        return [0, 0, ...this._get_size(ctx)];
    }
    draw(ctx) {
        const [sx, sy] = this.get_spos(ctx);
        for (const c of ctx.sketch_contexts) c.translate(sx, sy);
        this._draw(ctx.sketch_contexts[this.rlayer], ctx);
        for (const shape of this.shapes) shape.draw(ctx);
        for (const c of ctx.sketch_contexts) c.translate(-sx, -sy);
        return this;
    }
    _get_size(ctx) {
        return [0, 0];
    }
    _draw(pen, ctx) {}
}

class ShapePath extends Shape {
    rfill = null;
    rstroke = null;
    rshadow = null;
    fill(color = "#000000") {
        this.rfill = color;
        return this;
    }
    stroke(color = "#000000", width_outset = 1, width_inset = 0) {
        this.rstroke = [color, width_outset, width_inset];
        return this;
    }
    shadow(color = "#000000", blur = 4, offset_x = 0, offset_y = 0) {
        this.rshadow = [color, blur, offset_x, offset_y];
        return this;
    }
    get_contain_rect(ctx) {
        if (this.rstroke)
            return super.get_contain_rect(ctx).rect_grow(this.rstroke[1]);
        else
            return super.get_contain_rect(ctx);
    }
    _draw(pen, ctx) {
        if (this.rshadow) {
            pen.save();
            pen.shadowColor = this.rshadow[0];
            pen.shadowBlur = this.rshadow[1];
            pen.shadowOffsetX = this.rshadow[2];
            pen.shadowOffsetY = this.rshadow[3];
        }
        if (this.rfill) {
            pen.fillStyle = this.rfill;
            pen.fill(this._get_fill_path(pen, ctx));
        }
        if (this.rstroke) {
            pen.strokeStyle = this.rstroke[0];
            pen.lineWidth = this.rstroke[1] + this.rstroke[2];
            pen.stroke(this._get_stroke_path((this.rstroke[1] - this.rstroke[2]) / 2, pen, ctx));
        }
        if (this.rshadow) pen.restore();
    }
}

class ShapeRect extends ShapePath {
    rsize = [0, 0];
    size(x, y) {
        this.rsize = [x, y];
        return this;
    }
    _get_size() {
        return this.rsize;
    }
    _get_fill_path() {
        const path = new Path2D();
        path.rect(0, 0, ...this.rsize);
        return path;
    }
    _get_stroke_path(offset) {
        const path = new Path2D();
        path.rect(...[0, 0, ...this.rsize].rect_grow(offset).rect_box);
        return path;
    }
}

class ShapeCicle extends ShapePath {
    rradius = 0;
    rcenter = [0.5, 0.5];
    radius(r) {
        this.rradius = r;
        return this;
    }
    _get_size() {
        return [this.rradius * 2, this.rradius * 2];
    }
    _get_fill_path() {
        const radius = this.rradius;
        const path = new Path2D();
        path.arc(radius, radius, radius, 0, TAU);
        return path;
    }
    _get_stroke_path(offset) {
        const radius = this.rradius;
        const path = new Path2D();
        path.arc(radius, radius, radius + offset, 0, TAU);
        return path;
    }
}

class ShapeText extends Shape {
    rcontent = "";
    rfont = "16px monospace";
    rcolor = "#000000";
    rmetrics = null;
    content(content = "") {
        this.rcontent = content;
        return this;
    }
    font(font = "16px monospace") {
        this.rfont = font;
        return this;
    }
    color(color = "#000000") {
        this.rcolor = color;
        return this;
    }
    _get_size(ctx) {
        if (this.rmetrics === null) {
            const c = ctx.sketch_contexts[this.rlayer];
            c.save();
            this._apply_style(c);
            this.rmetrics = c.measureText(this.rcontent);
            c.restore();
        }
        return [
            this.rmetrics.actualBoundingBoxLeft + this.rmetrics.actualBoundingBoxRight,
            this.rmetrics.actualBoundingBoxAscent + this.rmetrics.actualBoundingBoxDescent,
        ];
    }
    _apply_style(pen) {
        pen.font = this.rfont;
    }
    _get_fill_path() {
        const path = new Path2D();
        path.rect(0, 0, ...this.rsize);
        return path;
    }
    _get_stroke_path(offset) {
        const path = new Path2D();
        path.rect(...[0, 0, ...this.rsize].rect_grow(offset).rect_box);
        return path;
    }
    _draw(pen, ctx) {
        pen.save();
        this._apply_style(pen);
        pen.fillStyle = this.rcolor;
        pen.fillText(this.rcontent, this.rmetrics.actualBoundingBoxLeft, this.rmetrics.actualBoundingBoxAscent);
        pen.restore();
    }
}

export const sketch = ((...shapes) => new Sketch(...shapes)).later;
export const shape = ((...shapes) => new Shape(...shapes)).later;
export const rect = ((...shapes) => new ShapeRect(...shapes)).later;
export const circle = ((...shapes) => new ShapeCicle(...shapes)).later;
export const dot = ((...shapes) => new Shape(...shapes)).later;
export const text = ((...shapes) => new ShapeText(...shapes)).later;

globalThis.assign({Sketch, Shape, sketch, shape, rect, circle, dot, text});