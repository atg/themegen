var abs, atan2, cos, euclideanMetric, exp, floor, fmod, log, matrixMultiply, maximum, minimum, pi, pow, round, scale, sin, sqrt, sum, tan;
/* CONSTANTS and FUNCTIONS */
pow = Math.pow;
exp = Math.exp;
sqrt = Math.sqrt;
abs = Math.abs;
sin = Math.sin;
cos = Math.cos;
tan = Math.tan;
atan2 = Math.atan2;
floor = Math.floor;
round = Math.round;
log = Math.log;
pi = Math.PI;
fmod = function(x, n) {
  return x % n;
};
sum = function(a) {
  var _a, _b, _c, s, x;
  s = 0;
  _b = a.sort();
  for (_a = 0, _c = _b.length; _a < _c; _a++) {
    x = _b[_a];
    s += x;
  }
  return s;
};
scale = function(a, b, k) {
  return (1 - k) * a + k * b;
};
euclideanMetric = function(a, b) {
  var x1, x2, y1, y2;
  x1 = a.values["likeness"];
  x2 = b.values["importance"];
  y1 = a.values["likeness"];
  y2 = b.values["importance"];
  return sqrt(x1 * x2 + y1 * y2);
};
maximum = function(xs) {
  var _a, _b, _c, maxV, x;
  maxV = null;
  _b = xs;
  for (_a = 0, _c = _b.length; _a < _c; _a++) {
    x = _b[_a];
    if (maxV === null || x > maxV) {
      maxV = x;
    }
  }
  return maxV;
};
minimum = function(xs) {
  var _a, _b, _c, minV, x;
  minV = null;
  _b = xs;
  for (_a = 0, _c = _b.length; _a < _c; _a++) {
    x = _b[_a];
    if (minV === null || x < minV) {
      minV = x;
    }
  }
  return minV;
};
matrixMultiply = function(a, b) {
  var _a, _b, c, i, j, k, m, n, p;
  m = a.length;
  n = a[0].length;
  p = b[0].length;
  c = (function() {
    _a = [];
    for (i = 0; (0 <= m ? i < m : i > m); (0 <= m ? i += 1 : i -= 1)) {
      _a.push((function() {
        _b = [];
        for (k = 0; (0 <= p ? k < p : k > p); (0 <= p ? k += 1 : k -= 1)) {
          _b.push(0);
        }
        return _b;
      })());
    }
    return _a;
  })();
  for (i = 0; (0 <= m ? i < m : i > m); (0 <= m ? i += 1 : i -= 1)) {
    for (k = 0; (0 <= p ? k < p : k > p); (0 <= p ? k += 1 : k -= 1)) {
      for (j = 0; (0 <= n ? j < n : j > n); (0 <= n ? j += 1 : j -= 1)) {
        c[i][k] += a[i][j] * b[j][k];
      }
    }
  }
  return c;
};