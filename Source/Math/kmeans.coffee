# Group `points` into `k` clusters by distance. Distance is defined as `metric(a, b)`
kmeans = (k, points, metric) ->
    # Generate some inital means
    groupings = find_initial_groupings(k, points, metric)
    #alert(JSON.stringify(groupings.map((a) -> a.length)))
    return groupings
    
    means = update_means(k, groupings)
    groupings = null
    threshhold = 1e-5
    
    # Loop indefinitely until convergence is achieved
    for i in [1..25]
        groupings = find_groupings(k, points, means, metric)
        
        old_means = means.slice(0) # Copy the array
        means = update_means(k, groupings)
        
        #alert(JSON.stringify(means))
        
        if max_difference(old_means, means, metric) < threshhold
            break
    alert(JSON.stringify(groupings.map((a) -> a.length)))
        
    return groupings
    

# Find initial groupings
find_initial_groupings = (k, points, metric) ->
    means = []
    
    ###
    for i in [0...k]
        mean =
            'values':
                'likeness': random()
                'importance': random()
        
        means.push(mean)
    ###
    
    ###
    angle = randomInInterval(0, 2 * pi)
    for i in [0...k]
        mean =
            'values':
                'likeness': 0.5 * cos(angle) + 0.5
                'importance': 0.5 * sin(angle) + 0.5
        
        means.push(mean)

        angle += 2 * pi / k
        angle = angle % 2 * pi
    ###
    
    # Work out some rough means by taking random indexes
    all_indexes = i for i in [0...points.length]
    indexes = []
    for i in [0...k]
        index_index = floor(randomInInterval(0, all_indexes.length))
        
        index = all_indexes[index_index]
        all_indexes.splice(index_index, 1)
        
        indexes.push(index)
        means.push(points[index])
    
    # Find all the points associated with this mean
    initialGroupings = find_groupings(k, points, means, metric)
    
    # Each grouping should have floor(|points|/k) items
    min_count = floor(points.length / k)
    max_count = min_count + 1
    for grouping in initialGroupings
        # If this grouping has enough items, continue
        if grouping.length > min_count
            continue
        
        # Otherwise, take the nearest item that isn't in the group
        for j in [0...(min_count - grouping.length)]
            m = centroid(grouping)
            if typeof m == "undefined"
                break
            
            nearest = null
            smallest = -1
            nearestGrouping = null
            for targetGrouping in initialGroupings
                if targetGrouping.length <= max_count
                    continue
                
                n_index = closest(targetGrouping, m, metric)
                if n_index == -1
                    continue
                
                s = metric(targetGrouping[n_index], m)
                
                if smallest == -1 || s < smallest
                    smallest = s
                    nearest = targetGrouping[n_index]
                    nearestGrouping = targetGrouping
            
            if smallest == -1
                #alert("SMALLEST == -1")
                break
            
            nearestGrouping.splice(nearestGrouping.indexOf(nearest), 1)
            grouping.push(nearest)
            #alert(grouping.length)#JSON.stringify(initialGroupings.map((a) -> a.length)))
    return initialGroupings
    
    # The refined means are the centroid of this grouping
    means = update_means(k, initialGroupings)
    
    #alert("indexes" + JSON.stringify())
    alert(JSON.stringify(initialGroupings.map((a) -> a.length)))
    
    ###
    # We just choose arbitrary means here, but it would be better to chose them agglomeratively
    l = floor(points.length / k)
    
    position = 0
    means = []
    for i in [0...k]
        if i == k - 1
            means[i] = centroid(points.slice(position))
        else
            means[i] = centroid(points.slice(position, position + l))
            position += l
        
    return means
    ###
    
    #alert(JSON.stringify(means))
    
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
    
    for i in [0...k]
        groupings.push([])
    
    # For each point
    for p in points
        # Find the closest mean
        closest_mean_index = closest(means, p, metric)
        
        # Add this point to the array for that point
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
    centroid_point =
        "values":
            "likeness": 0
            "importance": 0
    
    for p in points.sort()
        centroid_point.values["likeness"] += p.values["likeness"] / points.length
        centroid_point.values["importance"] += p.values["importance"] / points.length
    
    return centroid_point


# Find the index of the closest point in a list of `points` to `point`, by using `metric`
closest = (points, point, metric) ->
    if points.length == 0
        return -1
    
    minimum = -1
    smallest_distance = -1
    
    for i in [0...points.length]
        p = points[i]
        d = metric(p, point)
        #alert("" + i + " -> " + d + ": " + JSON.stringify(p) + ", " + JSON.stringify(point))
        if smallest_distance < 0 || d < smallest_distance
            smallest_distance = d
            minimum = i
    
    #alert(minimum)
    
    return minimum

