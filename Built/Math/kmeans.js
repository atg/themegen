var centroid, closest, find_groupings, find_initial_groupings, kmeans, max_difference, update_means;
kmeans = function(k, points, metric) {
  var groupings, i, means, old_means, threshhold;
  groupings = find_initial_groupings(k, points, metric);
  return groupings;
  means = update_means(k, groupings);
  groupings = null;
  threshhold = 1e-5;
  for (i = 1; i <= 25; i++) {
    groupings = find_groupings(k, points, means, metric);
    old_means = means.slice(0);
    means = update_means(k, groupings);
    if (max_difference(old_means, means, metric) < threshhold) {
      break;
    }
  }
  alert(JSON.stringify(groupings.map(function(a) {
    return a.length;
  })));
  return groupings;
};
find_initial_groupings = function(k, points, metric) {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, all_indexes, grouping, i, index, index_index, indexes, initialGroupings, j, m, max_count, means, min_count, n_index, nearest, nearestGrouping, s, smallest, targetGrouping;
  means = [];
  /*
  for i in [0...k]
      mean =
          'values':
              'likeness': random()
              'importance': random()

      means.push(mean)
  */
  /*
  angle = randomInInterval(0, 2 * pi)
  for i in [0...k]
      mean =
          'values':
              'likeness': 0.5 * cos(angle) + 0.5
              'importance': 0.5 * sin(angle) + 0.5

      means.push(mean)

      angle += 2 * pi / k
      angle = angle % 2 * pi
  */
  all_indexes = (function() {
    _a = []; _b = points.length;
    for (i = 0; (0 <= _b ? i < _b : i > _b); (0 <= _b ? i += 1 : i -= 1)) {
      _a.push(i);
    }
    return _a;
  })();
  indexes = [];
  for (i = 0; (0 <= k ? i < k : i > k); (0 <= k ? i += 1 : i -= 1)) {
    index_index = floor(randomInInterval(0, all_indexes.length));
    index = all_indexes[index_index];
    all_indexes.splice(index_index, 1);
    indexes.push(index);
    means.push(points[index]);
  }
  initialGroupings = find_groupings(k, points, means, metric);
  min_count = floor(points.length / k);
  max_count = min_count + 1;
  _d = initialGroupings;
  for (_c = 0, _e = _d.length; _c < _e; _c++) {
    grouping = _d[_c];
    if (grouping.length > min_count) {
      continue;
    }
    _f = (min_count - grouping.length);
    for (j = 0; (0 <= _f ? j < _f : j > _f); (0 <= _f ? j += 1 : j -= 1)) {
      m = centroid(grouping);
      if (typeof m === "undefined") {
        break;
      }
      nearest = null;
      smallest = -1;
      nearestGrouping = null;
      _h = initialGroupings;
      for (_g = 0, _i = _h.length; _g < _i; _g++) {
        targetGrouping = _h[_g];
        if (targetGrouping.length <= max_count) {
          continue;
        }
        n_index = closest(targetGrouping, m, metric);
        if (n_index === -1) {
          continue;
        }
        s = metric(targetGrouping[n_index], m);
        if (smallest === -1 || s < smallest) {
          smallest = s;
          nearest = targetGrouping[n_index];
          nearestGrouping = targetGrouping;
        }
      }
      if (smallest === -1) {
        break;
      }
      nearestGrouping.splice(nearestGrouping.indexOf(nearest), 1);
      grouping.push(nearest);
    }
  }
  return initialGroupings;
  means = update_means(k, initialGroupings);
  alert(JSON.stringify(initialGroupings.map(function(a) {
    return a.length;
  })));
  /*
  # We just choose arbitrary means here, but it would be better to chose them agglomeratively
  l = floor(points.length / k)

  position = 0
  means = []
  for i in [0...k]
      if i == k - 1
          means[i] = centroid(points.slice(position))
      else
          means[i] = centroid(points.slice(position, position + l))
          position += l

  return means
  */
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