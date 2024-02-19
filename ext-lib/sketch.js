// JS语言拓展库 - DOM拓展 - 绘板
// Gen 1

import "../dom.js";

const _cvt_shape = obj =>
    obj instanceof Shape ? obj :
     typeof obj === "string" || typeof obj === "number" ? text().content(obj.toString()) :
    new Shape();

const sketch_style = {
    position: "relative",
};
const sketch_listener = elem => ({
    mousemove(event) {
        const {offsetX: x, offsetY: y} = event;
        let carea = null;
        for (const area of this.areas) {
            if (area.rect.rect_has(x, y)) {
                carea = area;
            }
        }
        if (this.cur_area?.opt !== carea?.opt) {
            let need_redraw = carea?.opt.need_redraw || this.cur_area?.opt.need_redraw
            this.style.cursor = carea ? (carea.opt.cursor ?? "pointer") : null;
            if (carea) carea.shape.changed = true;
            if (this.cur_area) this.cur_area.shape.changed = true;
            this.cur_area = carea;
            if (need_redraw) elem.update(this);
        }
    },
});
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
        this
            .style(sketch_style)
            .on(sketch_listener(this));
        this.dupdate = Sketch.update_redraw;
    }
    shapes(...shapes) {
        this.rshapes = this.rshapes.concat(shapes.map(_cvt_shape));
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
            return this.rshapes
                .map(s => s
                    .get_contain_rect(ctx)
                    .rect_move(...s.get_spos(ctx)))
                .reduce((a, b) => a.rect_merge(b));
        else
            return [0, 0, 0, 0];
    }
    get_content_rect(ctx) {
        return this.get_inner_rect(ctx);
    }
    clear(ctx) {
        ctx.areas = [];
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
        ctx.sketch_container.areas = ctx.areas;
        return this;
    }
    redraw(ctx) {
        this.clear(ctx);
        this.draw(ctx);
        return this;
    }
    _create(ctx) {
        const res = super._create(ctx);
        this.clear(ctx);
        this.draw(ctx);
        return res;
    }

    static update_redraw = (self, elem, ctx, dupdate) => {
        self.redraw(ctx);
        return elem;
    };
}

export class Shape {
    rarea = [];
    rlayer = 0;
    rpos = [0, 0];
    rcenter = [0, 0];
    changed = true;
    ccontain_rect = null;
    cspos = null;
    crect = null;
    constructor(...shapes) {
        this.shapes = shapes.map(_cvt_shape);
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
    area(...opts) {
        for (const opt of opts)
            if (opt.items) opt.items = opt.items.map(_cvt_shape);
        this.rarea.push(...opts);
        return this;
    }
    get_shapes(ctx) {
        let shapes = this.shapes;
        for (const opt of this.rarea) {
            if (ctx.sketch_container.cur_area?.opt === opt) {
                if (opt.items) shapes = shapes.concat(opt.items);
            }
        }
        return shapes;
    }
    get_spos(ctx) {
        if (this.changed) {
            const size = this._get_size();
            this.cspos = [this.rpos[0] - this.rcenter[0] * size[0], this.rpos[1] - this.rcenter[1] * size[1]];
        }
        return this.cspos;
    }
    get_contain_rect(ctx) {
        if (this.changed)
            this.ccontain_rect = this.get_shapes(ctx)
                .map(s => s
                    .get_contain_rect(ctx)
                    .rect_move(...s.get_spos(ctx)))
                .reduce((a, b) => a.rect_merge(b), this.get_rect(ctx));
        return this.ccontain_rect;
    }
    get_rect(ctx) {
        if (this.changed)
            this.crect = [0, 0, ...this._get_size(ctx)]
        return this.crect;
    }
    get_pen(ctx) {
        return ctx.sketch_contexts[this.rlayer];
    }
    draw(ctx) {
        const [sx, sy] = this.get_spos(ctx);
        for (const c of ctx.sketch_contexts) c.translate(sx, sy);
        this._draw(ctx);
        for (const shape of this.get_shapes(ctx)) shape.draw(ctx);
        for (const opt of this.rarea) {
            var mat = this.get_pen(ctx).getTransform();
            var rect = this.get_rect(ctx).rect_move(mat.e, mat.f);
            ctx.areas.push({
                rect, opt, shape: this,
            });
        }
        for (const c of ctx.sketch_contexts) c.translate(-sx, -sy);
        this.changed = false;
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
    _draw(ctx) {
        const pen = this.get_pen(ctx);
        if (this.rshadow) {
            pen.save();
            pen.shadowColor = this.rshadow[0];
            pen.shadowBlur = this.rshadow[1];
            pen.shadowOffsetX = this.rshadow[2];
            pen.shadowOffsetY = this.rshadow[3];
        }
        if (this.rfill) {
            pen.fillStyle = this.rfill;
            pen.fill(this._get_path(0, pen, ctx));
        }
        if (this.rshadow) pen.restore();
        if (this.rstroke) {
            pen.strokeStyle = this.rstroke[0];
            pen.lineWidth = this.rstroke[1] + this.rstroke[2];
            pen.stroke(this._get_path((this.rstroke[1] - this.rstroke[2]) / 2, pen, ctx));
        }
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
    _get_path(offset) {
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
    _get_path(offset) {
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
    _draw(ctx) {
        const pen = this.get_pen(ctx);
        pen.save();
        this._apply_style(pen);
        pen.fillStyle = this.rcolor;
        // pen.fillText(Math.random(), this.rmetrics.actualBoundingBoxLeft, this.rmetrics.actualBoundingBoxAscent);
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