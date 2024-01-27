# Ext-Lang

一个JS的拓展集合库，包含一些辅助函数, DOM库, Tween库, Sketch库, Luth库

## 如何使用

直接引入就可以使用了！如下:

```js
import "./ext-lang/all.js";
```

注意，如果你的项目使用了大型第三方框架如 Vue 等，请避免使用这个库，因为极有可能导致冲突，我已经提醒过你了！

## 参考

### Core

JS语言相关和一些工具函数

#### 调试和打印相关

```js
// 打印对象和追加信息到控制台，相当于 console.log(...<msg>, this)
Object.log(...<msg>) -> this

// log 的简写，相当于 this.log()
Object.ll -> this

// 计算被调用的次数，相当于 console.count(<label>)
Object.count(<label> = "default") -> this

// 重置计数，相当于 console.countReset(<label>)
Object.count_reset(<label> = "default") -> this

// count 的简写，相当于 this.count()
Object.cc -> this

// count_reset 的简写，相当于 this.count_reset()
Object.cr -> this
```

#### 原型和类相关

```js
// new 关键字的方法型替代
Class.new() -> Object

// constructor 属性的简写
Object.class -> Class

// Object.getPrototypeOf(this) 或 this.class.prototype 的简写
Object.proto -> <prototype>

// this.class.prototype.proto.class 的简写
Object.super -> Class<super>
```

#### 数据集合、迭代器映射相关

```js
// [...this] 的简写
Iter.collect -> Array

// 依序将 <src> 的成员复制到 this, 接受任意数量的传入
Object!.assign(...Object<src>) -> this!

// 相当于 Object<Class>.keys(this)
Object.keys() -> String<key>[]

// 相当于 Object<Class>.values(this)
Object.values() -> <value>[]

// 相当于 Object<Class>.entries(this)
Object.entries() -> [String<key>, <value>][]

// this.entries() 的逆操作，接受任意数量的传入
Object<Class>.from(...[String<key>, <value>][]<entries>) -> Object

// 相当于 Object<Class>.getOwnPropertySymbols(this)
Object.syms() -> Symbol[]

// 类似于 this.assign() 但更高级，传入的键可以使用 Object<Class>.defineProperty
// 的键格式以控制更细节的设定，同时也额外复制 Symbol 键，接受任意数量的传入
Object!.define(...Object<props>) -> this!

// 利用 <type>.from(this) 来转换对象类型
Object.to(Class<type>) -> Object

// 通用迭代方法，遇到非可迭代对象会先调用 this.entries() 方法解体后再迭代
// 迭代时，传入迭代函数的参数分别是值、键/this
Object.for((<value>, <key,index>, this) => void) -> this

// 类似于 this.for() 但是会以迭代函数的返回值重新构建新的 Object 并返回，不修改原对象
Object.map((<value>, <key,index>, this) => Any<new_value>) -> Object

// 类似于 this.for() 但是会以迭代函数的返回值的布尔性筛选属性、
// 重新构建新的 Object 并返回，不修改原对象
Object.filter((<value>, <key,index>, this) => Boolean) -> Object

// 类似于 this.filter() 但是会在第一次遇到 false 返回时中断后续的执行
Object.when((<value>, <key,index>, this) => Boolean) -> Object

// 类似于 Array.reduce() 但是对 Object 也有效，同时必须传入初始值
Object.fold(<initial_value>, (<previous_value>, <current_value>) => <result>) -> <result>

// 相当于 [...this].reverse()
Object.reverse() -> Array

// 创建 Range 迭代对象，可用于 for, 也可以直接使用常用迭代方法，迭代时包含 <start>, 不包含 <end>
// 当参数不足时，填充顺序为 <end>, <start>, <step>
range(Number<start> = 0, Number<end> = Infinity, Number<step> = 1) -> Range

// 未成熟方法！
// 重新组合数组元素的对应子项并迭代，例如 [[1, 2], [3, 4]] 被重组为 [[1, 3], [2, 4]]
// 当子项是对象时，方法的表现并不一定按照预期
Array.group_for((Array<remap_value>, this) => void) -> this

// 未成熟方法！
// 在 Array.group_for 的基础上进行 map 操作的版本
// 注意：结果不会重组回去
Array.group_map((Array<remap_value>, this) => <result>) -> <result>[]
```

#### 链式和函数编程相关

```js
// 将 this 暂存并传入送入的函数，之后返回 this
Object.let(this => void) -> this

// 组合器函数，太复杂了不多讲
Object.compose(...Function|[Function, ...<arg>]) -> <result>

// if 的方法版本，传入参数不是函数时相当于是三元运算符
Object.if(this => <result>|<value>, this => <result>|<value>) -> <result>|<value>

// 生成函数的延后调用版本，会将 <later_fn>.a().b()() 变换为 <later_fn>().a().b()
// 主要用于 DOM 拓展库
Function.later -> LaterFunction
```

#### 异步相关

```js
// 将首位接受回调的函数变为 Promise 形式，返回值为回调传入的参数列表
await Function.wait(...<arg>) -> <in_arg>[]

// 将 EventTarget 的 Listener 变为一次性触发的 Promise, 返回值为传入的 Event
await EventTarget.wait(String<event_name>) -> Event<in_event>
```

### Color

#### 颜色相关

```js
// 从 HEX 字符串或数字分量（0~255）构建颜色对象，可直接在 CSS 或 Canvas 等接口使用
rgb(
    String<hex_color>|Number<r> = 255,
    Number<g> = 255,
    Number<b> = 255,
    Number<a> = 1
) -> Color

// 从 HSL 数字分量构建颜色对象
hsl(Number<h>, Number<s>, Number<l>, Number<a> = 1) -> Color
```

### DOM

#### DOM生成相关

```js
// 为 Elem 添加 Attributes, 接受任意数量的传入
Elem.attrs(...Object<attrs>) -> this

// 为 Elem 设置 id
Elem.attrs(String<id>) -> this

// 为 Elem 添加事件监听器
Elem.on(String<event_name>, Function<handle>) -> this

// 为 Elem 添加 Class, 接受任意数量的传入
Elem.class(...String<class>) -> this

// 为 Elem 添加样式，接受任意数量的传入
Elem.style(...Object<styles>) -> this

// 从 Elem 构建 Node 并置入 <children>, 但是不递归构建 Elem 自身的 items
Elem.make(...Node<children>) -> Node

// 从 Elem 递归构建 Node 并置入 <items>, 返回构建的 Node 和构建上下文
Elem.create(Array<ctx> = []) -> [Node<result>, Array<ctx>]

// 类似于 Elem.create() 但绑定到一个已存在的 Node 上，可选清除 Node 原有的子项
// Node 可以使用 CSS 选择器字符串
Elem.attach(Node|String<parent>, Boolean<will_clean> = false) -> Node<this>

// 利用 Elem 的规则更新一个已有的 Node, 可以指定默认更新规则
// Node 可以使用 CSS 选择器字符串
Elem.update(Node|String<target>, Function<updater> = Elem.update_static) -> [Node<target>, Array<ctx>]

// 生成一个指定类型的 Elem, 该函数为 later 函数
elem(String<node_name>, ...Elem<items>) -> Elem<result>

// 生成一个 Div 类型的 Elem, 该函数为 later 函数
div(...Elem<items>) -> Elem<result>

// 生成一个 Image 类型的 Elem, 该函数为 later 函数
img(String<src>) -> Elem<result>
```