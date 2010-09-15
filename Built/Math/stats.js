var modnormalRandomInInterval, normalRandom, random, randomInInterval;
/* RANDOM NUMBER GENERATION */
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