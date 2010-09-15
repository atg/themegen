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
  l = floor(points.length / k);
  position = 0;
  means = [];
  for (i = 0; (0 <= k ? i < k : i > k); (0 <= k ? i += 1 : i -= 1)) {
    if (i === k - 1) {
      means[i] = centroid(points.slice(position));
    } else {
      means[i] = centroid(points.slice(position, position + l));
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
  var _a, _b, _c, closest_mean_index, groupings, i, p;
  groupings = [];
  for (i = 0; (0 <= k ? i < k : i > k); (0 <= k ? i += 1 : i -= 1)) {
    groupings.push([]);
  }
  _b = points;
  for (_a = 0, _c = _b.length; _a < _c; _a++) {
    p = _b[_a];
    closest_mean_index = closest(means, p, metric);
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
  var _a, _b, _c, centroid_point, p;
  centroid_point = {
    "values": {
      "likeness": 0,
      "importance": 0
    }
  };
  _b = points.sort();
  for (_a = 0, _c = _b.length; _a < _c; _a++) {
    p = _b[_a];
    centroid_point.values["likeness"] += p.values["likeness"] / points.length;
    centroid_point.values["importance"] += p.values["importance"] / points.length;
  }
  return centroid_point;
};
closest = function(points, point, metric) {
  var _a, d, i, minimum, p, smallest_distance;
  if (points.length === 0) {
    return -1;
  }
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