### RANDOM NUMBER GENERATION ###

# Generate a random number between 0 and 1
random = Math.random
    
# Generate a random number between a and b
randomInInterval = (a, b) -> a + random() * (b - a)

# Generate a random number with a 95% probability of being between 0 and 1, and a good probability of being in the neighbourhood of 1/2
normalRandom = ->
    u = random()
    v = random()
    
    return sqrt(-2 * log(u)) * cos(2 * pi * v)


normalRandomInInterval = (a, b) -> a + normalRandom() * (b - a)

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
