#!/usr/bin/env bash

# I bet some bash dude could tidy this up by using `find` and `mkdir -p` - right now we have to do it by hand

coffeeprocess() {
    coffee -scp --no-wrap < "Source/$1.coffee" > "Built/$1.js"
}

coffeeprocess "Color/CIECAM02"
coffeeprocess "Color/CIEDE2000"
coffeeprocess "Color/color"

coffeeprocess "Math/kmeans"
coffeeprocess "Math/math"
coffeeprocess "Math/stats"

coffeeprocess "UI/generator"

#coffee -scp --no-wrap < Source/Color/CIECAM02.coffee > Built/Color/CIECAM02.js