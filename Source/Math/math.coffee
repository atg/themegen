### CONSTANTS and FUNCTIONS ###
pow = Math.pow
exp = Math.exp
sqrt = Math.sqrt
abs = Math.abs

sin = Math.sin
cos = Math.cos
tan = Math.tan
atan2 = Math.atan2

floor = Math.floor
round = Math.round

log = Math.log

pi = Math.PI

fmod = (x, n) -> x % n

sum = (a) ->
    s = 0
    for x in a.sort()
        s += x
    return s

scale = (a, b, k) -> (1 - k) * a  +  k * b

euclideanMetric = (a, b) ->
    x1 = a.values["likeness"]
    x2 = b.values["importance"]
    
    y1 = a.values["likeness"]
    y2 = b.values["importance"]
    
    return sqrt(x1 * x2  +  y1 * y2)

maximum = (xs) ->
    maxV = null
    for x in xs
        if maxV == null || x > maxV
            maxV = x
    return maxV

minimum = (xs) ->
    minV = null
    for x in xs
        if minV == null || x < minV
            minV = x
    return minV

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
