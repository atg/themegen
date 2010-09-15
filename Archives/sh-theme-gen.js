var luminanceCoefficients = [0.2126, 0.7152, 0.0722];
var hueInterpolationPoints = [0, 40./360., 60./360., 110./360., 179./360., 197./360., 276./360., 300./360.];

/* Possible options
    bg_lightness
    bg_saturation
    
    brightness
    vividity
    hue_count
    hue_range
*/
function generateTheme(options) {
    var theme = {"options": options}
    
    //Generate hue clusters
    theme["hue_clusters"] = generateHueClusters(theme);
    
    //Generate a background color
    theme["background"] = generateBackgroundColor(theme);
    
    //Generate colors with a given specified importance
    var max_importance = maximum(theme["importance_ratings"].length);
    var colors = [];
    for (var i = 0; i < theme["importance_ratings"].length; i++) {
        var color = generateColorForImportance(theme["importance_ratings"][i], max_importance, colors);
        colors.push(color);
    }
    
    theme["colors"] = colors;
}

var hue_cluster_radius = 22.0/360.0; //The minimum distance two cluster centers must be away from each other

function generateHueClusters(theme) {
    //Generate hue_count number of spots
    var hue_clusters = [];
    
    //There may a maximum of 5 clusters
    var hue_count = options['hue_count'];
    if (hue_count > 5)
        hue_count = 5;
    
    while (true) {
        //If there's already enough clusters, stop
        if (hue_clusters.length >= hue_count)
            break;
        
        //Generate a new cluster center
        var center = randomBetween(0, 1);
        
        //Make sure the cluster is far enough from everything else
        var foundOtherCloseCenter = false;
        for (var i = 0; i < hue_clusters.length; i++) {
            if (!(center < hue_clusters[i] - hue_cluster_radius
                   && center > hue_clusters[i] + hue_cluster_radius))
                foundOtherCloseCenter = true;
        }
        
        //If the cluster is sufficiently far away, continue
        if (foundOtherCloseCenter === false)
            hue_clusters.push(center);
    }
    
    return hue_clusters;
}
function generateBackgroundColor(theme) {
    var backgroundColor;
    
    var discrete_lightness = theme["background_lightness"]; // "dark", "light", "either"
    
    var isDark = false;
    if (discrete_lightness === "dark")
        isDark = true;
    else if (discrete_lightness === "either")
        isDark = randomBetween(0.0, 1.0) > 0.5;
    
    theme["is_dark"] = isDark;
    
    //Compute the lightness
    var lightness = 1.0;
    var maximumLightnessDifferenceFromEndpoint = 0.1;
    var discrete_saturation = theme["background_saturation"]; // "black/white", "grayscale", "neutral"
    if (discrete_saturation === "black/white")
        lightness = isDark ? 0.0 : 1.0;
    else {
        lightness = randomBetween(0.0, maximumLightnessDifferenceFromEndpoint)
        
        if (!isDark)
            lightness = 1.0 - lightness;
    }
    
    var hue = 0.0;
    var saturation = 0.0;
    
    if (discrete_saturation == "neutral") {
        //Compute the hue
        var primary_cluster = theme["hue_clusters"][0];
        hue = randomHueInCluster(primary_cluster);
    
        //Compute the saturation
        if (isDark)
            saturation = 0.5;
        else
            saturation = 0.75;
    }
    
    return Color(hue, saturation, lightness);
}
function generateColorForImportance(importance, max_importance, existing_colors) {
    
}


function randomHueInCluster(primary_cluster) {
    //Generate a random value in the interval [0, 1] from the normal distribution with center 0.5 and radius hue_cluster_radius
    var value = ...;
    
    //Add `primary_cluster` and modulo divide by 1.0
    return (value + primary_cluster) % 1.0;
}


function randomBetween(a, b) {
    
}
function randomBetweenInDistribution(a, b, inverseCumulativeDistribution) {
    
}
function randomBetweenModulo(a, b, center) {
    return a + fmod(randomBetween(0, b - a) + center, b - a);
}

function Color(h, s, l) {
    this.h = h;
    this.s = s;
    this.l = l;
}
Color.prototype.toRGB() {
    
}
Color.prototype.distance(color) {
    
}
Color.fromRGB = function(r, g, b) {
    
}

function maximum(list) {
    var maximum_value = 0.0;
    
    for (var i = 0; i < list.length; i++) {
        if (list[i] > maximum_value)
            maximum_value = list[i];
    }
    
    return maximum_value;
}