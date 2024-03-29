// JS语言拓展库 - 动画与时间处理拓展
// Gen 1

// ease functions
const PI = Math.PI;
const cos = Math.cos;
const sqrt = Math.sqrt;
const abs = Math.abs;
const max = Math.max;
const pow = Math.pow;
export const linear = t => t;
export const ease_in_out_sine = t => -(cos(PI * t) - 1) / 2;
export const ease_in_out_cubic = t => t < 0.5 ? 4 * t * t * t : 1 - pow(-2 * t + 2, 3) / 2;
export const ease_in_back = (t, s = 1.70158) => t * t * ((s + 1) * t - s);
export const ease_out_back = (t, s = 1.70158) =>
    (t -= 1) * t * ((s + 1) * t + s) + 1;
export const ease_in_out_back = (t, s = 1.70158) =>
    (t *= 2) < 1
        ? 0.5 * (t * t * (((s *= 1.525) + 1) * t - s))
        : 0.5 * ((t -= 2) * t * (((s *= 1.525) + 1) * t + s) + 2);
export const ease_in_circ = t => -(sqrt(1 - t * t) - 1);
export const ease_out_circ = t => sqrt(1 - (t -= 1) * t);
export const ease_in_out_circ = t =>
    (t *= 2) < 1
        ? -0.5 * (sqrt(1 - t * t) - 1)
        : 0.5 * (sqrt(1 - (t -= 2) * t) + 1);
export const ease_in_bounce = t => 1 - ease_out_bounce(1 - t);
export const ease_out_bounce = t =>
    t < 1 / 2.75
        ? 7.5625 * t * t
        : t < 2 / 2.75
        ? 7.5625 * (t -= 1.5 / 2.75) * t + 0.75
        : t < 2.5 / 2.75
        ? 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375
        : 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
export const ease_in_out_bounce = t =>
    t < 0.5
        ? ease_in_bounce(t * 2) * 0.5
        : ease_out_bounce(t * 2 - 1) * 0.5 + 0.5;

export class Tweener {
    constructor(updater, opts = {}) {
        this.duration = opts.duration ?? 300;
        this.ease_fn = opts.ease_fn ?? ease_out_circ;
        this.target = opts.value ?? 0;
        this.updater = updater;
        this.timer = null;
        this.value = null;
        this.set(this.target);
    }
    _update() {
        this.updater(this.value);
        return this;
    }
    set(v) {
        if (this.value !== v) {
            this.value = v;
            this._update();
        }
        return this;
    }
    tween(tar) {
        if (tar !== this.target) {
            this.target = tar;
            if (this.timer) this.timer.stop();
            const start = this.value;
            const end = tar;
            if (start !== end) {
                const dur = this.duration * abs(end - start);
                this.direction = start < end;
                this.timer = timer(
                    dur,
                    t => {
                        const d = this.ease_fn(t / dur);
                        const v = start * (1 - d) + end * d;
                        this.set(v);
                    },
                    () => {
                        this.timer = null;
                    }
                ).start();
            }
        }
        return this;
    }
}

export const tweener = (updater, duration = 300, value = 0, ease_fn = ease_out_circ) =>
    new Tweener(updater, {duration, value, ease_fn});

export const tween = (updater, duration = 300, ease_fn = ease_out_circ) => new Promise(res => {
    const {start} = timer(duration, t => updater(ease_fn(t / duration)), res);
    start();
});

export const timer = (duration, updater = null, end = null) => {
    let start_t = null;
    let finish_h = null;
    let rid = null;
    const tick = async t => {
        const dur = max(0, t - start_t);
        if (dur < duration) {
            if (updater) await updater(dur);
            rid = requestAnimationFrame(tick);
        } else {
            await updater(duration);
            rid = null;
            if (end)
                finish_h(end(true));
            else
                finish_h();
            finish_h = null;
        }
    };
    const start = (finish = null) => {
        stop();
        finish_h = finish;
        start_t = performance.now();
        tick(start_t);
        return obj;
    };
    const stop = () => {
        if (rid !== null) cancelAnimationFrame(rid);
        rid = null;
        if (finish_h !== null) {
            if (end)
                finish_h(end(false));
            else
                finish_h();
            finish_h = null;
        }
        return obj;
    };
    return {start, stop};
};

export const throttle = (duration, handle) => {
    let timer = null;
    let pending = null;
    const on_time_end = () => {
        timer = null;
        if (pending) {
            const args = pending;
            pending = null;
            request.apply(null, args);
        }
    };
    const request = (...args) => {
        if (timer === null) {
            handle(...args);
            timer = setTimeout(on_time_end, duration);
        } else {
            pending = args;
        }
    };
    return request;
};

globalThis.assign({tweener, tween, timer, throttle});