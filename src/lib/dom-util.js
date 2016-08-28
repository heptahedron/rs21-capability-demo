const isString = x => (typeof x === 'string' || x instanceof String),
      toArr = xs => [].slice.call(xs)

export default function dom(nodeName) {
  return document.createElement(nodeName)
}

export function append(node, child) {
  if (Array.isArray(child)) {
    child.forEach(c => append(node, c))
    return node
  } else if (child) {
    node.appendChild(child)
    return node
  }

  return (c => append(node, c))
}

export function remove(node) {
  const parent = node.parentNode
  parent.removeChild(node)
  return parent
}

export function clear(node) {
  toArr(node.children).forEach(remove)
  return node
}

export function children(node, cs) {
  if (Array.isArray(cs)) {
    clear(node)
    return cs.map(append(node))
  } else if (!!cs) {
    clear(node)
    return append(node, cs)
  }

  return toArr(node.children)
}

export function text(node, txt) {
  if (isString(txt)) {
    node.textContent = txt
    return node
  }

  return node.textContent
}

Object.assign(dom, {
  append, clear, children, text
})
