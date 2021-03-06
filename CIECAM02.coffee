## CIECAM02 ##

xyz_to_cat02 = (x, y, z) ->
    r = ( 0.7328 * x) + (0.4296 * y) - (0.1624 * z)
    g = (-0.7036 * x) + (1.6975 * y) + (0.0061 * z)
    b = ( 0.0030 * x) + (0.0136 * y) + (0.9834 * z)
    return [r, g, b]

cat02_to_xyz = (r, g, b) ->
    x = ( 1.096124 * r) - (0.278869 * g) + (0.182745 * b)
    y = ( 0.454369 * r) + (0.473533 * g) + (0.072098 * b)
    z = (-0.009628 * r) - (0.005698 * g) + (1.015326 * b)
    return [x, y, z]

hpe_to_xyz = (r, g, b) ->
    x = (1.910197 * r) - (1.112124 * g) + (0.201908 * b)
    y = (0.370950 * r) + (0.629054 * g) - (0.000008 * b)
    z = b
    return [x, y, z]

cat02_to_hpe = (r, g, b) ->
    rh = ( 0.7409792 * r) + (0.2180250 * g) + (0.0410058 * b)
    gh = ( 0.2853532 * r) + (0.6242014 * g) + (0.0904454 * b)
    bh = (-0.0096280 * r) - (0.0056980 * g) + (1.0153260 * b)
    return [rh, gh, bh]

nonlinear_adaptation = (c, fl) ->
    p = pow((fl * c) / 100.0, 0.42)
    return ((400.0 * p) / (27.13 + p)) + 0.1

inverse_nonlinear_adaptation = (c, fl) ->
    (100.0 / fl) * pow((27.13 * fabs(c - 0.1)) / (400.0 - fabs(c - 0.1)), 1.0 / 0.42)

Aab_to_rgb = (A, aa, bb, nbb) ->
    x = (A / nbb) + 0.305;
    
    #       c1              c2               c3       #
    r = (0.32787 * x) + (0.32145 * aa) + (0.20527 * bb)
    
    #       c1              c4               c5       #
    g = (0.32787 * x) - (0.63507 * aa) - (0.18603 * bb)
    
    #       c1              c6               c7       #
    b = (0.32787 * x) - (0.15681 * aa) - (4.49038 * bb)
    
    return [r, g, b]

class CIECAM02_Color
    # x  y  z
    # J  C  h H
    # Q  M  s
    # ac bc
    # as bs
    # am bm
    
    xyz_to_ciecam: (x, y, z, viewing_conditions) ->
        [@x, @y, @z] = [x, y, z]
        t_vc = viewing_conditions
        
        [r, g, b] = xyz_to_cat02(@x, @y, @z)
        [rw, gw, bw] = xyz_to_cat02(t_vc.xw, t_vc.yw, t_vc.zw)

        rc = r * (((t_vc.yw * t_vc.d) / rw) + (1.0 - t_vc.d))
        gc = g * (((t_vc.yw * t_vc.d) / gw) + (1.0 - t_vc.d))
        bc = b * (((t_vc.yw * t_vc.d) / bw) + (1.0 - t_vc.d))

        [rp, gp, bp] = cat02_to_hpe(rc, gc, bc)

        rpa = nonlinear_adaptation(rp, t_vc.fl)
        gpa = nonlinear_adaptation(gp, t_vc.fl)
        bpa = nonlinear_adaptation(bp, t_vc.fl)

        ca = rpa - ((12.0 * gpa) / 11.0) + (bpa / 11.0)
        cb = (1.0 / 9.0) * (rpa + gpa - (2.0 * bpa))

        @h = (180.0 / pi) * atan2(cb, ca)
        if @h < 0.0
            @h += 360.0
        
        if @h < 20.14
            temp = ((@h + 122.47) / 1.2) + ((20.14 - @h) / 0.8)
            @H = 300 + (100*((@h + 122.47) / 1.2)) / temp
        else if @h < 90.0
            temp = ((@h - 20.14) / 0.8) + ((90.00 - @h) / 0.7)
            @H = (100*((@h - 20.14) / 0.8)) / temp
        else if @h < 164.25
            temp = ((@h - 90.00) / 0.7) + ((164.25 - @h) / 1.0)
            @H = 100 + ((100*((@h - 90.00) / 0.7)) / temp)
        else if @h < 237.53
            temp = ((@h - 164.25) / 1.0) + ((237.53 - @h) / 1.2)
            @H = 200 + ((100*((@h - 164.25) / 1.0)) / temp)
        else
            temp = ((@h - 237.53) / 1.2) + ((360 - @h + 20.14) / 0.8)
            @H = 300 + ((100*((@h - 237.53) / 1.2)) / temp)
        
        a = ((2.0 * rpa) + gpa + ((1.0 / 20.0) * bpa) - 0.305) * t_vc.nbb

        @J = 100.0 * pow(a / t_vc.aw, t_vc.c * t_vc.z)

        et = (1.0 / 4.0) * (cos(((@h * pi) / 180.0) + 2.0) + 3.8)
        t = ((50000.0 / 13.0) * t_vc.nc * t_vc.ncb * et * sqrt((ca*ca) + (cb*cb))) /
             (rpa + gpa + (21.0/20.0)*bpa)

        @C = pow(t, 0.9) * sqrt(@J / 100.0) * pow(1.64 - pow(0.29, t_vc.n), 0.73)

        @Q = (4.0 / t_vc.c) * sqrt(@J / 100.0) * (t_vc.aw + 4.0) * pow(t_vc.fl, 0.25)

        @M = @C * pow(t_vc.fl, 0.25)

        @s = 100.0 * sqrt(@M / @Q)

        @ac = @C * cos((@h * pi) / 180.0)
        @bc = @C * sin((@h * pi) / 180.0)

        @am = @M * cos((@h * pi) / 180.0)
        @bm = @M * sin((@h * pi) / 180.0)

        @as = @s * cos((@h * pi) / 180.0)
        @bs = @s * sin((@h * pi) / 180.0)
    
    
    ciecam_to_xyz: (J, C, h, viewing_conditions) ->
        [@J, @C, @h] = [J, C, h]
        t_vc = viewing_conditions
        
        [rw, gw, bw] = xyz_to_cat02(t_vc.xw, t_vc.yw, t_vc.zw)
        t = pow(@C / (sqrt(@J / 100.0) * pow(1.64-pow(0.29, t_vc.n), 0.73)), (1.0 / 0.9))
        et = (1.0 / 4.0) * (cos(((@h * pi) / 180.0) + 2.0) + 3.8)

        a = pow(@J / 100.0, 1.0 / (t_vc.c * t_vc.z)) * t_vc.aw

        p1 = ((50000.0 / 13.0) * t_vc.nc * t_vc.ncb) * et / t
        p2 = (a / t_vc.nbb) + 0.305
        p3 = 21.0 / 20.0

        hr = (@h * pi) / 180.0

        if abs(sin(hr)) >= abs(cos(hr))
            p4 = p1 / sin(hr)
            cb = (p2 * (2.0 + p3) * (460.0 / 1403.0)) / (p4 + (2.0 + p3) * (220.0 / 1403.0) * (cos(hr) / sin(hr)) - (27.0 / 1403.0) + p3 * (6300.0 / 1403.0))
            ca = cb * (cos(hr) / sin(hr))
        else
            p5 = p1 / cos(hr)
            ca = (p2 * (2.0 + p3) * (460.0 / 1403.0)) / (p5 + (2.0 + p3) * (220.0 / 1403.0) - ((27.0 / 1403.0) - p3 * (6300.0 / 1403.0)) * (sin(hr) / cos(hr)))
            cb = ca * (sin(hr) / cos(hr))
        
        [rpa, gpa, bpa] = Aab_to_rgb(a, ca, cb, t_vc.nbb)

        rp = inverse_nonlinear_adaptation(rpa, t_vc.fl)
        gp = inverse_nonlinear_adaptation(gpa, t_vc.fl)
        bp = inverse_nonlinear_adaptation(bpa, t_vc.fl)

        [tx, ty, tz] = hpe_to_xyz(rp, gp, bp)
        [rc, gc, bc] = xyz_to_cat02(tx, ty, tz)

        @r = rc / (((t_vc.yw * t_vc.d) / rw) + (1.0 - t_vc.d))
        @g = gc / (((t_vc.yw * t_vc.d) / gw) + (1.0 - t_vc.d))
        @b = bc / (((t_vc.yw * t_vc.d) / bw) + (1.0 - t_vc.d))

        [@x, @y, @z] = cat02_to_xyz(r, g, b)

class CIECAM02_ViewingConditions
    # xw yw zw aw
    # la yb
    # surround        (integer)
    # n  z  f  c  nbb  nc  ncb  fl  d
    
    # Control the background
    setBackground: (brightness) -> [@la, @yb, @xw, @yw, @zw] = [4, brightness * 100, 95.05, 100, 108.88]
    
    # Control the surround field
    setAverage: -> [@f, @c, @nc] = [1, 0.69, 1]
    setDim: -> [@f, @c, @nc] = [0.9, 0.59, 0.95]
    setDark: -> [@f, @c, @nc] = [0.8, 0.525, 0.8]
    
    # Compute other variables
    compute: ->
        @n = @yb / @yw
        @z = 1.48 + pow(@n, 0.5)
        @fl = this.compute_fl()
        @nbb = 0.725 * pow((1.0 / @n), 0.2)
        @ncb = @nbb
        @d = (@f * (1.0 - ((1.0 / 3.6) * exp((-@la - 42.0) / 92.0))))
        @aw = this.achromatic_response_to_white()
    
    compute_fl: ->
        k = 1.0 / ((5.0 * @la) + 1.0)
        return 0.2 * pow(k, 4.0) * (5.0 * @la) + 0.1 * (pow((1.0 - pow(k, 4.0)), 2.0)) * (pow((5.0 * @la), (1.0 / 3.0)))
        
    achromatic_response_to_white: ->
        [r, g, b] = xyz_to_cat02(@xw, @yw, @zw)
        
        rc = r * (((@yw * @d) / r) + (1.0 - @d))
        gc = g * (((@yw * @d) / g) + (1.0 - @d))
        bc = b * (((@yw * @d) / b) + (1.0 - @d))

        [rp, gp, bp] = cat02_to_hpe(rc, gc, bc)

        rpa = nonlinear_adaptation(rp, @fl)
        gpa = nonlinear_adaptation(gp, @fl)
        bpa = nonlinear_adaptation(bp, @fl)

        return ((2.0 * rpa) + gpa + ((1.0 / 20.0) * bpa) - 0.305) * @nbb