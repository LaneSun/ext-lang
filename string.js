// JS语言拓展库 - 字符串拓展
// Gen 1

import {ext_alias, ext_reader} from "./core.js";

ext_reader(String.prototype, {
    path_dir() {
        return this.substring(0, this.lastIndexOf('/'));
    },
    path_base() {
        return this.slice(this.lastIndexOf('/') + 1);
    },
    path_ext() {
        const str = this.slice(this.lastIndexOf('/') + 2);
        const pos = str.lastIndexOf('.');
        return pos >= 0 ? str.slice(pos) : '';
    },
    path_name() {
        return this.path_base.trim_end(this.path_ext, 1);
    },
    path_is_abs() {
        return this[0] === '/' || this.includes("://");
    },
});

ext_alias(String.prototype, {
    trim_end(str, max_count = Infinity) {
        let end = this.length;
        for (const _ of max_count)
            if (this.endsWith(str, end))
                end -= str.length;
            else
                break;
        return this.slice(0, end);
    },
    trim_start(str, max_count = Infinity) {
        let start = 0;
        for (const _ of max_count)
            if (this.startsWith(str, start))
                start += str.length;
            else
                break;
        return this.slice(start);
    },
    trim_both(str, max_count_start = Infinity, max_count_end = max_count_start) {
        let start = 0, end = this.length;
        for (const _ of max_count_start)
            if (this.startsWith(str, start))
                start += str.length;
            else
                break;
        for (const _ of max_count_end)
            if (end > start && this.endsWith(str, end))
                end -= str.length;
            else
                break;
        return this.slice(start, end);
    },
    path_join(...parts) {
        let results = [this.trim_end('/', 1)];
        for (const p of parts.slice(0, parts.length - 1))
            if (p.path_is_abs)
                results = [p.trim_end('/', 1)];
            else
                results.push(p.trim_end('/', 1));
        const endp = parts.at(-1);
        if (endp.path_is_abs)
            results = [endp];
        else
            results.push(endp);
        return results.join('/');
    },
});

// // TEST

// // trim_end
// "hellooo".trim_end('o', 2).equal("hello");
// "hello".trim_end('l').equal("hello");

// // trim_start
// "hhhello".trim_start('h', 2).equal("hello");
// "hello".trim_start('e').equal("hello");

// // trim_both
// "ooowwwooo".trim_both('o', 2).equal("owwwo");
// "oooo".trim_both('o').equal("");

// // path_ext
// "index.html".path_ext.equal(".html");
// "dir/index.coffee.md".path_ext.equal(".md");
// "index.".path_ext.equal(".");
// "some.d/index".path_ext.equal("");
// "dir/.index".path_ext.equal("");
// ".index.md".path_ext.equal(".md");

// // path_join, path_dir, path_base
// import.meta.url.path_base.equal("string.js");
// import.meta.url.path_dir.path_join(import.meta.url.path_base).equal(import.meta.url);

// // path_join, path_is_abs
// "hello".path_join("nice", "to/", "meet//", "you/").equal("hello/nice/to/meet//you/");
// "hello".path_join("/nice", "to", "meet", "you").equal("/nice/to/meet/you");
// "hello".path_join("http://nice", "to", "meet", "you").equal("http://nice/to/meet/you");

// // path_name
// "index.html".path_name.equal("index");
// "dir/index.coffee.md".path_name.equal("index.coffee");
// "index.".path_name.equal("index");
// "some.d/index".path_name.equal("index");
// "dir/.index".path_name.equal(".index");
// ".index.md".path_name.equal(".index");