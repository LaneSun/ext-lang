// JS语言拓展库 - Core
// Gen 1

// FIXME: 迭代器和数组乱象

const syms = {};
const s = name =>
    name in syms ? syms[name] : ((syms[name] = Symbol(name)), syms[name]);
const ext = (klass, props) => {
    for (const key in props) {
        const value = props[key];
        Object.defineProperty(
            klass,
            key,
            value instanceof Object && !(value instanceof Function)
                ? value
                : {
                      value,
                      writable: true,
                  }
        );
    }
};
const to_camel_case = str =>
    str
        .split("_")
        .map(s => s[0].toUpperCase() + s.slice(1))
        .join("");
const ext_sym = (klass, props) => {
    for (const key in props) {
        const sym = s(to_camel_case(key));
        const value = props[key];
        Object.defineProperties(
            klass,
            sym,
            value instanceof Object && !(value instanceof Function)
                ? value
                : { value }
        );
    }
};
const ext_alias = (klass, props) => {
    ext(klass, props);
    ext_sym(klass, props);
};
const ext_reader = (klass, props) => {
    const rprops = {};
    for (const k in props) {
        const fn = props[k];
        rprops[k] = {
            get: fn,
            set(v) {
                this.define({
                    [k]: {
                        value: v,
                        writable: true,
                        enumerable: true,
                    },
                });
            },
        };
    }
    ext_alias(klass, rprops);
};

const exit = s("exit");

ext_alias(Object, {
    from(...entry_lists) {
        const obj = Object();
        for (const entries of entry_lists)
            for (const [k, v] of entries) obj[k] = v;
        return obj;
    },
});

const _later_handler = {
    get(later, key) {
        return (...args) => new Proxy(later.late(key, args), _later_handler);
    },
    apply(later, _, args) {
        return later.call(args);
    },
};

class Later extends Function {
    constructor(fn, lates = []) {
        super();
        this.lates = lates;
        this.fn = fn;
    }
    static proxy(...args) {
        return new Proxy(new Later(...args), _later_handler);
    }
    call(args) {
        let res = this.fn.apply(null, args);
        for (const [key, args] of this.lates) res = res[key].apply(res, args);
        return res;
    }
    late(key, args) {
        return new Later(this.fn, this.lates.concat([[key, args]]));
    }
}

ext_reader(Object.prototype, {
    class() {
        return this.constructor;
    },
    proto() {
        return Object.getPrototypeOf(this);
    },
    super() {
        return this.class.prototype.proto.class;
    },
    collect() {
        return [...this];
    },
    later() {
        return Later.proxy(this);
    },
    ll() {
        return this.log();
    },
    cc() {
        return this.count();
    },
    cr() {
        return this.count_reset();
    },
});

ext_alias(Object.prototype, {
    new(...args) {
        return new this(...args);
    },
    let(...fns) {
        for (const fn of fns) fn(this);
        return this;
    },
    compose(...li_or_fns) {
        let res = this;
        for (const e of li_or_fns) {
            if (e instanceof Array) res = e[0].call(null, res, ...e.slice(1));
            else res = e(res);
        }
        return res;
    },
    assign(...sets) {
        for (const set of sets) for (const key in set) this[key] = set[key];
        return this;
    },
    keys() {
        return Object.keys(this);
    },
    values() {
        return Object.values(this);
    },
    entries() {
        return Object.entries(this);
    },
    foritems() {
        return this.entries();
    },
    syms() {
        return Object.getOwnPropertySymbols(this);
    },
    define(...prop_lists) {
        for (const props of prop_lists)
            for (const key of [...props.keys(), ...props.syms()]) {
                const value = props[key];
                Object.defineProperty(
                    this,
                    key,
                    value instanceof Object && !(value instanceof Function)
                        ? value
                        : { value }
                );
            }
        return this;
    },
    log(...msg) {
        console.log(...msg, this);
        return this;
    },
    count(label = "default") {
        console.count(label);
        return this;
    },
    count_reset(label = "default") {
        console.countReset(label);
        return this;
    },
    to(type) {
        return type.from(this);
    },
    for(fn) {
        if (this.next) {
            let i = 0;
            for (const v of this) if (fn(v, i++, this) === exit) break;
        } else
            for (const [k, v] of this.entries())
                if (fn(v, k, this) === exit) break;
        return this;
    },
    trans(fn) {
        return this.entries()
            .map(([k, v]) => fn(v, k, this))
            .to(this.class);
    },
    map(fn) {
        if (this.next) {
            const self = this;
            return (function* () {
                let i = 0;
                while (true) {
                    const { done, value } = self.next();
                    if (!done) {
                        yield fn(value, i, self);
                        i++;
                    } else break;
                }
            })();
        } else {
            return this.entries()
                .map(([k, v]) => [k, fn(v, k, this)])
                .to(this.class);
        }
    },
    filter(fn) {
        if (this.next) {
            const self = this;
            return (function* () {
                let i = 0;
                while (true) {
                    const { done, value } = self.next();
                    if (!done) {
                        if (fn(value, i, self)) yield value;
                        i++;
                    } else break;
                }
            })();
        } else {
            return this.entries()
                .filter(([k, v]) => fn(v, k, this))
                .to(this.class);
        }
    },
    when(fn) {
        if (this.next) {
            const self = this;
            return (function* () {
                let i = 0;
                while (true) {
                    const { done, value } = self.next();
                    if (!done) {
                        if (fn(value, i, self)) yield value;
                        else break;
                        i++;
                    } else break;
                }
            })();
        } else {
            return this.entries()
                .when(([k, v]) => fn(v, k, this))
                .to(this.class);
        }
    },
    fold(initial, fn) {
        const iter = this.next ? this : this.values();
        let res = initial;
        for (const v of iter) {
            res = fn(res, v);
        }
        return res;
    },
    reverse() {
        return [...this].reverse();
    },
    if(truee, falsee) {
        if (this) {
            if (truee instanceof Function) return truee(this);
            else return truee;
        } else {
            if (falsee instanceof Function) return falsee(this);
            else return falsee;
        }
    },
});

ext_alias(Array.prototype, {
    foritems() {
        return this;
    },
    group_map(fn) {
        const groups = this.map(g => g.foritems());
        return [...range(groups[0].length).map(i => fn(groups.map(g => g[i]), this))];
    },
    group_for(fn) {
        const groups = this.map(g => g.foritems());
        for (const i of range(groups[0].length)) {
            if (fn(groups.map(g => g[i]), this) === exit) break;
        }
        return this;
    },
});

ext_alias(Math, {
    clamp(v, min, max) {
        return Math.max(min, Math.min(max, v));
    },
});

export class Range {
    constructor(start, end, step) {
        this.start = start;
        this.end = end;
        this.step = step;
    }
    *values() {
        const { start, end, step } = this;
        for (let v = start; v < end; v += step) yield v;
    }
    *keys() {
        const { start, end, step } = this;
        for (let v = start, i = 0; v < end; v += step, i++) yield i;
    }
    *entries() {
        const { start, end, step } = this;
        for (let v = start, i = 0; v < end; v += step, i++) yield [i, v];
    }
    map(fn) {
        return this.values().map(fn);
    }
    filter(fn) {
        return this.values().filter(fn);
    }
    when(fn) {
        return this.values().when(fn);
    }
    [Symbol.iterator]() {
        return this.values();
    }
}

export const range = (...args) => {
    switch (args.length) {
        case 0:
            return new Range(0, Infinity, 1);
        case 1:
            return new Range(0, args[0], 1);
        case 2:
            return new Range(args[0], args[1], 1);
        default:
            return new Range(args[0], args[1], args[2]);
    }
};

globalThis.range = range;

export const Sym = syms;
