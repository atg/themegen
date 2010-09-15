var _a, applyPostProcessing, contrast_function, generateBackgroundColor, generateCIECAMColors, generateColorForZone, generateHueClusters, generateRGBColors, generateTheme, generateZoneClusters, hueInterpolationPoints, randomHueInCluster, refX, refY, refZ, saturation_function;
/* MAIN CODE */
/* Possible options
      background_lightness
        "Light" | "Dark" | "Either"
      background_type
        | "Black & White"  # Only black and white are allowed as the blackground
        | "Grayscale"      # Only unsaturated grays are allowed as the background
        | "Neutral"        # A very light or dark neutral color will be picked that fits in with the rest of the theme
      contrast
        | -1 ≤ value < 0   # Global lightness is scaled towards the average
        | value = 0        # Global lightness is not changed
        | 0 < value ≤ 1    # Global lightness is scaled away from the average
      colorfulness
        | value = -1       # Everything is turned to grayscale
        | -1 < value < 0   # Global colorfulness is undersaturated
        | value = 0        # Global colorfulness is not changed
        | 0 < value ≤ 1    # Global colorfulness is oversaturated
        | value = 1        # It's a double rainbow, all the way
      hue_cluster_count
        | 1 ≤ value ≤ 6    # This is the number of hue "clusters" that colors will be randomly selected around
      hue_cluster_spacing
        | 10 ≤ value ≤ 360  # The maximum spacing between two hue clusters (in degrees)
      hue_cluster_width
        | 10 ≤ value ≤ 360  # How "wide" each cluster is (a multiplier of standard deviation)
*/
generateTheme = function(options) {
  var comparator, theme;
  theme = {
    "options": options
  };
  theme["hue_clusters"] = generateHueClusters(theme);
  theme["background"] = generateBackgroundColor(theme);
  theme["zone_clusters"] = generateZoneClusters(theme['options']['hue_cluster_count'], theme["options"]["zones"]);
  comparator = function(a, b) {
    var c1, c2;
    c1 = centroid(a["values"]);
    c2 = centroid(b["values"]);
    if (c1 > c2) {
      return -1;
    } else if (c1 < c2) {
      return 1;
    } else {
      return 0;
    }
  };
  theme["zone_clusters"] = theme["zone_clusters"].sort(comparator);
  applyPostProcessing(theme);
  generateColors(theme);
  return theme["new_zones"];
};
generateHueClusters = function(theme) {
  var _a, center, clusterIsInvalid, hue_clusters, hue_count, hue_radius, hue_spacing, hue_width, i, j, limit, options;
  options = theme['options'];
  hue_clusters = [];
  hue_count = options['hue_cluster_count'];
  if (hue_count > 6) {
    hue_count = 6;
  }
  hue_width = options['hue_cluster_width'];
  if (hue_width < 10) {
    hue_width = 10;
  } else if (hue_width > 360 / (hue_count + 1)) {
    hue_width = 360 / (hue_count + 1);
  }
  hue_spacing = options['hue_cluster_spacing'];
  if (hue_spacing < 10) {
    hue_spacing = 10;
  } else if (hue_spacing > (360 - hue_count * hue_width) / hue_count) {
    hue_spacing = (360 - hue_count * hue_width) / hue_count;
  }
  hue_radius = hue_width / 2;
  theme['options']['hue_cluster_count'] = hue_count;
  theme['options']['hue_cluster_width'] = hue_width;
  theme['options']['hue_cluster_spacing'] = hue_spacing;
  limit = 150;
  for (i = 0; (0 <= limit ? i <= limit : i >= limit); (0 <= limit ? i += 1 : i -= 1)) {
    if (hue_clusters.length >= hue_count) {
      break;
    }
    center = randomInInterval(0, 360);
    clusterIsInvalid = false;
    if (i !== limit) {
      _a = (hue_clusters.length);
      for (j = 0; (0 <= _a ? j < _a : j > _a); (0 <= _a ? j += 1 : j -= 1)) {
        if ((center > hue_clusters[i] && hue_clusters[i] + hue_width / 2 > center) || (center < hue_clusters[i] && hue_clusters[i] - hue_width / 2 < center)) {
          clusterIsInvalid = true;
          break;
        }
        if ((center > hue_clusters[i] && center - (hue_clusters[i] + hue_radius) > hue_spacing) || (center < hue_clusters[i] && (hue_clusters[i] - hue_radius) - center > hue_spacing)) {
          clusterIsInvalid = true;
          break;
        }
      }
    }
    if (clusterIsInvalid === false) {
      hue_clusters.push(center);
    }
  }
  return hue_clusters;
};
generateBackgroundColor = function(theme) {
  var c, chroma, discrete_chroma, discrete_lightness, hue, isDark, lightness, maximumLightnessDifferenceFromEndpoint, plain_vc, primary_cluster;
  discrete_lightness = theme["background_lightness"];
  isDark = false;
  if (discrete_lightness === "Dark") {
    isDark = true;
  } else if (discrete_lightness === "Either") {
    isDark = randomInInteval(0.0, 1.0) > 0.5;
  }
  theme["is_dark"] = isDark;
  lightness = 1.0;
  maximumLightnessDifferenceFromEndpoint = 0.1;
  discrete_chroma = theme["background_type"];
  if (discrete_chroma === "Black/white") {
    lightness = isDark ? 0.0 : 1.0;
  } else {
    lightness = randomInInterval(0.0, maximumLightnessDifferenceFromEndpoint);
    if (!isDark) {
      lightness = 1.0 - lightness;
    }
  }
  hue = 0.0;
  chroma = 0.0;
  if (discrete_chroma === "Neutral") {
    primary_cluster = theme["hue_clusters"][0];
    hue = randomHueInCluster(primary_cluster, theme["options"]["hue_cluster_width"]);
    if (isDark) {
      chroma = 0.5;
    } else {
      chroma = 0.75;
    }
  }
  plain_vc = CIECAMColor.vcWithBackground(95.05, 100, 108.88);
  c = CIECAMColor(theme["background"][0], theme["background"][1], theme["background"][2]);
  theme["rgb_background"] = c.asRGB(plain_vc);
  return [hue, chroma, lightness];
};
randomHueInCluster = function(primary_cluster, width) {
  return modnormalRandomInInterval(primary_cluster - width / 2, primary_cluster + width / 2, primary_cluster);
};
generateZoneClusters = function(k, zones) {
  var _a, _b, _c, zone;
  _b = zones;
  for (_a = 0, _c = _b.length; _a < _c; _a++) {
    zone = _b[_a];
    zone["values"] = {
      "importance": exp(0.5 * zone["importance"]),
      "likeness": zone["likeness"]
    };
  }
  return kmeans(k, zone, euclideanMetric);
};
generateCIECAMColors = function(theme) {
  var _a, _b, _c, _d, _e, _f, hue_cluster, i, new_zones, zone;
  new_zones = [];
  _a = []; _b = theme["zone_clusters"].length;
  for (i = i; (i <= _b ? i < _b : i > _b); (i <= _b ? i += 1 : i -= 1)) {
    _a.push((function() {
      hue_cluster = theme["hue_clusters"][i];
      _c = []; _e = theme["zone_clusters"][i];
      for (_d = 0, _f = _e.length; _d < _f; _d++) {
        zone = _e[_d];
        _c.push(zone["color"] = generateColorForZone(theme, zone, hue_cluster));
      }
      return _c;
    })());
  }
  return _a;
};
generateColorForZone = function(theme, zone, hue_cluster) {
  var chroma, hue, isDark, lightness;
  isDark = theme["is_dark"];
  hue = randomHueInCluster(primary_cluster, theme["options"]["hue_cluster_width"]);
  chroma = 0;
  if (isDark) {
    chroma = randomInInterval(0.3, 0.5);
  } else {
    chroma = randomInInterval(0.2, 0.3);
  }
  if (isDark) {
    lightness = randomInInterval(1.35, 1.60);
  } else {
    lightness = randomInInterval(0.6, 0.7);
  }
  return [hue, chroma, lightness];
};
contrast_function = function(k, x, mu) {
  /*
  Identities
      f(1, x) = mu
      f(0, x) = c
      f(-1, x) = {1, 0}
  */
  if (x === mu || k === 0) {
    return x;
  }
  if (x < mu) {
    if (k > 0) {
      return scale(x, mu - x, k);
    } else {
      return scale(0, x, 1 - k);
    }
  }
  if (x > mu) {
    if (k > 0) {
      return scale(mu, x - mu, k);
    } else {
      return scale(x, 1, 1 - k);
    }
  }
};
saturation_function = function(k, x) {
  if (k === 0) {
    return x;
  }
  if (k < 0) {
    return scale(0, x, 1 - k);
  } else {
    return scale(x, 1, k);
  }
};
applyPostProcessing = function(theme) {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _s, _t, average_lightness, cluster, colorfulness, contrast, count, zone;
  average_lightness = 0;
  count = 0;
  _b = theme["zone_clusters"];
  for (_a = 0, _c = _b.length; _a < _c; _a++) {
    cluster = _b[_a];
    _e = cluster;
    for (_d = 0, _f = _e.length; _d < _f; _d++) {
      zone = _e[_d];
      average_lightness += zone["color"][2];
      count += 1;
    }
  }
  average_lightness /= count;
  contrast = theme["contrast"];
  _h = theme["zone_clusters"];
  for (_g = 0, _i = _h.length; _g < _i; _g++) {
    cluster = _h[_g];
    _k = cluster;
    for (_j = 0, _l = _k.length; _j < _l; _j++) {
      zone = _k[_j];
      zone["color"][1] = contrast_function(contrast, zone["color"][1], average_lightness);
    }
  }
  /*
  average_colorfulness
  for cluster in theme["zone_clusters"]
      for zone in cluster
          average_colorfulness += zone["color"][1]

  average_colorfulness /= count
  */
  colorfulness = theme["colorfulness"];
  _m = []; _o = theme["zone_clusters"];
  for (_n = 0, _p = _o.length; _n < _p; _n++) {
    cluster = _o[_n];
    _m.push((function() {
      _q = []; _s = cluster;
      for (_r = 0, _t = _s.length; _r < _t; _r++) {
        zone = _s[_r];
        _q.push(zone["color"][1] = saturation_function(colorfulness, zone["color"][1]));
      }
      return _q;
    })());
  }
  return _m;
};
generateRGBColors = function(theme) {
  var _a, _b, _c, _d, _e, _f, background_vc, c, cluster, new_zones, rgb_background, zone;
  rgb_background = theme["rgb_background"];
  background_vc = CIECAMColor.vcWithBackground(rgb_background[0], rgb_background[1], rgb_background[2]);
  new_zones = [];
  _b = theme["zone_clusters"];
  for (_a = 0, _c = _b.length; _a < _c; _a++) {
    cluster = _b[_a];
    _e = theme["zone_clusters"][i];
    for (_d = 0, _f = _e.length; _d < _f; _d++) {
      zone = _e[_d];
      c = CIECAMColor(zone["color"][0], zone["color"][1], zone["color"][2]);
      zone["rgb"] = c.asRGB(background_vc);
      new_zones.push(zone);
    }
  }
  return (theme["new_zones"] = new_zones);
};
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