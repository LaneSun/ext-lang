# ext-lang

一个JS的拓展库，包含一些辅助函数和一个DOM处理库

## Reference

### 工具

调试和打印相关:

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

原型和类相关:

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

数据集合、迭代器映射相关:

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

链式和函数编程相关:

```js
// 将 this 暂存并传入送入的函数，之后返回 this
Object.let(this => void) -> this

// 组合器函数，太复杂了不多讲
Object.compose(...Function|[Function, ...<arg>]) -> <result>

// if 的方法版本，传入参数不是函数时相当于是三元运算符
Object.if(this => <result>|<value>, this => <result>|<value>) -> <result>|<value>
```