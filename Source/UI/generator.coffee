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
    theme = generateHueClusters(theme)
    
    # Generate a background color
    theme = generateBackgroundColor(theme)
    
    # Cluster zones
    zones = options["zones"]
    theme["zone_clusters"] = generateZoneClusters(theme['options']['hue_cluster_count'], zones)
    
    comparator = (a, b) ->
        # Sort a and b DESCENDING by centroids
        c1 = centroid(a)["values"]["importance"]
        c2 = centroid(b)["values"]["importance"]
        
        if c1 > c2
            return -1
        else if c1 < c2
            return 1
        else
            return 0
    
    theme["zone_clusters"] = theme["zone_clusters"].sort(comparator)
    
    
    # Generate colors for each zone cluster
    theme["new_zones"] = generateCIECAMColors(theme)
    
    # Scale lightness and colorfulness
    applyPostProcessing(theme)
    
    # Convert colors to RGB
    generateRGBColors(theme)
    
    return theme
        
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
    
    theme["hue_clusters"] = hue_clusters
    
    return theme


generateBackgroundColor = (theme) ->    
    discrete_lightness = theme["options"]["background_lightness"] # "Dark", "Light", "Either"
    
    # Lightness Mode
    isDark = false
    if discrete_lightness == "Dark"
        isDark = true
    else if discrete_lightness == "Light"
        isDark = false
    else if discrete_lightness == "Either"
        isDark = random() > 0.5
    
    theme["is_dark"] = isDark
    
    
    
    # Compute the lightness
    lightness = 1.0
    discrete_chroma = theme["options"]["background_type"] # "Black & White", "Grayscale", "Neutral"
    
    if discrete_chroma == "Black & White"
        if isDark
            lightness = bw_black
        else
            lightness = bw_white
    else if discrete_chroma == "Grayscale"
        if isDark
            lightness = randomInInterval(gray_dark_min, gray_dark_max)
        else
            lightness = randomInInterval(gray_light_min, gray_light_max)
    else if discrete_chroma == "Neutral"
        if isDark
            lightness = randomInInterval(neutral_dark_min, neutral_dark_max)
        else
            lightness = randomInInterval(neutral_light_min, neutral_light_max)
    
        
    # If this is not neutral mode - then we're done!
    if discrete_chroma != "Neutral"
        c = new RGBColor(0.0, 0.0, lightness)
        
        rgb = c.asRGB()
        rgb = [rgb[0] * 255, rgb[1] * 255, rgb[2] * 255]
        
        theme["background"] = [0.0, 0.0, lightness]
        theme["rgb_background"] = rgb
        
        return theme 
    
    # Otherwise, we need to find a hue and chroma
    else    
        hue = 0.0
        chroma = 0.0
        
        # Compute the hue
        primary_cluster = theme["hue_clusters"][0]
        hue = randomHueInCluster(primary_cluster, theme["options"]["hue_cluster_width"])
                
        # Compute the chroma
        if isDark
            chroma = randomInInterval(neutral_dark_chroma_min, neutral_dark_chroma_max)
        else
            chroma = randomInInterval(neutral_light_chroma_min, neutral_light_chroma_max)
        
        
        # Generate an rgb triple from the JCh using CIECAM
        plain_vc = new CIECAMColor.normalVC() #vcWithBackground(95.05, 100, 108.88)
        c = new CIECAMColor(hue, chroma, lightness)
        rgb = c.asRGB(plain_vc)
        
        #alert(rgb)
        
        # Take the rgb triple and convert it into HSL
        #c2 = RGBColor.fromRGB(rgb[0] / 255, rgb[1] / 255, rgb[2] / 255)
        
        #alert([c2.hue, c2.chroma, c2.lightness])
        
        # Set the chroma and lightness to our new values
        #c2.chroma = chroma
        #c2.lightness = lightness
    
        # Convert the HSL back into an rgb triple
        #rgb = c2.asRGB()
        #rgb = [rgb[0] * 255, rgb[1] * 255, rgb[2] * 255]
        
        #alert(rgb)
        
        
        theme["background"] = [hue, chroma, lightness]
        theme["rgb_background"] = rgb
        
        return theme

randomHueInCluster = (primary_cluster, width) ->
    a = primary_cluster - width / 2
    b = primary_cluster + width / 2
    
    r = normalRandom()
    r *= b - a
    r += a
    
    if r < 0
        while r < 0
            r += 360
    else if r > 360
        while r > 360
            r -= 360
    
    return r
    #return modnormalRandomInInterval(, , primary_cluster)


generateZoneClusters = (k, zones) ->
    for zone in zones
        zone["values"] = 
            "importance": zone["importance"]
            "likeness": zone["likeness"]
    
    return kmeans(k, zones, euclideanMetric)


generateCIECAMColors = (theme) ->
    new_zones = []
    for i in [0...theme["zone_clusters"].length]
        hue_cluster = theme["hue_clusters"][i]
        for zone in theme["zone_clusters"][i]
            zone["color"] = generateColorForZone(theme, zone, hue_cluster)
            new_zones.push(zone)
    return new_zones
    
generateColorForZone = (theme, zone, hue_cluster) ->
    isDark = theme["is_dark"]
    hue = randomHueInCluster(hue_cluster, theme["options"]["hue_cluster_width"])
    
    imp = 2 * zone["importance"] - 1
    
    chroma = 0
    if (isDark)
        chroma = randomInInterval(color_dark_chroma_min, color_dark_chroma_max) + imp * randomInInterval(importance_variation_dark_chroma_min, importance_variation_dark_chroma_max)
    else
        chroma = randomInInterval(color_light_chroma_min, color_light_chroma_max) + imp * randomInInterval(importance_variation_light_chroma_min, importance_variation_light_chroma_max)
        
    if (isDark)
        lightness = randomInInterval(color_dark_lightness_min, color_dark_lightness_max) + imp * randomInInterval(importance_variation_dark_lightness_min, importance_variation_dark_lightness_max)
    else
        lightness = randomInInterval(color_light_lightness_min, color_light_lightness_max) + imp * randomInInterval(importance_variation_light_lightness_min, importance_variation_light_lightness_max)
    
    return [hue, chroma, lightness]


# Apply a contrast `k` in [-1, 1] to the luminance `x` with mean luminance `mu`
contrast_function = (k, x, mu) ->    
    ###
    Identities for f(k, x)
        f(-1, x) = mu
        f(0, x) = x
        f(1, x) = {1, 0}
    ###
    
    if k == 0
        return x
    
    if k < 0
        if x < mu
            return scale(x, mu, -k)
        else
            return scale(mu, x, k - 1)
    else
        if x < mu
            return scale(0, x, 1 - k)
        else
            return scale(x, 1, k)
    
saturation_function = (k, x) ->
    ###
        f(0, x) = x
        f(-1, x) = 0
        f(1, x) = 1
    ###
    
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
    for zone in theme["new_zones"]
        average_lightness += zone["color"][2]
        count += 1
    
    average_lightness /= count
    
    
    # Scale lightness (contrast)
    
    contrast = theme["options"]["contrast"]
    for zone in theme["new_zones"]
        zone["color"][2] = contrast_function(contrast, zone["color"][2], average_lightness)
    
    
    # Find the average chroma
    
    # Scale chroma (colorfulness)
    colorfulness = theme["options"]["colorfulness"]
    for zone in theme["new_zones"]
        zone["color"][1] = saturation_function(colorfulness, zone["color"][1])
    
    
generateRGBColors = (theme) ->
    rgb_background = theme["rgb_background"]
    background_vc = new CIECAMColor.normalVC()#vcWithBackground(rgb_background[0] * 255, rgb_background[1] * 255, rgb_background[2] * 255)
    
    for zone in theme["new_zones"]
        if zone["name"] == "normal"
            if theme["is_dark"]
                zone["rgb"] = [255, 255, 255]
            else
                zone["rgb"] = [0, 0, 0]
        else
            if theme["is_dark"]
                c = new CIECAMColor(zone["color"][0], zone["color"][1], zone["color"][2])
                zone["rgb"] = c.asRGB(background_vc)
            else
                c = new LABColor(zone["color"][0] * 2 * pi / 360, zone["color"][1], zone["color"][2])
                zone["rgb"] = c.asLRGB()
        #alert(zone["rgb"])
        