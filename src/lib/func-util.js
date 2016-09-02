export function inArr(arr) {
  const inSet = new Set(arr)
  return x => inSet.has(x)
}

export function and(f1, f2) {
  return x => f1(x) && f2(x)
}

export function or(f1, f2) {
  return x => f1(x) || f2(x)
}

export function not(f) {
  return x => !f(x)
}

export function compose(f1, f2) {
  return x => f1(f2(x))
}

export function mapPairs(obj, f) {
  return Object.keys(obj).map(k => ([k, obj[k]])).map(f)
}

export function hasKey(o, prop) { return o.propertyIsEnumerable(prop) }

export function keysUnion(o1, o2) {
  return Object.keys(o1)
          .concat(Object.keys(o2)
            .filter(key => hasKey(o1, key)))
}

export function takeKeys(obj, keys) {
  return Object.keys(obj)
    .filter(typeof keys === 'function' ? k => keys(k) : k => keys[k])
    .reduce((res, k) => { res[k] = obj[k]; return res }, {})
}

export function compareKeys(o1, o2) {
  const kept = [],
        added = [],
        removed = []

  keysUnion(o1, o2)
    .forEach(key => {
      if (hasKey(o1, key) && hasKey(o2, key)) {
        kept.push(key)
      } else if (!hasKey(o1, key)) {
        added.push(key)
      } else {
        removed.push(key)
      }
    })

  return { kept, added, removed }
}

export function compareObjs(o1, o2) {
  const same = [],
        added = [],
        removed = [],
        changed = []

  keysUnion(o1, o2)
    .forEach(key => {
      if (hasKey(o1, key) && hasKey(o2, key)) {
        if (o1[key] === o2[key]) {
          same.push(key)
        } else {
          changed.push(key)
        }
      } else if (!hasKey(o1, key)) {
        added.push(key)
      } else {
        removed.push(key)
      }
    })

  return { same, added, removed, changed }
}

export function shallowClone(obj, ...newProps) {
  return Object.keys(obj)
    .map(key => ({ [key]: obj[key] }))
    .concat(newProps)
    .reduce((acc, o) => Object.assign(acc, o), {})
}

// mutates!
export function transformProps(obj, f) {
  Object.keys(obj).forEach(key => obj[key] = f(obj[key], key))
  return obj
}

export function observe(...x) {
  console.log(...x)
  return x[0]
}
