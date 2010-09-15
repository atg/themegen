var centroid, closest, find_groupings, find_initial_means, kmeans, max_difference, update_means;
kmeans = function(k, points, metric) {
  var groupings, means, old_means, threshhold;
  means = find_initial_means(k, points, metric);
  groupings = null;
  threshhold = 1e-5;
  while (true) {
    groupings = find_groupings(k, points, means, metric);
    old_means = means.slice(0);
    means = update_means(k, groupings);
    if (max_difference(old_means, means, metric) < threshhold) {
      break;
    }
  }
  return groupings;
};
find_initial_means = function(k, points, metric) {
  var i, l, means, position;
  l = floor((points.length + k - 1) / k);
  position = 0;
  means = [];
  for (i = 0; (0 <= k ? i < k : i > k); (0 <= k ? i += 1 : i -= 1)) {
    if (i === k - 1) {
      means[i] = points.slice(position);
    } else {
      means[i] = points.slice(position, position + l - 1);
      position += l;
    }
  }
  return means;
};
update_means = function(k, groupings) {
  var i, means;
  means = [];
  for (i = 0; (0 <= k ? i < k : i > k); (0 <= k ? i += 1 : i -= 1)) {
    means[i] = centroid(groupings[i]);
  }
  return means;
};
find_groupings = function(k, points, means, metric) {
  var _a, _b, _c, _d, closest_mean_index, groupings, p;
  groupings = [];
  _b = points;
  for (_a = 0, _c = _b.length; _a < _c; _a++) {
    p = _b[_a];
    closest_mean_index = closest(means, p, metric);
    if (!(typeof (_d = groupings[closest_mean_index]) !== "undefined" && _d !== null)) {
      groupings[closest_mean_index] = [];
    }
    groupings[closest_mean_index].push(p);
  }
  return groupings;
};
max_difference = function(a, b, metric) {
  var d, i, max, n;
  n = a.length;
  max = 0;
  for (i = 0; (0 <= n ? i < n : i > n); (0 <= n ? i += 1 : i -= 1)) {
    d = metric(a[i], b[i]);
    if (d > max) {
      max = d;
    }
  }
  return max;
};
centroid = function(points) {
  var _a, _b, _c, _d, _e, centroid_point, i, n, p;
  n = points.length;
  centroid_point = {
    "values": (function() {
      _a = [];
      for (i = 0; (0 <= n ? i < n : i > n); (0 <= n ? i += 1 : i -= 1)) {
        _a.push(0);
      }
      return _a;
    })()
  };
  _c = points.sort();
  for (_b = 0, _d = _c.length; _b < _d; _b++) {
    p = _c[_b];
    _e = p.values.length;
    for (i = 0; (0 <= _e ? i < _e : i > _e); (0 <= _e ? i += 1 : i -= 1)) {
      centroid_point.values[i] += p.values[i] / points.length;
    }
  }
  return centroid_point;
};
closest = function(points, point, metric) {
  var _a, d, i, minimum, p, smallest_distance;
  minimum = -1;
  smallest_distance = -1;
  _a = points.length;
  for (i = 0; (0 <= _a ? i < _a : i > _a); (0 <= _a ? i += 1 : i -= 1)) {
    p = points[i];
    d = metric(p, point);
    if (smallest_distance < 0 || d < smallest_distance) {
      smallest_distance = d;
      minimum = i;
    }
  }
  return minimum;
};