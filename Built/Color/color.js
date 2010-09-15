var CIECAMColor, LABColor, RGBColor, _a, refX, refY, refZ, rgb_to_css;
_a = [1, 1, 1];
refX = _a[0];
refY = _a[1];
refZ = _a[2];
rgb_to_css = function(rgb) {
  var _b, b, g, normalize, r;
  _b = rgb;
  r = _b[0];
  g = _b[1];
  b = _b[2];
  normalize = function(x) {
    if (x > 255) {
      return 255;
    } else if (x < 0) {
      return 0;
    } else {
      return x;
    }
  };
  r = normalize(r);
  g = normalize(g);
  b = normalize(b);
  return ("rgb(" + (round(r)) + ", " + (round(g)) + ", " + (round(b)) + ")");
};
CIECAMColor = function(_b, _c, _d) {
  this.lightness = _d;
  this.chroma = _c;
  this.hue = _b;
  return this;
};
CIECAMColor.normalVC = function() {
  var vc;
  vc = new CIECAM02_ViewingConditions();
  vc.setBackground(0.2);
  vc.setAverage();
  vc.compute();
  return vc;
};
CIECAMColor.vcWithBackground = function(r, g, b) {
  var _b, vc;
  vc = new CIECAM02_ViewingConditions();
  vc.setBackground(0.2);
  vc.setAverage();
  _b = cat02_to_xyz(r, g, b);
  vc.xw = _b[0];
  vc.yw = _b[1];
  vc.zw = _b[2];
  vc.compute();
  return vc;
};
CIECAMColor.prototype.asRGB = function(vc) {
  var _b, c, x, y, z;
  c = new CIECAM02_Color();
  _b = c.ciecam_to_xyz(this.lightness * 100, this.chroma * 100, this.hue, vc);
  x = _b[0];
  y = _b[1];
  z = _b[2];
  return xyz_to_cat02(x, y, z);
};
/*
x = @hue / (2 * pi)
xs = hueInterpolationPoints
count = xs.length - 1

newHue = 0

for i in [0...count]
    a = i / count
    b = (i + 1) / count

    if a < x <= b
        p = (x - a) / (b - a)

        if i == 0
            offset = (1 - xs[0])
            u = 0
            v = offset + xs[i + 1]

            newHue = (1 - p) * u + p * v - offset

            if newHue < 0
                newHue += 1.0

        else
            u = xs[i]
            v = xs[i + 1]
            newHue = (1 - p) * u + p * v
        break

return [newHue * 2 * pi, @chroma, @lightness]
*/
RGBColor = function(_b, _c, _d) {
  this.lightness = _d;
  this.chroma = _c;
  this.hue = _b;
  return this;
};
RGBColor.prototype.asHSL = function(hueInterpolationPoints) {
  return [this.hue, this.chroma, this.lightness];
};
RGBColor.prototype.asRGB = function() {
  var _b, _c, _d, _e, _f, _g, _h, _i, b, c, g, h, h_dash, l, m, r, s, x;
  _b = this.asHSL();
  h = _b[0];
  s = _b[1];
  l = _b[2];
  c = l <= 1 / 2 ? 2 * l * s : (2 - 2 * l) * s;
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
  m = l - (c / 2);
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
RGBColor.fromRGB = function(r, g, b) {
  var maxV, minV;
  maxV = maximum([r, g, b]);
  minV = minimum([r, g, b]);
  if ((r === g) && (g === b)) {
    this.hue = 0;
  } else if (r > g && r > b) {
    this.hue = (60 * (g - b) / (maxV - minV) + 360) % 360;
  } else if (g > r && g > b) {
    this.hue = (60 * (b - r) / (maxV - minV) + 120);
  } else if (b > r && b > g) {
    this.hue = (60 * (r - g) / (maxV - minV) + 240);
  }
  this.hue = this.hue * 2 * pi / 360;
  this.lightness = (maxV + minV) / 2;
  if ((r === g) && (g === b)) {
    this.chroma = 0;
  } else if (this.lightness <= 1 / 2) {
    this.chroma = (maxV - minV) / (maxV + minV);
  } else if (this.lightness >= 1 / 2) {
    this.chroma = (maxV - minV) / (2 - maxV - minV);
  }
  return new RGBColor(this.hue, this.chroma, this.lightness);
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
};