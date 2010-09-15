var _a, generateBackgroundColor, generateHueClusters, generateTheme, hueInterpolationPoints, randomHueInCluster, refX, refY, refZ;
/* MAIN CODE */
/* Possible options
      background_lightness
        "Light" | "Dark" | "Either"
      background_type
        | "Black & White"  # Only black and white are allowed as the blackground
        | "Grayscale"      # Only unsaturated grays are allowed as the background
        | "Neutral"        # A very light or dark neutral color will be picked that fits in with the rest of the theme
      contrast
        | 0 ≤ value < 0.5  # Global lightness is scaled towards the average
        | value = 0.5      # Global lightness is not changed
        | 0.5 < value ≤ 1  # Global lightness is scaled away from the average
      colorfulness
        | value = 0        # Everything is turned to grayscale
        | value = 0.5      # Global colorfulness is not changed
        | value = 1        # It's a double rainbow, all the way
      hue_cluster_count
        | 1 ≤ value ≤ 6    # This is the number of hue "clusters" that colors will be randomly selected around
      hue_cluster_spacing
        | 10 ≤ value ≤ 360  # The maximum spacing between two hue clusters (in degrees)
      hue_cluster_width
        | 10 ≤ value ≤ 360  # How "wide" each cluster is (a multiplier of standard deviation)
*/
generateTheme = function(options) {
  var colors, max_importance, theme;
  theme = {
    "options": options
  };
  theme["hue_clusters"] = generateHueClusters(theme);
  theme["background"] = generateBackgroundColor(theme);
  max_importance = maximum(theme["importance_ratings"].length);
  return (colors = []);
};
generateHueClusters = function(theme) {
  var _a, center, clusterIsInvalid, hue_clusters, hue_count, hue_radius, hue_spacing, hue_width, i, limit;
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
  options['hue_cluster_count'] = hue_count;
  options['hue_cluster_width'] = hue_width;
  options['hue_cluster_spacing'] = hue_spacing;
  limit = 200;
  for (i = 0; (0 <= limit ? i <= limit : i >= limit); (0 <= limit ? i += 1 : i -= 1)) {
    if (hue_clusters.length >= hue_count) {
      break;
    }
    center = randomInInterval(0, 1);
    if (i !== limit) {
      clusterIsInvalid = false;
      _a = (hue_clusters.length);
      for (i = 0; (0 <= _a ? i < _a : i > _a); (0 <= _a ? i += 1 : i -= 1)) {
        if (!(center < hue_clusters[i] - hue_radius && center > hue_clusters[i] + hue_radius)) {
          clusterIsInvalid = true;
          break;
        }
        if ((center > hue_clusters[i] && center - (hue_clusters[i] + hue_radius) > hue_spacing) || (center < hue_clusters[i] && (hue_clusters[i] - hue_radius) - center > hue_spacing)) {
          clusterIsInvalid = true;
          break;
        }
      }
      if (clusterIsInvalid === true) {
        continue;
      }
    }
    hue_clusters.push(center);
  }
  return hue_clusters;
};
generateBackgroundColor = function(theme) {
  var chroma, discrete_chroma, discrete_lightness, hue, isDark, lightness, maximumLightnessDifferenceFromEndpoint, primary_cluster;
  discrete_lightness = theme["bg_lightness"];
  isDark = false;
  if (discrete_lightness === "dark") {
    isDark = true;
  } else if (discrete_lightness === "either") {
    isDark = randomInInteval(0.0, 1.0) > 0.5;
  }
  theme["is_dark"] = isDark;
  lightness = 1.0;
  maximumLightnessDifferenceFromEndpoint = 0.1;
  discrete_chroma = theme["bg_type"];
  if (discrete_chroma === "black/white") {
    lightness = isDark ? 0.0 : 1.0;
  } else {
    lightness = randomInInterval(0.0, maximumLightnessDifferenceFromEndpoint);
    if (!isDark) {
      lightness = 1.0 - lightness;
    }
  }
  hue = 0.0;
  chroma = 0.0;
  if (discrete_chroma === "neutral") {
    primary_cluster = theme["hue_clusters"][0];
    hue = randomHueInCluster(primary_cluster);
    if (isDark) {
      chroma = 0.5;
    } else {
      chroma = 0.75;
    }
  }
  return new Color(hue, chroma, lightness);
};
randomHueInCluster = function(primary_cluster) {
  return modnormalRandomInInterval(-pi, pi, primary_cluster);
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