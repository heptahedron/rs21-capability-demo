const isString = x => (typeof x === 'string' || x instanceof String),
      toArr = xs => [].slice.call(xs)

export default function dom(nodeName, attrs=null, ...cs) {
  let newNode = document.createElement(nodeName)
  if (attrs) {
    for (const attr in attrs) {
      newNode.setAttribute(attr, attrs[attr])
    }
  }
  if (cs.length > 0) {
    cs.forEach(append(newNode))
  }

  return newNode
}

export function append(node, child) {
  if (Array.isArray(child)) {
    child.forEach(append(node))
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
  } else if (isString(node)) {
    return document.createTextNode(node)
  }

  return node.textContent
}

Object.assign(dom, {
  append, clear, children, text
})

export function svg(nodeName, attrs=null, ...cs) {
  let newNode = document.createElementNS(svg.xmlns, nodeName)
  if (attrs) {
    svg.attr(newNode, attrs)
  }
  cs.forEach(svg.append(newNode))

  return newNode
}

svg.xmlns = 'http://www.w3.org/2000/svg'

svg.attr = function svgAttr(node, attr, val) {
  if (typeof attr === 'object') {
    for (const a in attr) {
      node.setAttributeNS(null, a, attr[a])
    }
    return node
  }

  node.setAttributeNS(null, attr, val)
  return node
}

Object.assign(svg, { clear, children, append, text })
