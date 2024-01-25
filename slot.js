// JS语言拓展库 - Slot 拓展
// Gen 1

import "./core.js";

Object.prototype.define({
    make_flag(name) {
        const flag = Symbol("flag:" + name),
            set = Symbol("on:" + name),
            unset = Symbol("off:" + name);
        this.define({
            [set]: {
                get() {
                    this.define({
                        [flag]: { value: true, configurable: true },
                    });
                    return this;
                },
            },
            [unset]: {
                get() {
                    delete this[flag];
                    return this;
                },
            },
        });
        return [flag, set, unset];
    },
    make_slot(name) {
        const slot = Symbol("slot:" + name),
            set = Symbol("set:" + name);
        this.define({
            [set](value) {
                if (value !== undefined)
                    this.define({
                        [slot]: { value, configurable: true },
                    });
                else delete this[slot];
                return this;
            },
        });
        return [slot, set];
    },
});
