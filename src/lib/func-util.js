export function inArr(arr) {
  return x => arr.indexOf(x) !== -1
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
