var applyPostProcessing, contrast_function, generateBackgroundColor, generateCIECAMColors, generateColorForZone, generateHueClusters, generateRGBColors, generateTheme, generateZoneClusters, randomHueInCluster, saturation_function;
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
  var comparator, theme, zones;
  theme = {
    "options": options
  };
  theme = generateHueClusters(theme);
  theme = generateBackgroundColor(theme);
  zones = options["zones"];
  theme["zone_clusters"] = generateZoneClusters(theme['options']['hue_cluster_count'], zones);
  comparator = function(a, b) {
    var c1, c2;
    c1 = centroid(a)["values"]["importance"];
    c2 = centroid(b)["values"]["importance"];
    if (c1 > c2) {
      return -1;
    } else if (c1 < c2) {
      return 1;
    } else {
      return 0;
    }
  };
  theme["zone_clusters"] = theme["zone_clusters"].sort(comparator);
  theme["new_zones"] = generateCIECAMColors(theme);
  applyPostProcessing(theme);
  generateRGBColors(theme);
  return theme;
};
generateHueClusters = function(theme) {
  var _a, _b, _c, c, center, clusterIsInvalid, cluster_boundary_radius, cluster_maximum_coverage_radius, hue_area_radius, hue_clusters, hue_count, hue_sample_radius, hue_spacing, hue_width, i, initial_cluster, limit, options;
  options = theme['options'];
  hue_clusters = [];
  hue_count = options['hue_cluster_count'];
  if (hue_count > 6) {
    hue_count = 6;
  }
  hue_count = 7;
  hue_width = options['hue_cluster_width'];
  hue_spacing = options['hue_cluster_spacing'];
  hue_sample_radius = hue_width / 2;
  hue_area_radius = hue_spacing / 2;
  hue_width = sample_range;
  theme['options']['hue_cluster_count'] = hue_count;
  theme['options']['hue_cluster_width'] = hue_width;
  theme['options']['hue_cluster_spacing'] = hue_spacing;
  initial_cluster = randomInInterval(0, 360);
  hue_clusters.push(initial_cluster);
  cluster_boundary_radius = cluster_boundary_range / 2;
  cluster_maximum_coverage_radius = cluster_maximum_coverage / 2;
  limit = 150;
  for (i = 0; (0 <= limit ? i <= limit : i >= limit); (0 <= limit ? i += 1 : i -= 1)) {
    if (hue_clusters.length >= hue_count) {
      break;
    }
    center = ffmod(randomInInterval(initial_cluster - cluster_maximum_coverage_radius, initial_cluster + cluster_maximum_coverage_radius), 360);
    clusterIsInvalid = false;
    if (i < limit - 20) {
      _b = hue_clusters;
      for (_a = 0, _c = _b.length; _a < _c; _a++) {
        c = _b[_a];
        if (angle_in_interval(center, ffmod(c - cluster_boundary_radius, 360), ffmod(c + cluster_boundary_radius, 360))) {
          clusterIsInvalid = true;
          break;
        }
      }
    }
    if (clusterIsInvalid === false) {
      hue_clusters.push(center);
    }
  }
  theme["hue_clusters"] = hue_clusters;
  return theme;
};
generateBackgroundColor = function(theme) {
  var c, chroma, discrete_chroma, discrete_lightness, hue, isDark, lightness, plain_vc, primary_cluster, r, rgb;
  discrete_lightness = theme["options"]["background_lightness"];
  isDark = false;
  if (discrete_lightness === "Dark") {
    isDark = true;
  } else if (discrete_lightness === "Light") {
    isDark = false;
  } else if (discrete_lightness === "Either") {
    isDark = random() > 0.5;
  }
  theme["is_dark"] = isDark;
  lightness = 1.0;
  discrete_chroma = theme["options"]["background_type"];
  if (discrete_chroma === "Any") {
    r = random();
    if (r < 0.3) {
      discrete_chroma = "Black & White";
    } else if ((0.3 < r) && (r < 0.6)) {
      discrete_chroma = "Grayscale";
    } else {
      discrete_chroma = "Neutral";
    }
  }
  if (discrete_chroma === "Black & White") {
    if (isDark) {
      lightness = bw_black;
    } else {
      lightness = bw_white;
    }
  } else if (discrete_chroma === "Grayscale") {
    if (isDark) {
      lightness = randomInInterval(gray_dark_min, gray_dark_max);
    } else {
      lightness = randomInInterval(gray_light_min, gray_light_max);
    }
  } else if (discrete_chroma === "Neutral") {
    if (isDark) {
      lightness = randomInInterval(neutral_dark_min, neutral_dark_max);
    } else {
      lightness = randomInInterval(neutral_light_min, neutral_light_max);
    }
  }
  if (discrete_chroma !== "Neutral") {
    c = new RGBColor(0.0, 0.0, lightness);
    rgb = c.asRGB();
    rgb = [rgb[0] * 255, rgb[1] * 255, rgb[2] * 255];
    theme["background"] = [0.0, 0.0, lightness];
    theme["rgb_background"] = rgb;
    return theme;
  } else {
    hue = 0.0;
    chroma = 0.0;
    primary_cluster = theme["hue_clusters"][0];
    hue = randomHueInCluster(primary_cluster, theme["options"]["hue_cluster_width"]);
    if (isDark) {
      chroma = randomInInterval(neutral_dark_chroma_min, neutral_dark_chroma_max);
    } else {
      chroma = randomInInterval(neutral_light_chroma_min, neutral_light_chroma_max);
    }
    plain_vc = new CIECAMColor.normalVC();
    c = new CIECAMColor(hue, chroma, lightness);
    rgb = c.asRGB(plain_vc);
    theme["background"] = [hue, chroma, lightness];
    theme["rgb_background"] = rgb;
    return theme;
  }
};
randomHueInCluster = function(primary_cluster, width) {
  var a, b, r;
  a = primary_cluster - width / 2;
  b = primary_cluster + width / 2;
  r = a + random() * (b - a);
  r = ffmod(r, 360);
  return r;
};
generateZoneClusters = function(k, zones) {
  var _a, _b, _c, zone;
  _b = zones;
  for (_a = 0, _c = _b.length; _a < _c; _a++) {
    zone = _b[_a];
    zone["values"] = {
      "importance": zone["importance"],
      "likeness": zone["likeness"]
    };
  }
  return kmeans(k, zones, euclideanMetric);
};
generateCIECAMColors = function(theme) {
  var _a, _b, _c, _d, hue_cluster, i, new_zones, zone;
  new_zones = [];
  _a = theme["zone_clusters"].length;
  for (i = 0; (0 <= _a ? i < _a : i > _a); (0 <= _a ? i += 1 : i -= 1)) {
    hue_cluster = theme["hue_clusters"][i];
    _c = theme["zone_clusters"][i];
    for (_b = 0, _d = _c.length; _b < _d; _b++) {
      zone = _c[_b];
      zone["color"] = generateColorForZone(theme, zone, hue_cluster);
      new_zones.push(zone);
    }
  }
  return new_zones;
};
generateColorForZone = function(theme, zone, hue_cluster) {
  var chroma, hue, imp, isDark, lightness;
  isDark = theme["is_dark"];
  hue = randomHueInCluster(hue_cluster, theme["options"]["hue_cluster_width"]);
  imp = 2 * zone["importance"] - 1;
  chroma = 0;
  if (isDark) {
    chroma = randomInInterval(color_dark_chroma_min, color_dark_chroma_max) + imp * randomInInterval(importance_variation_dark_chroma_min, importance_variation_dark_chroma_max);
  } else {
    chroma = randomInInterval(color_light_chroma_min, color_light_chroma_max) + imp * randomInInterval(importance_variation_light_chroma_min, importance_variation_light_chroma_max);
  }
  if (isDark) {
    lightness = randomInInterval(color_dark_lightness_min, color_dark_lightness_max) + imp * randomInInterval(importance_variation_dark_lightness_min, importance_variation_dark_lightness_max);
  } else {
    lightness = randomInInterval(color_light_lightness_min, color_light_lightness_max) + imp * randomInInterval(importance_variation_light_lightness_min, importance_variation_light_lightness_max);
  }
  return [hue, chroma, lightness];
};
contrast_function = function(k, x, mu) {
  /*
  Identities for f(k, x)
      f(-1, x) = mu
      f(0, x) = x
      f(1, x) = {1, 0}
  */
  k -= 1;
  if (k === 0) {
    return x;
  }
  /*
  if k < 0
      return scale(0, x, 1 + k)
  else
      return scale(x, 1, k)
  */
  if (k < 0) {
    if (x < mu) {
      return scale(x, mu, -k);
    } else {
      return scale(mu, x, 1 + k);
    }
  } else {
    if (x < mu) {
      return scale(0, x, 1 - k);
    } else {
      return scale(x, 1, k);
    }
  }
};
saturation_function = function(k, x) {
  /*
      f(0, x) = x
      f(-1, x) = 0
      f(1, x) = 1
  */
  k -= 1;
  if (k === 0) {
    return x;
  }
  if (k < 0) {
    return scale(0, x, 1 + k);
  } else {
    return scale(x, 1.6, k);
  }
};
applyPostProcessing = function(theme) {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, average_lightness, colorfulness, contrast, count, zone;
  average_lightness = 0;
  count = 0;
  _b = theme["new_zones"];
  for (_a = 0, _c = _b.length; _a < _c; _a++) {
    zone = _b[_a];
    average_lightness += zone["color"][2];
    count += 1;
  }
  average_lightness /= count;
  contrast = theme["options"]["contrast"];
  _e = theme["new_zones"];
  for (_d = 0, _f = _e.length; _d < _f; _d++) {
    zone = _e[_d];
    zone["color"][2] = contrast_function(contrast, zone["color"][2], average_lightness);
  }
  colorfulness = theme["options"]["colorfulness"];
  _g = []; _i = theme["new_zones"];
  for (_h = 0, _j = _i.length; _h < _j; _h++) {
    zone = _i[_h];
    _g.push(zone["color"][1] = saturation_function(colorfulness, zone["color"][1]));
  }
  return _g;
};
generateRGBColors = function(theme) {
  var _a, _b, _c, _d, background_vc, c, rgb_background, zone;
  rgb_background = theme["rgb_background"];
  background_vc = new CIECAMColor.normalVC();
  _a = []; _c = theme["new_zones"];
  for (_b = 0, _d = _c.length; _b < _d; _b++) {
    zone = _c[_b];
    _a.push((function() {
      if (zone["name"] === "normal") {
        return theme["is_dark"] ? (zone["rgb"] = [255, 255, 255]) : (zone["rgb"] = [0, 0, 0]);
      } else {
        if (theme["is_dark"]) {
          c = new CIECAMColor(zone["color"][0], zone["color"][1], zone["color"][2]);
          return (zone["rgb"] = c.asRGB(background_vc));
        } else {
          c = new LABColor(zone["color"][0] * 2 * pi / 360, zone["color"][1], zone["color"][2]);
          return (zone["rgb"] = c.asLRGB());
        }
      }
    })());
  }
  return _a;
};