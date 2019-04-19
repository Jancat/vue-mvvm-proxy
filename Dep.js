/**
 * 订阅中心
 * data 中的每个嵌套对象都对应一个 Dep 实例，监听该对象内部属性的 watcher 实例会被添加到 this.subsMap 中；
 * 属性值一旦变化，就会通知这些订阅该属性的 watcher 实例
 */
class Dep {
  constructor() {
    // 使用 Map 结构存储 key - Set(sub) 的映射
    this.subsMap = new Map()
  }

  addSub(key, sub) {
    // 取出键为 key 的订阅者
    const keySubs = this.subsMap.get(key)
    if (keySubs) {
      // keySubs 中可能已经存在相同的 sub，Set 结构会负责保证唯一性
      keySubs.add(sub)
    } else {
      // 用 Set 数据结构储存,保证唯一值
      this.subsMap.set(key, new Set([sub]))
    }
  }

  removeSub(key, sub) {
    // 取出键为 key 的订阅者
    const keySubs = this.subsMap.get(key)
    if (keySubs) {
      keySubs.delete(sub)
    }
  }

  notify(key) {
    const keySubs = this.subsMap.get(key)
    if (keySubs) {
      for (const sub of keySubs) {
        sub.update()
      }
    }
  }
}

Dep.target = null

export default Dep
