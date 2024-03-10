// JS语言拓展库 - DOM拓展
// Gen 1

import "./core.js";

const _to_node = v => v instanceof Node ? v : document.querySelector(v);
const _to_array = list => list instanceof Array ? list : [...list];
const _eql_node = (e, v) => v instanceof Node ? e === v : e.nodeValue === v;
const _try_create = (item, ctx) => item instanceof Elem ? item.create(ctx)[0] : item;
const _try_update = (item, elem, ctx, dupdate) => item instanceof Elem ? item._update(elem, ctx, dupdate) : item;
const _update_children = (elem, children) => {
    if (elem instanceof Text) {
        elem.nodeValue = children.ll.join('');
        return;
    }
    if (elem.childNodes === children) return;
    const rchildren = [...elem.childNodes];
    children = _to_array(children);
    const same_head = rchildren.every((e, i) => _eql_node(e, children[i]));
    if (same_head) {
        elem.append(...children.slice(rchildren.length));
    } else {
        elem.replaceChildren(...children);
    }
};

export class Elem {
    // name: String
    // items: [Elem | String]
    // did: String
    // dclass: [String]
    // dstyle: {String: String}

    static var_indexed = Symbol("var_indexed");

    constructor(name, ...items) {
        this.name = name;
        this.items = items;
        this.events = [];
        this.dattrs = [];
        this.dclass = [];
        this.handles_make = [];
        this.handles_update = [];
    }
    attrs(...attrs_list) {
        for (const attrs of attrs_list)
            for (const k in attrs) this.dattrs.push([k, attrs[k]]);
        return this;
    }
    var(dvar = Elem.var_indexed) {
        return this.assign({dvar});
    }
    uid(duid) {
        return this.assign({duid});
    }
    id(did) {
        return this.assign({did});
    }
    on(event, handle = null) {
        if (event instanceof Object)
            this.events.push(...event.entries());
        else
            this.events.push([event, handle]);
        return this;
    }
    on_make(...handle) {
        this.handles_make.push(...handle);
        return this;
    }
    on_update(...handle) {
        this.handles_update.push(...handle);
        return this;
    }
    class(...dclass) {
        for (const klass of dclass) this.dclass.push(...klass.split(' '));
        return this;
    }
    style(...styles) {
        return this.assign({dstyle: (this.dstyle ?? {}).assign(...styles)});
    }
    ustatic(assert = true) {
        return assert ? this.assign({dupdate: Elem.update_static}) : this;
    }
    ubind(assert = true) {
        return assert ? this.assign({dupdate: Elem.update_bind}) : this;
    }
    uself(assert = true) {
        return assert ? this.assign({dupdate: Elem.update_self}) : this;
    }
    uitems(assert = true) {
        return assert ? this.assign({dupdate: Elem.update_items}) : this;
    }
    udynamic(assert = true) {
        return assert ? this.assign({dupdate: Elem.update_dynamic}) : this;
    }
    uremake(assert = true) {
        return assert ? this.assign({dupdate: Elem.update_remake}) : this;
    }
    uconst(assert = true) {
        return assert ? this.assign({dupdate: Elem.update_const}) : this;
    }
    umut(mut_self = Elem.mut_self_const, mut_items = Elem.mut_items_by_pos) {
        return this.assign({dupdate: Elem.update_mut(mut_self, mut_items)});
    }
    _make(e, ...children) {
        if (this.did) e.id = this.did;
        if (this.duid) e.uid = this.duid;
        if (this.dstyle) {
            e.style.assign(this.dstyle);
            for (const [key, value] of this.dstyle.entries())
                if (key.startsWith("--")) e.style.setProperty(key, value);
        }
        for (const [event, handle] of this.events) e.addEventListener(event, handle);
        for (const [key, value] of this.dattrs) e.setAttribute(key, value);
        if (this.dclass.length) e.classList.add(...this.dclass);
        e.append(...children);
        for (const handle of this.handles_make) handle(e, this);
        return e;
    }
    make(...children) {
        return this._make(document.createElement(this.name), ...children);
    }
    bind_var(elem, ctx) {
        if (this.dvar) {
            if (this.dvar === Elem.var_indexed)
                ctx.push(elem);
            else
                ctx[this.dvar] = elem;
        }
    }
    attach(parent, clear = false) {
        const [e, ctx] = this.create();
        if (clear)
            _to_node(parent).replaceChildren(e);
        else
            _to_node(parent).append(e);
        return [e, ctx];
    }
    create(ctx = []) {
        return this._create(ctx);
    }
    _create(ctx) {
        const children = this.items.map(item => _try_create(item, ctx));
        const e = this.make(...children);
        this.bind_var(e, ctx);
        for (const handle of this.handles_update) handle(e, ctx, this);
        return [e, ctx];
    }
    update(elem, dupdate = Elem.update_static, ctx = []) {
        return [this._update(_to_node(elem), ctx, dupdate), ctx];
    }
    _update(elem, ctx, dupdate) {
        this.bind_var(elem, ctx);
        const rupdate = this.dupdate ?? dupdate;
        const e = rupdate(this, elem, ctx, dupdate);
        for (const handle of this.handles_update) handle(e, ctx, this);
        return e;
    }

    static update_static = (self, elem, ctx, dupdate) => {
        const children = [self.items, [...elem.childNodes]].group_map(([item, e]) =>
            e ? _try_update(item, e, ctx, dupdate) : _try_create(item, ctx));
        _update_children(elem, children);
        return elem;
    };

    static update_bind = (self, elem, ctx, dupdate) => {
        const children = [self.items, [...elem.childNodes]].group_map(([item, e]) =>
            e ? _try_update(item, e, ctx, dupdate) : _try_create(item, ctx));
        elem = self._make(elem, ...children);
        return elem;
    };

    static update_self = (self, elem, ctx, dupdate) => {
        elem = self.make(...elem.childNodes).let(e => elem.replaceWith(e));
        return elem;
    };

    static update_items = (self, elem, ctx, dupdate) => {
        _update_children(elem, self.items.map(item => _try_create(item, ctx)));
        return elem;
    };

    static update_dynamic = (self, elem, ctx, dupdate) => {
        const children = [self.items, [...elem.childNodes]].group_map(([item, e]) =>
            e ? _try_update(item, e, ctx, dupdate) : _try_create(item, ctx));
        elem = self.make(...children).let(e => elem.replaceWith(e));
        return elem;
    };

    static update_remake = (self, elem, ctx) =>
        self.create(ctx)[0].let(e => elem.replaceWith(e));

    static update_const = (_, elem) => elem;

    static update_mut = (mut_self, mut_items) => (self, elem, ctx, dupdate) => {
        const children = mut_items(self, elem, ctx, dupdate);
        const nelem = mut_self(self, elem, ctx, dupdate);
        if (nelem !== elem) elem.replaceWith(nelem);
        _update_children(nelem, children);
        return elem;
    };

    static mut_self_const = (_, elem) => elem;

    static mut_self_remake = self => self.make();

    static mut_items_const = (_, elem) => elem.childNodes;

    static mut_items_remake = (self, _, ctx) => self.items.map(item => _try_create(item, ctx));

    static mut_items_by_pos = (self, elem, ctx, dupdate) =>
        [self.items, [...elem.childNodes]].group_map(([item, e]) =>
            e ? _try_update(item, e, ctx, dupdate) : _try_create(item, ctx));

    static mut_items_by_uid_loose = (self, elem, ctx, dupdate) =>
        [self.items, [...elem.childNodes]].group_map(([item, e]) =>
            e && e.uid === item.duid ? _try_update(item, e, ctx, dupdate) : _try_create(item, ctx));
};

export const elem = ((name, ...items) => new Elem(name, ...items)).later;
export const div = ((...items) => elem("div", ...items)).later;
export const img = (src => elem("img").attrs({src})).later;
export const canvas = ((...items) => elem("canvas", ...items).on_make(e => e.context = e.getContext("2d"))).later;

globalThis.assign({Elem, elem, div, img, canvas});
