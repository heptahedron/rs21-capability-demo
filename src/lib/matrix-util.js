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
    return v.reduce((sum, vi, i) => sum + vi * w[i], 0)
  },
  norm(v, p=2) {
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
    let res = vec.empty(r)
    res.forEach((_, i, row) => row[i] = vec.empty(c))
    return res
  },
  zeros(r, c, M=mat.empty(r, c)) {
    M.forEach((_, i) => vec.zero(c, M[i]))
    return M
  },
  ident(dim, M=mat.empty(dim, dim)) {
    M.forEach((_, i) => M[i].forEach((_, j) => M[i][j] = i === j ? 1 : 0))
    return M
  },
  matVec(M, v, w=vec.empty(v.length)) {
    w.forEach((_, i) => w[i] = vec.dot(M[i], v))
    return w
  },
  mult(A, B, output=mat.empty(A.length, B[0].length)) {
    for (let i = 0; i < A.length; ++i) {
      for (let j = 0; j < B[0].length; ++j) {
        output[i][j] = 0
        for (let k = 0; k < B.length; ++k) {
          output[i][j] += A[i][k] * B[k][j]
        }
      }
    }

    return output
  },
  mult_(A, B, output=mat.empty(B[0].length, A.length)) { // output transposed
    for (let i = 0; i < A.length; ++i) {
      for (let j = 0; j < B[0].length; ++j) {
        output[j][i] = 0
        for (let k = 0; k < B.length; ++k) {
          output[j][i] += A[i][k] * B[k][j]
        }
      }
    }

    return output
  },
  rot2d(angle, output=mat.empty(2,2)) {
    output[0][0] = Math.cos(angle)
    output[1][0] = Math.sin(angle)
    output[0][1] = -Math.sin(angle)
    output[1][1] = Math.cos(angle)
    return output
  },
  scale2d(x, y, output=mat.ident(2)) {
    output[0][0] *= x
    output[1][1] *= y
    return output
  },
  translate2d(x, y, output=mat.empty(2,3)) {
    output[0][0] = 1
    output[0][1] = 0
    output[0][2] = x
    output[1][0] = 0
    output[1][1] = 1
    output[1][2] = y
    return output
  }
}

window.mat = mat; window.vec = vec
