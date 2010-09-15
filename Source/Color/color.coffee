[refX, refY, refZ] = [1, 1, 1]

rgb_to_css = (rgb) ->
    [r, g, b] = rgb
    normalize = (x) ->
        if x > 255
            return 255
        else if x < 0
            return 0
        else
            return x

    r = normalize(r)
    g = normalize(g)
    b = normalize(b)

    return "rgb(#{round(r)}, #{round(g)}, #{round(b)})"


class CIECAMColor
    constructor: (@hue, @chroma, @lightness) ->
    
    @normalVC: ->
        vc = new CIECAM02_ViewingConditions()
        vc.setBackground(0.2)
        vc.setAverage()
        vc.compute()
        return vc
        
    @vcWithBackground: (r, g, b) ->
        vc = new CIECAM02_ViewingConditions()
        vc.setBackground(0.2)
        vc.setAverage()
        
        [vc.xw, vc.yw, vc.zw] = cat02_to_xyz(r, g, b)
        #alert("background = " + [vc.xw, vc.yw, vc.zw])
        
        vc.compute()
        return vc
        
    asRGB: (vc) ->
        c = new CIECAM02_Color()
        [x, y, z] = c.ciecam_to_xyz(@lightness * 100, @chroma * 100, @hue, vc)
        return xyz_to_cat02(x, y, z)


###
x = @hue / (2 * pi)
xs = hueInterpolationPoints
count = xs.length - 1

newHue = 0

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

return [newHue * 2 * pi, @chroma, @lightness]
###

class RGBColor
    constructor: (@hue, @chroma, @lightness) ->
    
    asHSL: (hueInterpolationPoints) ->
        return [@hue, @chroma, @lightness]
    
    asRGB: ->
        [h, s, l] = this.asHSL()
        #c = s
        c = if l <= 1/2 then 2 * l * s else (2 - 2 * l) * s
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
        
        m = l - (c / 2)       
        #m = l - (0.30 * r + 0.59 * g + 0.11 * b)       
        
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
    
    # r, g, b  are in [0, 1]
    @fromRGB: (r, g, b) ->
        maxV = maximum([r, g, b])
        minV = minimum([r, g, b])
        
        if r == g == b
            @hue = 0
        else if r > g && r > b
            @hue = (60 * (g - b) / (maxV - minV) + 360) % 360
        else if g > r && g > b
            @hue = (60 * (b - r) / (maxV - minV) + 120)
        else if b > r && b > g
            @hue = (60 * (r - g) / (maxV - minV) + 240)
        
        @hue = @hue * 2 * pi / 360
        
        @lightness = (maxV + minV) / 2
        
        if r == g == b
            @chroma = 0
        else if @lightness <= 1/2
            @chroma = (maxV - minV) / (maxV + minV)
        else if @lightness >= 1/2
            @chroma = (maxV - minV) / (2 - maxV - minV)
        
        return new RGBColor(@hue, @chroma, @lightness)
    
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
