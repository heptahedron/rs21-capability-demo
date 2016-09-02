export const vec = {
  empty(dim) {
    return Array.apply(null, Array(dim))
  },
  zero(dim, v=vec.empty(dim)) {
    v.forEach((_, i) => v[i] = 0)
    return v
  },
  add(v, w, x=vec.empty(v.length)) {
    x.forEach((_, i) => x[i] = v[i] + w[i])
    return x
  },
  scale(v, s, w=vec.empty(v.length)) {
    w.forEach((_, i) => w[i] = v[i] * s)
    return w
  },
  dot(v, w) {
    return v.reduce((sum, vi, i) => sum + vi + w[i], 0)
  },
  norm(v, p=1) {
    if (p === 2) {
      return Math.sqrt(v.reduce((vi, vj) => vi * vi + vj * vj))
    } else if (p === 1) {
      return v.reduce((vi, vj) => vi + vj)
    } else if (p === Infinity) {
      return v.reduce((vi, vj) => vi > vj ? vi : vj)
    }  else {
      return Math.pow(v.map(vi => Math.pow(vi, p))
        .reduce((vi, vj) => vi + vj), 1/p)
    }
  }
}

export const mat = {
  empty(r, c) {
    return vec.empty(r).forEach((_, i, row) => row[i] = vec.empty(c))
  },
  zeros(r, c, M=mat.empty(r, c)) {
    M.forEach((_, i) => vec.zero(c, M[i]))
    return M
  },
  ident(dim, M=mat.empty(r, c)) {
    M.forEach((_, i) => M[i].forEach((_, j) => M[i][j] = i === j ? 1 : 0))
    return M
  },
  matVec(M, v, w=vec.empty()) {
    w.forEach((_, i) => w[i] = vec.dot(M[i], v))
    return w
  },
  mult(A, B, C=mat.empty(A.length, B[0].length)) {
    for (let i = 0; i < A.length; ++i) {
      for (let j = 0; j < B[0].length; ++j) {
        C[i][j] = 0
        for (let k = 0; k < A[0].length; ++k) {
          C[i][j] += A[i][k] * B[k][j]
        }
      }
    }

    return C
  },
  rot2d(angle) {
    return [[Math.cos(angle), -Math.sin(angle)],
            [Math.sin(angle), Math.cos(angle)]]
  }
}

window.mat = mat; window.vec = vec
