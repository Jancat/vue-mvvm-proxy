import Watcher from './Watcher.js'
import Compiler from './Compiler.js'
import { observe } from './Observer.js'

class MVVM {
  constructor(options = {}) {
    this.$options = options
    this._vm = this._proxyThis()
    this.$data = observe(options.data)
    this._bindMethods()
    this.$compile = new Compiler(options.el || document.body, this._vm)
    return this._vm
  }

  // 代理 this，把对 this.xxx 的访问代理到 this.$data.xxx 或者 options.computed
  _proxyThis() {
    const { $options } = this
    const { computed } = $options
    return new Proxy(this, {
      get(target, key, receiver) {
        // 访问 MVVM 实例属性
        if (key in target) return Reflect.get(target, key, receiver)
        // 访问 data 属性
        if (key in $options.data)
          return Reflect.get(target.$data, key)
        // 访问 method
        if (key in $options.methods)
          return Reflect.get($options.methods, key, receiver)
        // 访问 computed 属性
        return typeof computed[key] === 'function'
          ? computed[key].call(target._vm)
          : Reflect.get(computed, key, receiver)
      },
      set(target, key, value, receiver) {
        // 设置 data 属性
        if (!target[key]) {
          // 此处 receiver 指向 this 的代理，不需要传递给 data proxy 的 getter
          return Reflect.set(target.$data, key, value)
        }
        return Reflect.set(target, key, value, receiver)
      },
    })
  }

  // 将函数中的 this 绑定到 this._vm 上
  _bindMethods() {
    const methods = this.$options.methods
    Object.keys(methods).forEach(method => {
      methods[method] = methods[method].bind(this._vm)
    })
  }

  $watch(key, cb) {
    new Watcher(this._vm, key, cb)
  }
}

export default MVVM
