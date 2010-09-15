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

pi = Math.PI

fmod = (x, n) -> x % n

sum = (a) ->
    s = 0
    for x in a.sort()
        s += x
    return s

euclidianMetric = (x, y) -> sqrt(x.value * x.value + y.value * y.value)

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
