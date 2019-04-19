import Dep from './Dep.js'

class Watcher {
  constructor(vm, expOrFn, cb) {
    this.cb = cb
    this.vm = vm
    this.expOrFn = expOrFn

    if (typeof expOrFn === 'function') {
      this.getter = expOrFn
    } else {
      this.getter = this.parseGetter(expOrFn.trim())
    }

    this.value = this.getValue()
  }

  update() {
    const value = this.getValue()
    const oldVal = this.value
    // 如果值有变化调用 callback 更新值
    if (value !== oldVal) {
      this.value = value
      this.cb.call(this.vm, value, oldVal)
    }
  }

  // 获取 Wacher 实例监视的值
  getValue() {
    Dep.target = this
    const value = this.getter(this.vm)
    Dep.target = null
    return value
  }

  parseGetter(exp) {
    // 过滤不合法的属性访问表达式
    if (/[^\w.$]/.test(exp)) return

    const exps = exp.split('.')

    return obj => {
      let value = obj
      if (obj) {
        exps.forEach(key => (value = value[key]))
      }
      return value
    }
  }
}

export default Watcher
