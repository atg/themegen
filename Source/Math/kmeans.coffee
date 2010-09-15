# Group `points` into `k` clusters by distance. Distance is defined as `metric(a, b)`
kmeans = (k, points, metric) ->
    # Generate some inital means
    means = find_initial_means(k, points, metric)
    groupings = null
    threshhold = 1e-5
    
    # Loop indefinitely until convergence is achieved
    loop
        groupings = find_groupings(k, points, means, metric)
        
        old_means = means.slice(0) # Copy the array
        means = update_means(k, groupings)
        
        if max_difference(old_means, means, metric) < threshhold
            break
    
    return groupings


# Find initial means
find_initial_means = (k, points, metric) ->
    # We just choose arbitrary means here, but it would be better to chose them agglomeratively
    l = floor((points.length + k - 1) / k)
    
    position = 0
    means = []
    for i in [0...k]
        if i == k - 1
            means[i] = points.slice(position)
        else
            means[i] = points.slice(position, position + l - 1)
            position += l
    return means

# Update means
update_means = (k, groupings) ->
    means = []

    for i in [0...k]
        means[i] = centroid(groupings[i])

    return means


# Assignment step
# In this step we go through each point and find its nearest mean. This gives us a list of list of lists, where each inner list is the points that share the same mean
## find_observations :: Int -> [Point] -> [Centroid] -> Metric -> [[Point]]
find_groupings = (k, points, means, metric) ->
    groupings = []

    # For each point
    for p in points
        # Find the closest mean
        closest_mean_index = closest(means, p, metric)

        # Add this point to the array for that point
        if ! groupings[closest_mean_index]?
            groupings[closest_mean_index] = []

        groupings[closest_mean_index].push(p)

    return groupings


# `a` and `b` are parallel lists. Finds the maximum difference between equivalent elements in `a` and `b`
max_difference = (a, b, metric) ->
    n = a.length
    max = 0
    
    for i in [0...n]
        d = metric(a[i], b[i])
        if d > max
            max = d
    
    return max

# Find the centroid (average point) of a list of `points`
centroid = (points) ->
    n = points.length
    centroid_point =
        "values": 0 for i in [0...n]
    
    for p in points.sort()
        for i in [0...p.values.length]
            centroid_point.values[i] += p.values[i] / points.length
    
    return centroid_point


# Find the index of the closest point in a list of `points` to `point`, by using `metric`
closest = (points, point, metric) ->
    minimum = -1
    smallest_distance = -1
    
    for i in [0...points.length]
        p = points[i]
        d = metric(p, point)
        if smallest_distance < 0 || d < smallest_distance
            smallest_distance = d
            minimum = i
    
    return minimum

