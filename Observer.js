import Dep from './Dep.js'

const proxyObject = obj => {
  const dep = new Dep()
  return new Proxy(obj, {
    get: function(target, key, receiver) {
      // 如果订阅者存在，直接添加订阅
      if (Dep.target) {
        dep.addSub(key, Dep.target)
      }
      return Reflect.get(target, key, receiver)
    },
    set: function(target, key, value, receiver) {
      if (Reflect.get(receiver, key) === value) {
        return
      }
      const res = Reflect.set(target, key, observe(value), receiver)
      dep.notify(key)
      return res
    },
  })
}

/**
 * 导出 observe 函数，内部实例化 Observer
 */
export function observe(data) {
  // data 不是对象无法劫持，忽略
  if (!data || typeof data !== 'object') {
    return data
  }
  // 深度监听
  Object.keys(data).forEach(key => {
    data[key] = observe(data[key])
  })

  return proxyObject(data)
}
