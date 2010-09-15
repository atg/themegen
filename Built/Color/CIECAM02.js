var Aab_to_rgb, CIECAM02_Color, CIECAM02_ViewingConditions, cat02_to_hpe, cat02_to_xyz, hpe_to_xyz, inverse_nonlinear_adaptation, nonlinear_adaptation, xyz_to_cat02;
xyz_to_cat02 = function(x, y, z) {
  var b, g, r;
  r = (0.7328 * x) + (0.4296 * y) - (0.1624 * z);
  g = (-0.7036 * x) + (1.6975 * y) + (0.0061 * z);
  b = (0.0030 * x) + (0.0136 * y) + (0.9834 * z);
  return [r, g, b];
};
cat02_to_xyz = function(r, g, b) {
  var x, y, z;
  x = (1.096124 * r) - (0.278869 * g) + (0.182745 * b);
  y = (0.454369 * r) + (0.473533 * g) + (0.072098 * b);
  z = (-0.009628 * r) - (0.005698 * g) + (1.015326 * b);
  return [x, y, z];
};
hpe_to_xyz = function(r, g, b) {
  var x, y, z;
  x = (1.910197 * r) - (1.112124 * g) + (0.201908 * b);
  y = (0.370950 * r) + (0.629054 * g) - (0.000008 * b);
  z = b;
  return [x, y, z];
};
cat02_to_hpe = function(r, g, b) {
  var bh, gh, rh;
  rh = (0.7409792 * r) + (0.2180250 * g) + (0.0410058 * b);
  gh = (0.2853532 * r) + (0.6242014 * g) + (0.0904454 * b);
  bh = (-0.0096280 * r) - (0.0056980 * g) + (1.0153260 * b);
  return [rh, gh, bh];
};
nonlinear_adaptation = function(c, fl) {
  var p;
  p = pow((fl * c) / 100.0, 0.42);
  return ((400.0 * p) / (27.13 + p)) + 0.1;
};
inverse_nonlinear_adaptation = function(c, fl) {
  return (100.0 / fl) * pow((27.13 * abs(c - 0.1)) / (400.0 - abs(c - 0.1)), 1.0 / 0.42);
};
Aab_to_rgb = function(A, aa, bb, nbb) {
  var b, g, r, x;
  x = (A / nbb) + 0.305;
  r = (0.32787 * x) + (0.32145 * aa) + (0.20527 * bb);
  g = (0.32787 * x) - (0.63507 * aa) - (0.18603 * bb);
  b = (0.32787 * x) - (0.15681 * aa) - (4.49038 * bb);
  return [r, g, b];
};
CIECAM02_Color = function() {};
CIECAM02_Color.prototype.xyz_to_ciecam = function(x, y, z, viewing_conditions) {
  var _a, _b, _c, _d, a, b, bc, bp, bpa, bw, ca, cb, et, g, gc, gp, gpa, gw, r, rc, rp, rpa, rw, t, t_vc, temp;
  _a = [x, y, z];
  this.x = _a[0];
  this.y = _a[1];
  this.z = _a[2];
  t_vc = viewing_conditions;
  _b = xyz_to_cat02(this.x, this.y, this.z);
  r = _b[0];
  g = _b[1];
  b = _b[2];
  _c = xyz_to_cat02(t_vc.xw, t_vc.yw, t_vc.zw);
  rw = _c[0];
  gw = _c[1];
  bw = _c[2];
  rc = r * (((t_vc.yw * t_vc.d) / rw) + (1.0 - t_vc.d));
  gc = g * (((t_vc.yw * t_vc.d) / gw) + (1.0 - t_vc.d));
  bc = b * (((t_vc.yw * t_vc.d) / bw) + (1.0 - t_vc.d));
  _d = cat02_to_hpe(rc, gc, bc);
  rp = _d[0];
  gp = _d[1];
  bp = _d[2];
  rpa = nonlinear_adaptation(rp, t_vc.fl);
  gpa = nonlinear_adaptation(gp, t_vc.fl);
  bpa = nonlinear_adaptation(bp, t_vc.fl);
  ca = rpa - ((12.0 * gpa) / 11.0) + (bpa / 11.0);
  cb = (1.0 / 9.0) * (rpa + gpa - (2.0 * bpa));
  this.h = (180.0 / pi) * atan2(cb, ca);
  if (this.h < 0.0) {
    this.h += 360.0;
  }
  if (this.h < 20.14) {
    temp = ((this.h + 122.47) / 1.2) + ((20.14 - this.h) / 0.8);
    this.H = 300 + (100 * ((this.h + 122.47) / 1.2)) / temp;
  } else if (this.h < 90.0) {
    temp = ((this.h - 20.14) / 0.8) + ((90.00 - this.h) / 0.7);
    this.H = (100 * ((this.h - 20.14) / 0.8)) / temp;
  } else if (this.h < 164.25) {
    temp = ((this.h - 90.00) / 0.7) + ((164.25 - this.h) / 1.0);
    this.H = 100 + ((100 * ((this.h - 90.00) / 0.7)) / temp);
  } else if (this.h < 237.53) {
    temp = ((this.h - 164.25) / 1.0) + ((237.53 - this.h) / 1.2);
    this.H = 200 + ((100 * ((this.h - 164.25) / 1.0)) / temp);
  } else {
    temp = ((this.h - 237.53) / 1.2) + ((360 - this.h + 20.14) / 0.8);
    this.H = 300 + ((100 * ((this.h - 237.53) / 1.2)) / temp);
  }
  a = ((2.0 * rpa) + gpa + ((1.0 / 20.0) * bpa) - 0.305) * t_vc.nbb;
  this.J = 100.0 * pow(a / t_vc.aw, t_vc.c * t_vc.z);
  et = (1.0 / 4.0) * (cos(((this.h * pi) / 180.0) + 2.0) + 3.8);
  t = ((50000.0 / 13.0) * t_vc.nc * t_vc.ncb * et * sqrt((ca * ca) + (cb * cb))) / (rpa + gpa + (21.0 / 20.0) * bpa);
  this.C = pow(t, 0.9) * sqrt(this.J / 100.0) * pow(1.64 - pow(0.29, t_vc.n), 0.73);
  this.Q = (4.0 / t_vc.c) * sqrt(this.J / 100.0) * (t_vc.aw + 4.0) * pow(t_vc.fl, 0.25);
  this.M = this.C * pow(t_vc.fl, 0.25);
  this.s = 100.0 * sqrt(this.M / this.Q);
  this.ac = this.C * cos((this.h * pi) / 180.0);
  this.bc = this.C * sin((this.h * pi) / 180.0);
  this.am = this.M * cos((this.h * pi) / 180.0);
  this.bm = this.M * sin((this.h * pi) / 180.0);
  this.as = this.s * cos((this.h * pi) / 180.0);
  return (this.bs = this.s * sin((this.h * pi) / 180.0));
};
CIECAM02_Color.prototype.ciecam_to_xyz = function(J, C, h, viewing_conditions) {
  var _a, _b, _c, _d, _e, _f, a, bc, bp, bpa, bw, ca, cb, et, gc, gp, gpa, gw, hr, p1, p2, p3, p4, p5, rc, rp, rpa, rw, t, t_vc, tx, ty, tz;
  _a = [J, C, h];
  this.J = _a[0];
  this.C = _a[1];
  this.h = _a[2];
  t_vc = viewing_conditions;
  _b = xyz_to_cat02(t_vc.xw, t_vc.yw, t_vc.zw);
  rw = _b[0];
  gw = _b[1];
  bw = _b[2];
  t = pow(this.C / (sqrt(this.J / 100.0) * pow(1.64 - pow(0.29, t_vc.n), 0.73)), 1.0 / 0.9);
  et = (1.0 / 4.0) * (cos(((this.h * pi) / 180.0) + 2.0) + 3.8);
  a = pow(this.J / 100.0, 1.0 / (t_vc.c * t_vc.z)) * t_vc.aw;
  p1 = ((50000.0 / 13.0) * t_vc.nc * t_vc.ncb) * et / t;
  p2 = (a / t_vc.nbb) + 0.305;
  p3 = 21.0 / 20.0;
  hr = (this.h * pi) / 180.0;
  if (abs(sin(hr)) >= abs(cos(hr))) {
    p4 = p1 / sin(hr);
    cb = (p2 * (2.0 + p3) * (460.0 / 1403.0)) / (p4 + (2.0 + p3) * (220.0 / 1403.0) * (cos(hr) / sin(hr)) - (27.0 / 1403.0) + p3 * (6300.0 / 1403.0));
    ca = cb * (cos(hr) / sin(hr));
  } else {
    p5 = p1 / cos(hr);
    ca = (p2 * (2.0 + p3) * (460.0 / 1403.0)) / (p5 + (2.0 + p3) * (220.0 / 1403.0) - ((27.0 / 1403.0) - p3 * (6300.0 / 1403.0)) * (sin(hr) / cos(hr)));
    cb = ca * (sin(hr) / cos(hr));
  }
  _c = Aab_to_rgb(a, ca, cb, t_vc.nbb);
  rpa = _c[0];
  gpa = _c[1];
  bpa = _c[2];
  rp = inverse_nonlinear_adaptation(rpa, t_vc.fl);
  gp = inverse_nonlinear_adaptation(gpa, t_vc.fl);
  bp = inverse_nonlinear_adaptation(bpa, t_vc.fl);
  _d = hpe_to_xyz(rp, gp, bp);
  tx = _d[0];
  ty = _d[1];
  tz = _d[2];
  _e = xyz_to_cat02(tx, ty, tz);
  rc = _e[0];
  gc = _e[1];
  bc = _e[2];
  this.r = rc / (((t_vc.yw * t_vc.d) / rw) + (1.0 - t_vc.d));
  this.g = gc / (((t_vc.yw * t_vc.d) / gw) + (1.0 - t_vc.d));
  this.b = bc / (((t_vc.yw * t_vc.d) / bw) + (1.0 - t_vc.d));
  _f = cat02_to_xyz(this.r, this.g, this.b);
  this.x = _f[0];
  this.y = _f[1];
  this.z = _f[2];
  return [this.x, this.y, this.z];
};
CIECAM02_ViewingConditions = function() {};
CIECAM02_ViewingConditions.prototype.setBackground = function(field_luminance) {
  var _a;
  _a = [4, brightness * 100, 95.05, 100, 108.88];
  this.la = _a[0];
  this.yb = _a[1];
  this.xw = _a[2];
  this.yw = _a[3];
  this.zw = _a[4];
  return [this.la, this.yb, this.xw, this.yw, this.zw];
};
CIECAM02_ViewingConditions.prototype.setAverage = function() {
  var _a;
  _a = [1, 0.69, 1];
  this.f = _a[0];
  this.c = _a[1];
  this.nc = _a[2];
  return [this.f, this.c, this.nc];
};
CIECAM02_ViewingConditions.prototype.setDim = function() {
  var _a;
  _a = [0.9, 0.59, 0.95];
  this.f = _a[0];
  this.c = _a[1];
  this.nc = _a[2];
  return [this.f, this.c, this.nc];
};
CIECAM02_ViewingConditions.prototype.setDark = function() {
  var _a;
  _a = [0.8, 0.525, 0.8];
  this.f = _a[0];
  this.c = _a[1];
  this.nc = _a[2];
  return [this.f, this.c, this.nc];
};
CIECAM02_ViewingConditions.prototype.compute = function() {
  this.n = this.yb / this.yw;
  this.z = 1.48 + pow(this.n, 0.5);
  this.fl = this.compute_fl();
  this.nbb = 0.725 * pow(1.0 / this.n, 0.2);
  this.ncb = this.nbb;
  this.d = (this.f * (1.0 - ((1.0 / 3.6) * exp((-this.la - 42.0) / 92.0))));
  return (this.aw = this.achromatic_response_to_white());
};
CIECAM02_ViewingConditions.prototype.compute_fl = function() {
  var k;
  k = 1.0 / ((5.0 * this.la) + 1.0);
  return 0.2 * pow(k, 4.0) * (5.0 * this.la) + 0.1 * (pow(1.0 - pow(k, 4.0), 2.0)) * (pow(5.0 * this.la, 1.0 / 3.0));
};
CIECAM02_ViewingConditions.prototype.achromatic_response_to_white = function() {
  var _a, _b, b, bc, bp, bpa, g, gc, gp, gpa, r, rc, rp, rpa;
  _a = xyz_to_cat02(this.xw, this.yw, this.zw);
  r = _a[0];
  g = _a[1];
  b = _a[2];
  rc = r * (((this.yw * this.d) / r) + (1.0 - this.d));
  gc = g * (((this.yw * this.d) / g) + (1.0 - this.d));
  bc = b * (((this.yw * this.d) / b) + (1.0 - this.d));
  _b = cat02_to_hpe(rc, gc, bc);
  rp = _b[0];
  gp = _b[1];
  bp = _b[2];
  rpa = nonlinear_adaptation(rp, this.fl);
  gpa = nonlinear_adaptation(gp, this.fl);
  bpa = nonlinear_adaptation(bp, this.fl);
  return ((2.0 * rpa) + gpa + ((1.0 / 20.0) * bpa) - 0.305) * this.nbb;
};