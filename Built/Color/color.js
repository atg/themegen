var CIECAMColor, LABColor, RGBColor;
CIECAMColor = function(_a, _b, _c) {
  this.lightness = _c;
  this.chroma = _b;
  this.hue = _a;
  return this;
};
CIECAMColor.vcWithBackground = function(r, g, b) {
  var _a, vc;
  vc = CIECAM02_ViewingConditions();
  vc.setBackground(0.2);
  vc.setAverage();
  _a = cat02_to_xyz(r, g, b);
  vc.xw = _a[0];
  vc.yw = _a[1];
  vc.zw = _a[2];
  return [vc.xw, vc.yw, vc.zw];
};
CIECAMColor.prototype.asRGB = function(vc) {
  var c;
  c = CIECAM02_Color();
  return ciecam_to_xyz(this.lightness * 100, this.chroma * 100, this.hue);
};
RGBColor = function(_a, _b, _c) {
  this.lightness = _c;
  this.chroma = _b;
  this.hue = _a;
  return this;
};
RGBColor.prototype.asHSL = function(hueInterpolationPoints) {
  var a, b, count, i, newHue, offset, p, u, v, x, xs;
  x = this.hue / (2 * pi);
  xs = hueInterpolationPoints;
  count = xs.length - 1;
  newHue = 0;
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
  return [newHue * 2 * pi, this.chroma, this.lightness];
};
RGBColor.prototype.asRGB = function() {
  var _a, _b, _c, _d, _e, _f, _g, _h, b, c, g, h, h_dash, l, m, r, s, x;
  _a = this.asHSL();
  h = _a[0];
  s = _a[1];
  l = _a[2];
  c = s;
  h_dash = h / (pi / 3);
  x = c * (1 - Math.abs(h_dash % 2 - 1));
  if ((0 <= h_dash) && (h_dash < 1)) {
    _b = [c, x, 0];
    r = _b[0];
    g = _b[1];
    b = _b[2];
  } else if ((1 <= h_dash) && (h_dash < 2)) {
    _c = [x, c, 0];
    r = _c[0];
    g = _c[1];
    b = _c[2];
  } else if ((2 <= h_dash) && (h_dash < 3)) {
    _d = [0, c, x];
    r = _d[0];
    g = _d[1];
    b = _d[2];
  } else if ((3 <= h_dash) && (h_dash < 4)) {
    _e = [0, x, c];
    r = _e[0];
    g = _e[1];
    b = _e[2];
  } else if ((4 <= h_dash) && (h_dash < 5)) {
    _f = [x, 0, c];
    r = _f[0];
    g = _f[1];
    b = _f[2];
  } else if ((5 <= h_dash) && (h_dash < 6)) {
    _g = [c, 0, x];
    r = _g[0];
    g = _g[1];
    b = _g[2];
  } else {
    _h = [0, 0, 0];
    r = _h[0];
    g = _h[1];
    b = _h[2];
  }
  m = l - (0.30 * r + 0.59 * g + 0.11 * b);
  return [r + m, g + m, b + m];
};
RGBColor.prototype.asCSS_RGB = function() {
  var _a, b, g, normalize, r;
  _a = this.asRGB();
  r = _a[0];
  g = _a[1];
  b = _a[2];
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
LABColor = function(_a, _b, _c) {
  this.lightness = _c;
  this.chroma = _b;
  this.hue = _a;
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
  var _a, a, b, delta, fx, fy, fz, l, x, y, z;
  _a = this.asLAB();
  l = _a[0];
  a = _a[1];
  b = _a[2];
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
  var _a, _b, _c, _d, _e, blue, green, m, red, x, y, z;
  _a = this.asXYZ();
  x = _a[0];
  y = _a[1];
  z = _a[2];
  m = [[3.2406, -1.5372, -0.4986], [-0.9689, 1.8758, 0.0415], [0.0557, -0.2040, 1.0570]];
  _b = matrixMultiply(m, [[x], [y], [z]]);
  _c = _b[0];
  red = _c[0];
  _d = _b[1];
  green = _d[0];
  _e = _b[2];
  blue = _e[0];
  return [red, green, blue];
};
LABColor.prototype.asSRGB = function() {
  var _a, blue, gammaCorrect, green, red;
  _a = this.asLRGB();
  red = _a[0];
  green = _a[1];
  blue = _a[2];
  gammaCorrect = function(c) {
    return c <= 0.0031308 ? 12.92 * c : (1 + 0.055) * pow(c, 1 / 2.4) - 0.055;
  };
  return [gammaCorrect(red), gammaCorrect(green), gammaCorrect(blue)];
};
LABColor.prototype.asCSS_RGB = function() {
  var _a, b, g, normalize, r;
  _a = this.asSRGB();
  r = _a[0];
  g = _a[1];
  b = _a[2];
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
  var _a, _b, _c, _d, m, x, y, z;
  m = [[0.4124, 0.3576, 0.1805], [0.2126, 0.7152, 0.0722], [0.0193, 0.1192, 0.9505]];
  _a = matrixMultiply(m, [[red], [green], [blue]]);
  _b = _a[0];
  x = _b[0];
  _c = _a[1];
  y = _c[0];
  _d = _a[2];
  z = _d[0];
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
};