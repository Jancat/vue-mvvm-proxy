import Watcher from './Watcher.js'

const isElementNode = node => node.nodeType === 1
const isTextNode = node => node.nodeType === 3
const isDirective = attr => attr.indexOf('v-') === 0
const isEventDirective = directive => directive.indexOf('on') === 0

function nodeToFragment(node) {
  const fragment = document.createDocumentFragment()

  // 将原生节点移动到fragment
  let child = node.firstChild
  while (child) {
    fragment.appendChild(child)
    child = node.firstChild
  }

  return fragment
}

const updater = {
  textUpdater(node, value) {
    node.textContent = typeof value === 'undefined' ? '' : value
  },

  htmlUpdater(node, value) {
    node.innerHTML = typeof value === 'undefined' ? '' : value
  },

  classUpdater(node, value, oldValue) {
    let className = node.className
    className = className.replace(oldValue, '').replace(/\s$/, '')

    const space = className && String(value) ? ' ' : ''

    node.className = className + space + value
  },

  modelUpdater(node, value) {
    node.value = typeof value === 'undefined' ? '' : value
  },
}

// 指令处理集合
const compilerUtils = {
  text(node, vm, exp) {
    this.bind(node, vm, exp, 'text')
  },

  html(node, vm, exp) {
    this.bind(node, vm, exp, 'html')
  },

  model(node, vm, exp) {
    this.bind(node, vm, exp, 'model')

    let val = this._getVMVal(vm, exp)
    node.addEventListener('input', e => {
      const newValue = e.target.value
      if (val === newValue) {
        return
      }
      this._setVMVal(vm, exp, newValue)
      val = newValue
    })
  },

  class(node, vm, exp) {
    this.bind(node, vm, exp, 'class')
  },

  bind(node, vm, exp, dir) {
    const updaterFn = updater[dir + 'Updater']

    updaterFn && updaterFn(node, this._getVMVal(vm, exp))

    new Watcher(vm, exp, (value, oldValue) => {
      updaterFn && updaterFn(node, value, oldValue)
    })
  },

  // 事件处理
  eventHandler(node, vm, exp, dir) {
    const eventType = dir.split(':')[1]
    const fn = vm.$options.methods && vm.$options.methods[exp]

    if (eventType && fn) {
      node.addEventListener(eventType, fn.bind(vm), false)
    }
  },

  _getVMVal(vm, exp) {
    let val = vm
    exp = exp.split('.')
    exp.forEach(key => (val = val[key]))
    return val
  },

  _setVMVal(vm, exp, value) {
    let val = vm
    exp = exp.split('.')
    exp.forEach((key, index) => {
      // 非最后一个key，更新val的值
      if (index < exp.length - 1) {
        val = val[key]
      } else {
        val[key] = value
      }
    })
  },
}

class Compiler {
  constructor(el, vm) {
    this.$vm = vm
    this.$el = isElementNode(el) ? el : document.querySelector(el)

    if (this.$el) {
      this.$fragment = nodeToFragment(this.$el)
      this.compileElement(this.$fragment)
      this.$el.appendChild(this.$fragment)
    }
  }

  compileElement(el) {
    Array.from(el.childNodes).forEach(node => {
      const text = node.textContent
      const reg = /\{\{(.*)\}\}/

      if (isElementNode(node)) {
        this.compile(node)
      } else if (isTextNode(node) && reg.test(text)) {
        this.compileText(node, RegExp.$1.trim())
      }

      if (node.childNodes && node.childNodes.length) {
        this.compileElement(node)
      }
    })
  }

  compile(node) {
    Array.from(node.attributes).forEach(attr => {
      const attrName = attr.name
      if (isDirective(attrName)) {
        const exp = attr.value
        const dir = attrName.substring(2)
        // 事件指令
        if (isEventDirective(dir)) {
          compilerUtils.eventHandler(node, this.$vm, exp, dir)
          // 普通指令
        } else {
          compilerUtils[dir] && compilerUtils[dir](node, this.$vm, exp)
        }

        node.removeAttribute(attrName)
      }
    })
  }

  compileText(node, exp) {
    compilerUtils.text(node, this.$vm, exp)
  }
}

export default Compiler
