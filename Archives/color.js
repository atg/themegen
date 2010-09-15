var LABColor, RGBColor, _a, abs, atan2, ciede200Metric, cos, euclidianMetric, exp, findClusters, floor, fmod, generateBackgroundColor, generateHueClusters, generateTheme, hueInterpolationPoints, matrixMultiply, modnormalRandomInInterval, normalRandom, pi, pow, random, randomHueInCluster, randomInInterval, refX, refY, refZ, round, sin, sqrt, sum, tan;
/* MATH STUFF */
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
pi = Math.PI;
/* MAIN CODE */
/* Possible options
      bg_lightness
      bg_type
      contrast
      colorfulness
      hue_count
      hue_range
*/
generateTheme = function(options) {
  var colors, max_importance, theme;
  theme = {
    "options": options
  };
  theme["hue_clusters"] = generateHueClusters(theme);
  theme["background"] = generateBackgroundColor(theme);
  max_importance = maximum(theme["importance_ratings"].length);
  return (colors = []);
};
generateHueClusters = function(theme) {
  var _a, center, foundOtherCloseCenter, hue_clusters, hue_count, i;
  hue_clusters = [];
  hue_count = options['hue_count'];
  if (hue_count > 5) {
    hue_count = 5;
  }
  while (true) {
    if (hue_clusters.length >= hue_count) {
      break;
    }
    center = randomInInterval(0, 1);
    foundOtherCloseCenter = false;
    _a = (hue_clusters.length);
    for (i = 0; (0 <= _a ? i < _a : i > _a); (0 <= _a ? i += 1 : i -= 1)) {
      if (!(center < hue_clusters[i] - hue_cluster_radius && center > hue_clusters[i] + hue_cluster_radius)) {
        foundOtherCloseCenter = true;
      }
    }
    if (foundOtherCloseCenter === false) {
      hue_clusters.push(center);
    }
  }
  return hue_clusters;
};
generateBackgroundColor = function(theme) {
  var chroma, discrete_chroma, discrete_lightness, hue, isDark, lightness, maximumLightnessDifferenceFromEndpoint, primary_cluster;
  discrete_lightness = theme["bg_lightness"];
  isDark = false;
  if (discrete_lightness === "dark") {
    isDark = true;
  } else if (discrete_lightness === "either") {
    isDark = randomInInteval(0.0, 1.0) > 0.5;
  }
  theme["is_dark"] = isDark;
  lightness = 1.0;
  maximumLightnessDifferenceFromEndpoint = 0.1;
  discrete_chroma = theme["bg_type"];
  if (discrete_chroma === "black/white") {
    lightness = isDark ? 0.0 : 1.0;
  } else {
    lightness = randomInInterval(0.0, maximumLightnessDifferenceFromEndpoint);
    if (!isDark) {
      lightness = 1.0 - lightness;
    }
  }
  hue = 0.0;
  chroma = 0.0;
  if (discrete_chroma === "neutral") {
    primary_cluster = theme["hue_clusters"][0];
    hue = randomHueInCluster(primary_cluster);
    if (isDark) {
      chroma = 0.5;
    } else {
      chroma = 0.75;
    }
  }
  return new Color(hue, chroma, lightness);
};
randomHueInCluster = function(primary_cluster) {
  return modnormalRandomInInterval(-pi, pi, primary_cluster);
};
fmod = function(x, n) {
  return x % n;
};
sum = function(a) {
  var _a, _b, _c, s, x;
  s = 0;
  _b = a;
  for (_a = 0, _c = _b.length; _a < _c; _a++) {
    x = _b[_a];
    s += x;
  }
  return s;
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
/* STATISTICS STUFF */
random = function() {};
randomInInterval = function(a, b) {};
normalRandom = function() {};
modnormalRandomInInterval = function(a, b, center) {
  var r;
  r = normalRandom();
  r *= b - a;
  r += center - (b - a) / 2;
  r = fmod(r, b - a);
  r += a;
  return r;
};
findClusters = function(data, n, metric) {
  var l;
  return (l = floor((data.length + n - 1) / n));
};
euclidianMetric = function(x, y) {
  return sqrt(x.value * x.value + y.value * y.value);
};
ciede200Metric = function(x, y) {};
/* COLOR STUFF */
_a = [1, 1, 1];
refX = _a[0];
refY = _a[1];
refZ = _a[2];
/*
    Red: 336 to 11
    Orange: 11 to 47
    Yellow: 47 to 67
    Green: 67 to 143
    Green-Blue: 143 to 179
    Blue: 179 to 260
    Purple: 260 to 289
    Pink: 289 to 336
*/
hueInterpolationPoints = [336 / 360, 11 / 360, 47 / 360, 67 / 360, 143 / 360, 179 / 360, 260 / 360, 289 / 360, 336 / 360];
RGBColor = function(_b, _c, _d) {
  this.lightness = _d;
  this.chroma = _c;
  this.hue = _b;
  return this;
};
RGBColor.prototype.asHSL = function() {
  var a, b, count, i, newHue, offset, p, u, v, x, xs;
  x = this.hue / (2 * pi);
  xs = hueInterpolationPoints;
  count = xs.length - 1;
  newHue = 0;
  /*
  for i in [0...count]
      a = xs[i]
      b = xs[i + 1]

      if a < x < b
          p = (x - a) / (b - a)
          newHue = (1 - p) * (i / count) + p * ((i + 1) / count)
          break
  */
  for (i = 0; (0 <= count ? i < count : i > count); (0 <= count ? i += 1 : i -= 1)) {
    a = i / count;
    b = (i + 1) / count;
    if ((a < x) && (x <= b)) {
      p = (x - a) / (b - a);
      if (i === 0) {
        offset = (1 - xs[0]);
        u = 0;
        v = offset + xs[i + 1];
        newHue = (1 - p) * u + p * v - offset;
        if (newHue < 0) {
          newHue += 1.0;
        }
      } else {
        u = xs[i];
        v = xs[i + 1];
        newHue = (1 - p) * u + p * v;
      }
      break;
    }
  }
  /*
  newHue = 0
  groupSize = 1 / (hueInterpolationPoints.length - 1)
  for h in hueInterpolationPoints
      if h > newHue
  */
  return [newHue * 2 * pi, this.chroma, this.lightness];
};
RGBColor.prototype.asRGB = function() {
  var _b, _c, _d, _e, _f, _g, _h, _i, b, c, g, h, h_dash, l, m, r, s, x;
  _b = this.asHSL();
  h = _b[0];
  s = _b[1];
  l = _b[2];
  c = s;
  h_dash = h / (pi / 3);
  x = c * (1 - Math.abs(h_dash % 2 - 1));
  if ((0 <= h_dash) && (h_dash < 1)) {
    _c = [c, x, 0];
    r = _c[0];
    g = _c[1];
    b = _c[2];
  } else if ((1 <= h_dash) && (h_dash < 2)) {
    _d = [x, c, 0];
    r = _d[0];
    g = _d[1];
    b = _d[2];
  } else if ((2 <= h_dash) && (h_dash < 3)) {
    _e = [0, c, x];
    r = _e[0];
    g = _e[1];
    b = _e[2];
  } else if ((3 <= h_dash) && (h_dash < 4)) {
    _f = [0, x, c];
    r = _f[0];
    g = _f[1];
    b = _f[2];
  } else if ((4 <= h_dash) && (h_dash < 5)) {
    _g = [x, 0, c];
    r = _g[0];
    g = _g[1];
    b = _g[2];
  } else if ((5 <= h_dash) && (h_dash < 6)) {
    _h = [c, 0, x];
    r = _h[0];
    g = _h[1];
    b = _h[2];
  } else {
    _i = [0, 0, 0];
    r = _i[0];
    g = _i[1];
    b = _i[2];
  }
  m = l - (0.30 * r + 0.59 * g + 0.11 * b);
  return [r + m, g + m, b + m];
};
RGBColor.prototype.asCSS_RGB = function() {
  var _b, b, g, normalize, r;
  _b = this.asRGB();
  r = _b[0];
  g = _b[1];
  b = _b[2];
  normalize = function(x) {
    if (x > 1) {
      return 1;
    } else if (x < 0) {
      return 0;
    } else {
      return x;
    }
  };
  r = normalize(r);
  g = normalize(g);
  b = normalize(b);
  return ("rgb(" + (round(r * 255)) + ", " + (round(g * 255)) + ", " + (round(b * 255)) + ")");
};
LABColor = function(_b, _c, _d) {
  this.lightness = _d;
  this.chroma = _c;
  this.hue = _b;
  return this;
};
LABColor.prototype.asLAB = function() {
  var a, b, l;
  l = this.lightness * 100;
  a = (this.chroma * 135) * cos(this.hue);
  b = (this.chroma * 135) * sin(this.hue);
  return [l, a, b];
};
LABColor.prototype.asXYZ = function() {
  var _b, a, b, delta, fx, fy, fz, l, x, y, z;
  _b = this.asLAB();
  l = _b[0];
  a = _b[1];
  b = _b[2];
  delta = 6 / 29;
  fy = (l + 16) / 116;
  fx = fy + a / 500;
  fz = fy - b / 200;
  y = fy > delta ? refY * pow(fy, 3) : (fy - 16 / 166) * 3 * pow(delta, 2) * refY;
  x = fx > delta ? refX * pow(fx, 3) : (fx - 16 / 166) * 3 * pow(delta, 2) * refX;
  z = fz > delta ? refZ * pow(fz, 3) : (fz - 16 / 166) * 3 * pow(delta, 2) * refZ;
  return [x, y, z];
};
LABColor.prototype.asLRGB = function() {
  var _b, _c, _d, _e, _f, blue, green, m, red, x, y, z;
  _b = this.asXYZ();
  x = _b[0];
  y = _b[1];
  z = _b[2];
  m = [[3.2406, -1.5372, -0.4986], [-0.9689, 1.8758, 0.0415], [0.0557, -0.2040, 1.0570]];
  _c = matrixMultiply(m, [[x], [y], [z]]);
  _d = _c[0];
  red = _d[0];
  _e = _c[1];
  green = _e[0];
  _f = _c[2];
  blue = _f[0];
  return [red, green, blue];
};
LABColor.prototype.asSRGB = function() {
  var _b, blue, gammaCorrect, green, red;
  _b = this.asLRGB();
  red = _b[0];
  green = _b[1];
  blue = _b[2];
  gammaCorrect = function(c) {
    return c <= 0.0031308 ? 12.92 * c : (1 + 0.055) * pow(c, 1 / 2.4) - 0.055;
  };
  return [gammaCorrect(red), gammaCorrect(green), gammaCorrect(blue)];
};
LABColor.prototype.asCSS_RGB = function() {
  var _b, b, g, normalize, r;
  _b = this.asSRGB();
  r = _b[0];
  g = _b[1];
  b = _b[2];
  if (r < 0 || r > 1) {
    return "rgb(0, 0, 0)";
  }
  if (g < 0 || g > 1) {
    return "rgb(0, 0, 0)";
  }
  if (b < 0 || b > 1) {
    return "rgb(0, 0, 0)";
  }
  normalize = function(x) {
    if (x > 1) {
      return 1;
    } else if (x < 0) {
      return 0;
    } else {
      return x;
    }
  };
  r = normalize(r);
  g = normalize(g);
  b = normalize(b);
  return ("rgb(" + (round(r * 255)) + ", " + (round(g * 255)) + ", " + (round(b * 255)) + ")");
};
LABColor.fromSRGB = function(red, green, blue) {
  var gammaUncorrect;
  gammaUncorrect = function(c) {
    return c <= 0.04045 ? c / 12.92 : pow((c + 0.055) / (1 + 0.055), 2.4);
  };
  return LABColor.fromLRGB(gammaUncorrect(red), gammaUncorrect(green), gammaUncorrect(blue));
};
LABColor.fromLRGB = function(red, green, blue) {
  var _b, _c, _d, _e, m, x, y, z;
  m = [[0.4124, 0.3576, 0.1805], [0.2126, 0.7152, 0.0722], [0.0193, 0.1192, 0.9505]];
  _b = matrixMultiply(m, [[red], [green], [blue]]);
  _c = _b[0];
  x = _c[0];
  _d = _b[1];
  y = _d[0];
  _e = _b[2];
  z = _e[0];
  return LABColor.fromXYZ(x, y, z);
};
LABColor.fromXYZ = function(x, y, z) {
  var a, b, f, l;
  f = function(t) {
    return t > pow(6 / 29, 3) ? pow(t, 1 / 3) : pow(29 / 6, 2) * t / 3 + 4 / 29;
  };
  l = 116 * f(y / refY) - 16;
  a = 500 * (f(x / refX) - f(y / refY));
  b = 200 * (f(y / refY) - f(z / refZ));
  return LABColor.fromLAB(l, a, b);
};
LABColor.fromLAB = function(l, a, b) {
  var c, h;
  h = atan2(b, a);
  c = sqrt(a * a + b * b);
  return new LABColor(h, c / 135, l / 100);
  /*
  a = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
  b = [[1, 3], [5, 7], [9, 11]]
  console.log(matrixMultiply(a, b))
  */
  /*
  c = new LABColor.fromLRGB(0.7, 0.0, 0.0)
  console.log(" hCL #{c.hue}, #{c.chroma}, #{c.lightness}")
  [l, a, b] = c.asLAB()
  console.log(" lab #{l}, #{a}, #{b}")
  [r, g, b] = c.asLRGB()
  console.log("srgb #{r}, #{g}, #{b}")
  */
};