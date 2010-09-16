var modnormalRandomInInterval, normalRandom, normalRandomInInterval, randomInInterval;
/* RANDOM NUMBER GENERATION */
randomInInterval = function(a, b) {
  return a + random() * (b - a);
};
normalRandom = function() {
  var u, v;
  u = random();
  v = random();
  return sqrt(-2 * log(u)) * cos(2 * pi * v);
};
normalRandomInInterval = function(a, b) {
  return a + normalRandom() * (b - a);
};
modnormalRandomInInterval = function(a, b, center) {
  var r;
  r = normalRandom();
  r *= b - a;
  r += center - (b - a) / 2;
  r = fmod(r, b - a);
  r += a;
  return r;
};