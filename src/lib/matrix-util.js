export const vec = {
  add(v1, v2) {
    return v1.map((a, i) => a + v2[i])
  },
  scale(v1, s) {
    return v1.map(a => a * s)
  }
}

export const mat = {
}
