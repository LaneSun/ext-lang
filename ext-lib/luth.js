export * from "./luth/luth.js";
import * as luth from "./luth/luth.js";
import * as luth_words from "./luth/luth-words.js";
globalThis.assign(luth_words);
globalThis.Word = luth.Word;
globalThis.TraitWord = luth.TraitWord;

String.prototype.assign(TraitWord, {
    handle(ctx) {
        try {
            const nctx = ctx.extend();
            for (const c of this)
                if (c !== nctx.read())
                    return luth.Result.Fail();
            ctx.merge(nctx);
            return luth.Result.Success(this);
        } catch (e) {
            if (e === luth.Context.StreamReachEnd) {
                return luth.Result.Fail();
            } else
                throw e;
        }
    },
    get_name() {
        return '"' + this.replaceAll('\n', '↵') + '"';
    },
});

RegExp.prototype.assign(TraitWord, {
    handle(ctx) {
        try {
            const nctx = ctx.extend();
            const c = nctx.read();
            if (this.test(c)) {
                ctx.merge(nctx);
                return luth.Result.Success(c);
            } else
                return luth.Result.Fail();
        } catch (e) {
            if (e === luth.Context.StreamReachEnd) {
                return luth.Result.Fail();
            } else
                throw e;
        }
    },
    get_name() {
        return '/' + this.source.replaceAll('\n', '↵') + '/';
    },
});