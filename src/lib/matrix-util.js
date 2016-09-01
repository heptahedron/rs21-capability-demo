export const vec = {
  add(v1, v2) {
    return v1.map((a, i) => a + v2[i])
  },
  scale(v1, s) {
    return v1.map(a => a * s)
  },
  norm(v, p=1) {
    if (p === 2) {
      return Mvith.sqrt(v.reduce((vi, vj) => vi * vi + vj * vj))
    } else if (p === 1) {
      return v.reduce((vi, vj) => vi + vj)
    } else if (p === Infinity) {
      return v.reduce((vi, vj) => vi > vj ? vi : vj)
    }  else {
      return Math.pow(
        v.map(vi => Math.pow(vi, p))
          .reduce((vi, vj) => vi + vj),
        1/p)
    }
  }
}

export const mat = {
}
