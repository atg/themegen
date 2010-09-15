### MAIN CODE ###

### Possible options
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
###


generateTheme = (options) ->
    theme = { "options": options }
    
    # Generate hue clusters
    theme["hue_clusters"] = generateHueClusters(theme)
    
    # Generate a background color
    theme["background"] = generateBackgroundColor(theme)
    
    # Cluster zones
    theme["zone_clusters"] = generateZoneClusters(theme['options']['hue_cluster_count'], theme["options"]["zones"])
    
    comparator = (a, b) ->
        # Sort a and b DESCENDING by centroids
        c1 = centroid(a["values"])
        c2 = centroid(b["values"])
        
        if c1 > c2
            return -1
        else if c1 < c2
            return 1
        else
            return 0
    
    theme["zone_clusters"] = theme["zone_clusters"].sort(comparator)
    
    # Scale lightness and colorfulness
    applyPostProcessing(theme)
    
    # Generate colors for each zone cluster
    generateColors(theme)
    
    return theme["new_zones"]
        
generateHueClusters = (theme) ->
    options = theme['options']
    
    # Generate hue_count number of spots
    hue_clusters = []
    
    # There may a maximum of 6 clusters
    hue_count = options['hue_cluster_count']
    if hue_count > 6
        hue_count = 6
    
    # hue_width must be between 10 and 360 / (hue_count + 1)
    hue_width = options['hue_cluster_width']
    if hue_width < 10
        hue_width = 10
    else if hue_width > 360 / (hue_count + 1)
        hue_width = 360 / (hue_count + 1)
    
    # hue_spacing must be between 10 and (360 - hue_count * hue_width) / hue_count
    hue_spacing = options['hue_cluster_spacing']
    if hue_spacing < 10
        hue_spacing = 10
    else if hue_spacing > (360 - hue_count * hue_width) / hue_count
        hue_spacing = (360 - hue_count * hue_width) / hue_count
    
    hue_radius = hue_width / 2
    
    
    # Set the options to their new values
    theme['options']['hue_cluster_count'] = hue_count
    theme['options']['hue_cluster_width'] = hue_width
    theme['options']['hue_cluster_spacing'] = hue_spacing
    
    
    # Generate clusters
    limit = 150
    for i in [0..limit]        
        # If there's already enough clusters, stop
        if hue_clusters.length >= hue_count
            break
        
        # Generate a new cluster center
        center = randomInInterval(0, 360)
        
        # If i == limit, then we just add the cluster regardless
        clusterIsInvalid = false
        if i != limit
            for j in [0...(hue_clusters.length)]
                if (center > hue_clusters[i] && hue_clusters[i] + hue_width / 2 > center) || (center < hue_clusters[i] && hue_clusters[i] - hue_width / 2 < center)
                    clusterIsInvalid = true
                    break
                if (center > hue_clusters[i] && center - (hue_clusters[i] + hue_radius) > hue_spacing) || (center < hue_clusters[i] && (hue_clusters[i] - hue_radius) - center > hue_spacing)
                   clusterIsInvalid = true
                   break
        
        if clusterIsInvalid == false
            hue_clusters.push(center)
    
    return hue_clusters


generateBackgroundColor = (theme) ->    
    discrete_lightness = theme["background_lightness"] # "Dark", "Light", "Either"
    
    isDark = false
    if discrete_lightness == "Dark"
        isDark = true
    else if discrete_lightness == "Either"
        isDark = randomInInteval(0.0, 1.0) > 0.5
    
    theme["is_dark"] = isDark
    
    # Compute the lightness
    lightness = 1.0
    maximumLightnessDifferenceFromEndpoint = 0.1
    discrete_chroma = theme["background_type"] # "Black & White", "Grayscale", "Neutral"
    
    if discrete_chroma == "Black/white"
        lightness = if isDark then 0.0 else 1.0
    else
        lightness = randomInInterval(0.0, maximumLightnessDifferenceFromEndpoint)
        
        if !isDark
            lightness = 1.0 - lightness
    
    hue = 0.0
    chroma = 0.0
    
    if discrete_chroma == "Neutral"
        # Compute the hue
        primary_cluster = theme["hue_clusters"][0]
        hue = randomHueInCluster(primary_cluster, theme["options"]["hue_cluster_width"])
        
        # Compute the chroma
        if (isDark)
            chroma = 0.5
        else
            chroma = 0.75
    
    plain_vc = CIECAMColor.vcWithBackground(95.05, 100, 108.88)
    c = CIECAMColor(theme["background"][0], theme["background"][1], theme["background"][2])
    theme["rgb_background"] = c.asRGB(plain_vc)
    
    return [hue, chroma, lightness]

randomHueInCluster = (primary_cluster, width) ->
    return modnormalRandomInInterval(primary_cluster - width / 2, primary_cluster + width / 2, primary_cluster)


generateZoneClusters = (k, zones) ->
    for zone in zones
        zone["values"] = 
            "importance": exp(0.5 * zone["importance"])
            "likeness": zone["likeness"]
    
    return kmeans(k, zone, euclideanMetric)


generateCIECAMColors = (theme) ->
    new_zones = []
    for i in [i...theme["zone_clusters"].length]
        hue_cluster = theme["hue_clusters"][i]
        for zone in theme["zone_clusters"][i]
            zone["color"] = generateColorForZone(theme, zone, hue_cluster)
    
generateColorForZone = (theme, zone, hue_cluster) ->
    isDark = theme["is_dark"]
    hue = randomHueInCluster(primary_cluster, theme["options"]["hue_cluster_width"])
        
    chroma = 0
    if (isDark)
        chroma = randomInInterval(0.3, 0.5)
    else
        chroma = randomInInterval(0.2, 0.3)
        
    if (isDark)
        lightness = randomInInterval(1.35, 1.60)
    else
        lightness = randomInInterval(0.6, 0.7)
    
    return [hue, chroma, lightness]


# Apply a contrast `k` in [-1, 1] to the luminance `x` with mean luminance `mu`
contrast_function = (k, x, mu) ->    
    ###
    Identities
        f(1, x) = mu
        f(0, x) = c
        f(-1, x) = {1, 0}
    ###
    
    if x == mu || k == 0
        return x
    
    if x < mu
        if k > 0
            return scale(x, mu - x, k)
        else
            return scale(0, x, 1 - k)
    if x > mu
        if k > 0
            return scale(mu, x - mu, k)
        else
            return scale(x, 1, 1 - k)


saturation_function = (k, x) ->
    if k == 0
        return x
    
    if k < 0
        return scale(0, x, 1 - k)
    else
        return scale(x, 1, k)


applyPostProcessing = (theme) ->
    # Find the average lightness
    average_lightness = 0
    count = 0
    for cluster in theme["zone_clusters"]
        for zone in cluster
            average_lightness += zone["color"][2]
            count += 1
    
    average_lightness /= count
    
    
    # Scale lightness (contrast)
    
    contrast = theme["contrast"]
    for cluster in theme["zone_clusters"]
        for zone in cluster
            zone["color"][1] = contrast_function(contrast, zone["color"][1], average_lightness)
    
    
    # Find the average chroma
    ###
    average_colorfulness
    for cluster in theme["zone_clusters"]
        for zone in cluster
            average_colorfulness += zone["color"][1]
    
    average_colorfulness /= count
    ###
    
    # Scale chroma (colorfulness)
    colorfulness = theme["colorfulness"]
    for cluster in theme["zone_clusters"]
        for zone in cluster
            zone["color"][1] = saturation_function(colorfulness, zone["color"][1])
    

generateRGBColors = (theme) ->
    rgb_background = theme["rgb_background"]
    background_vc = CIECAMColor.vcWithBackground(rgb_background[0], rgb_background[1], rgb_background[2])
    
    new_zones = []
    for cluster in theme["zone_clusters"]
        for zone in theme["zone_clusters"][i]            
            c = CIECAMColor(zone["color"][0], zone["color"][1], zone["color"][2])
            zone["rgb"] = c.asRGB(background_vc)
            
            new_zones.push(zone)
    
    theme["new_zones"] = new_zones

### COLOR STUFF ###

# TODO: Check this line, I'm not sure it's correct
[refX, refY, refZ] = [1, 1, 1]

#hueInterpolationPoints = [0, 40/360, 60/360, 110/360, 179/360, 197/360, 276/360, 300/360, 1]
#hueInterpolationPoints = [0, 10/360, 20/360, 10/360, 40/360, 50/360, 60/360, 300/360, 1]

###
    Red: 336 to 11
    Orange: 11 to 47
    Yellow: 47 to 67
    Green: 67 to 143
    Green-Blue: 143 to 179
    Blue: 179 to 260
    Purple: 260 to 289
    Pink: 289 to 336
###
#336/360,
hueInterpolationPoints = [336/360, 11/360, 47/360, 67/360, 143/360, 179/360, 260/360, 289/360, 336/360]
#hueInterpolationPoints = [0, 0.1, 0.2, 0.3, 1.0]


###
a = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
b = [[1, 3], [5, 7], [9, 11]]
console.log(matrixMultiply(a, b))
###

###
c = new LABColor.fromLRGB(0.7, 0.0, 0.0)
console.log(" hCL #{c.hue}, #{c.chroma}, #{c.lightness}")
[l, a, b] = c.asLAB()
console.log(" lab #{l}, #{a}, #{b}")
[r, g, b] = c.asLRGB()
console.log("srgb #{r}, #{g}, #{b}")
###