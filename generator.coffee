### MATH STUFF ###
pow = Math.pow
sqrt = Math.sqrt

sin = Math.sin
cos = Math.cos
tan = Math.tan
atan2 = Math.atan2

floor = Math.floor
round = Math.round

pi = Math.PI


### MAIN CODE ###

### Possible options
      bg_lightness
      bg_type
      contrast
      colorfulness
      hue_count
      hue_range
###
generateTheme = (options) ->
    theme = { "options": options }
    
    # Generate hue clusters
    theme["hue_clusters"] = generateHueClusters(theme)
    
    # Generate a background color
    theme["background"] = generateBackgroundColor(theme)
    
    # Generate colors in hue_count clusters
    
    # Generate colors with a given specified importance
    max_importance = maximum(theme["importance_ratings"].length)
    colors = []
    #for i in [1...theme["importance_ratings"]]
    
    
generateHueClusters = (theme) ->
    # Generate hue_count number of spots
    hue_clusters = []
    
    # There may a maximum of 5 clusters
    hue_count = options['hue_count']
    if hue_count > 5
        hue_count = 5

    while true
        # If there's already enough clusters, stop
        if (hue_clusters.length >= hue_count)
            break
    
        # Generate a new cluster center
        center = randomInInterval(0, 1)
    
        # Make sure the cluster is far enough from everything else
        foundOtherCloseCenter = false
        for i in [0...(hue_clusters.length)]
            if (!(center < hue_clusters[i] - hue_cluster_radius && center > hue_clusters[i] + hue_cluster_radius))
                foundOtherCloseCenter = true
        
        # If the cluster is sufficiently far away, continue
        if foundOtherCloseCenter == false
            hue_clusters.push(center)
    
    return hue_clusters

generateBackgroundColor = (theme) ->    
    discrete_lightness = theme["bg_lightness"] # "dark", "light", "either"
    
    isDark = false
    if discrete_lightness == "dark"
        isDark = true
    else if discrete_lightness == "either"
        isDark = randomInInteval(0.0, 1.0) > 0.5
    
    theme["is_dark"] = isDark
    
    # Compute the lightness
    lightness = 1.0
    maximumLightnessDifferenceFromEndpoint = 0.1
    discrete_chroma = theme["bg_type"] # "black/white", "grayscale", "neutral"
    
    if discrete_chroma == "black/white"
        lightness = if isDark then 0.0 else 1.0
    else
        lightness = randomInInterval(0.0, maximumLightnessDifferenceFromEndpoint)
        
        if !isDark
            lightness = 1.0 - lightness
    
    hue = 0.0
    chroma = 0.0
    
    if discrete_chroma == "neutral"
        # Compute the hue
        primary_cluster = theme["hue_clusters"][0]
        hue = randomHueInCluster(primary_cluster)
    
        # Compute the chroma
        if (isDark)
            chroma = 0.5
        else
            chroma = 0.75
    
    return new Color(hue, chroma, lightness)

randomHueInCluster = (primary_cluster) ->
    return modnormalRandomInInterval(-pi, pi, primary_cluster)

fmod = (x, n) -> x % n

sum = (a) ->
    s = 0
    for x in a
        s += x
    return s

matrixMultiply = (a, b) ->
    # http://softwareengineering.vazexqi.com/2009/11/23/lessons-from-parallelizing-matrix-multiplication
    m = a.length
    n = a[0].length
    p = b[0].length
        
    c = ((0 for k in [0...p]) for i in [0...m])
    
    for i in [0...m]
        for k in [0...p]
            for j in [0...n]
                c[i][k] += a[i][j] * b[j][k]
        
    return c


### STATISTICS STUFF ###

# Generate a random number between 0 and 1
random = ->
    
# Generate a random number between a and b
randomInInterval = (a, b) ->
    
# Generate a random number with a 95% probability of being between 0 and 1, and a good probability of being in the neighbourhood of 1/2
normalRandom = ->

# Generate a random number between a and b with a good probability of being in the neighbourhood of center
modnormalRandomInInterval = (a, b, center) -> 
    # Generate a random number between 0 and 1 with center 0.5
    r = normalRandom()
        
    # Scale
    r *= b - a
    
    # The center is at (b - a)/2, we want to move it to center
    r += center - (b - a)/2
        
    # Modularize
    r = fmod(r, b - a)
    
    # Translate
    r += a
    
    return r

# Takes an array of objects, clusters them by their "value" property and returns an array with n elements of arrays of objects
# type Metric = Object -> Object -> Num
# findClusters :: [Object] -> Int -> Metric -> [[Object]]
findClusters = (data, n, metric) ->
    # We use the k-means clustering algorithm
    # This implementation is ported from the Haskell kmeans package http://hackage.haskell.org/package/kmeans
    
    l = floor((data.length + n - 1) / n)
    
euclidianMetric = (x, y) -> sqrt(x.value * x.value + y.value * y.value)
ciede200Metric = (x, y) -> 

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

class RGBColor
    constructor: (@hue, @chroma, @lightness) ->
    
    asHSL: ->
        x = @hue / (2 * pi)
        xs = hueInterpolationPoints
        count = xs.length - 1
        
        newHue = 0
                
        ###
        for i in [0...count]
            a = xs[i]
            b = xs[i + 1]
            
            if a < x < b
                p = (x - a) / (b - a)
                newHue = (1 - p) * (i / count) + p * ((i + 1) / count)
                break
        ###
        
        
        for i in [0...count]
            a = i / count
            b = (i + 1) / count
            
            if a < x <= b
                p = (x - a) / (b - a)
                
                if i == 0
                    offset = (1 - xs[0])
                    u = 0
                    v = offset + xs[i + 1]
                    
                    newHue = (1 - p) * u + p * v - offset
                    
                    if newHue < 0
                        newHue += 1.0
                    
                else
                    u = xs[i]
                    v = xs[i + 1]
                    newHue = (1 - p) * u + p * v
                break
        
        
        ###
        newHue = 0
        groupSize = 1 / (hueInterpolationPoints.length - 1)
        for h in hueInterpolationPoints
            if h > newHue
        ###
        
        return [newHue * 2 * pi, @chroma, @lightness]#[newHue * 2 * pi, @chroma, @lightness]
        
    asRGB: ->
        [h, s, l] = this.asHSL()
        c = s
        #c = if l <= 1/2 then 2 * l * s else (2 - 2 * l) * s
        h_dash = h / (pi / 3)
        x = c * (1 - Math.abs(h_dash % 2 - 1))
        
        if 0 <= h_dash < 1
            [r, g, b] = [c, x, 0]
        else if 1 <= h_dash < 2
            [r, g, b] = [x, c, 0]
        else if 2 <= h_dash < 3
            [r, g, b] = [0, c, x]
        else if 3 <= h_dash < 4
            [r, g, b] = [0, x, c]
        else if 4 <= h_dash < 5
            [r, g, b] = [x, 0, c]
        else if 5 <= h_dash < 6
            [r, g, b] = [c, 0, x]
        else
            [r, g, b] = [0, 0, 0]
        
        #m = l - (c / 2)       
        m = l - (0.30 * r + 0.59 * g + 0.11 * b)       
        #m = l - (0.2126 * r +  0.7152 * g + 0.0722 * b)       
        #m = l - ((0.30 * r + 0.59 * g + 0.11 * b) + (0.2126 * r +  0.7152 * g + 0.0722 * b)) / 2       
        return [r + m, g + m, b + m]
    
    # Output as a CSS rgb(...) literal xxxz
    asCSS_RGB: ->
        [r, g, b] = this.asRGB()
        
        normalize = (x) ->
            if x > 1
                return 1
            else if x < 0
                return 0
            else
                return x

        r = normalize(r)
        g = normalize(g)
        b = normalize(b)

        return "rgb(#{round(r * 255)}, #{round(g * 255)}, #{round(b * 255)})"

    
class LABColor
    constructor: (@hue, @chroma, @lightness) ->
    
    # Convert to CIE LAB and return the components as an array
    asLAB: ->
        l = @lightness  * 100
        a = (@chroma * 135) * cos(@hue)
        b = (@chroma * 135) * sin(@hue)
        return [l, a, b]
    
    # Convert to CIE XYZ and return the components as an array
    asXYZ: ->
        [l, a, b] = this.asLAB()
        
        delta = 6 / 29
        
        fy = (l + 16) / 116
        fx = fy + a / 500
        fz = fy - b / 200
        
        y = if fy > delta then refY * pow(fy, 3) else (fy - 16/166) * 3 * pow(delta, 2) * refY
        x = if fx > delta then refX * pow(fx, 3) else (fx - 16/166) * 3 * pow(delta, 2) * refX
        z = if fz > delta then refZ * pow(fz, 3) else (fz - 16/166) * 3 * pow(delta, 2) * refZ
        
        return [x, y, z]
        
    # Convert to linear RGB and return the components as an array
    asLRGB: ->
        # Convert from XYZ to LRGB
        # http://en.wikipedia.org/wiki/SRGB#The_forward_transformation_.28CIE_xyY_or_CIE_XYZ_to_sRGB.29
        
        [x, y, z] = this.asXYZ()
        
        m = [[3.2406, -1.5372, -0.4986],
             [-0.9689, 1.8758, 0.0415],
             [0.0557, -0.2040, 1.0570]]
        
        [[red], [green], [blue]] = matrixMultiply(m, [[x], [y], [z]])
        
        return [red, green, blue]
    
    # Convert to sRGB and return the components as an array
    asSRGB: ->
        [red, green, blue] = this.asLRGB()
        
        # Define a function to do gamma correction
        # http://en.wikipedia.org/wiki/SRGB#The_forward_transformation_.28CIE_xyY_or_CIE_XYZ_to_sRGB.29
        gammaCorrect = (c) -> if c <= 0.0031308 then 12.92 * c else (1 + 0.055) * pow(c, 1/2.4) - 0.055
        
        return [gammaCorrect(red), gammaCorrect(green), gammaCorrect(blue)]
    
    # Output as a CSS rgb(...) literal xxxz
    asCSS_RGB: ->
        [r, g, b] = this.asSRGB()
        
        if r < 0 || r > 1
            return "rgb(0, 0, 0)"
        if g < 0 || g > 1
            return "rgb(0, 0, 0)"
        if b < 0 || b > 1
            return "rgb(0, 0, 0)"

        normalize = (x) ->
            if x > 1
                return 1
            else if x < 0
                return 0
            else
                return x
        
        r = normalize(r)
        g = normalize(g)
        b = normalize(b)
        
        return "rgb(#{round(r * 255)}, #{round(g * 255)}, #{round(b * 255)})"

    # Convert a color in sRGB to a LABColor object
    @fromSRGB: (red, green, blue) ->
        # Define a function to do gamma correction
        # http://en.wikipedia.org/wiki/SRGB#The_reverse_transformation
        gammaUncorrect = (c) -> if c <= 0.04045 then c / 12.92 else pow((c + 0.055) / (1 + 0.055), 2.4)
    
        # Convert to linear-RGB
        return LABColor.fromLRGB(gammaUncorrect(red), gammaUncorrect(green), gammaUncorrect(blue))

    # Convert a color in linear RGB to a LABColor object
    @fromLRGB: (red, green, blue) ->
        #console.log("rgb #{red}, #{green}, #{blue}")
        # First we need to convert to XYZ
        m = [[0.4124, 0.3576, 0.1805],
             [0.2126, 0.7152, 0.0722],
             [0.0193, 0.1192, 0.9505]]
        [[x], [y], [z]] = matrixMultiply(m, [[red], [green], [blue]])
        #console.log("xyz #{x}, #{y}, #{z}")
        return LABColor.fromXYZ(x, y, z)

    # Convert a color in CIE XYZ to a LABColor object
    @fromXYZ: (x, y, z) ->
        # Convert to Lab
        # http://en.wikipedia.org/wiki/Lab_color_space#CIE_XYZ_to_CIE_L.2Aa.2Ab.2A_.28CIELAB.29_and_CIELAB_to_CIE_XYZ_conversions
        
        f = (t) -> if t > pow(6/29, 3) then pow(t, 1/3) else pow(29/6, 2) * t / 3 + 4/29
    
        l = 116 * f(y / refY) - 16
        a = 500 * (f(x / refX) - f(y / refY))
        b = 200 * (f(y / refY) - f(z / refZ))
        return LABColor.fromLAB(l, a, b)

    # Convert a color in CIE LAB to a Color object
    @fromLAB: (l, a, b) ->
        h = atan2(b, a)
        c = sqrt(a*a + b*b)
        return new LABColor(h, c / 135, l / 100)

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