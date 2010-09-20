//Constants.js

var sample_range = 0;
var cluster_boundary_range = 40;
var cluster_maximum_coverage = 200;

//***** These constants control the background *****
//Note that lightness constants are inverted for light themes
var bw_black = 0.1; //The black that corresponds to Black&White + Dark
var bw_white = 1.0; //The white that corresponds to Black&White + Light

var gray_dark_min = 0.075;
var gray_dark_max = 0.18;
var gray_light_min = 0.965;
var gray_light_max = 0.995;

var neutral_dark_min = 0.45;
var neutral_dark_max = 0.68;
var neutral_light_min = 1.70;
var neutral_light_max = 1.70;

var neutral_dark_chroma_min = 0.05;
var neutral_dark_chroma_max = 0.3;
var neutral_light_chroma_min = 0.1;
var neutral_light_chroma_max = 0.1;

/*
var neutral_dark_min = 0.01;
var neutral_dark_max = 0.075;
var neutral_light_min = 0.0;
var neutral_light_max = 0.05;

var neutral_dark_chroma_min = 0.25;
var neutral_dark_chroma_max = 0.25;
var neutral_light_chroma_min = 1.0;
var neutral_light_chroma_max = 1.0;
*/


var color_dark_lightness_min = 1.35;
var color_dark_lightness_max = 1.60;
var color_light_lightness_min = 4.5;
var color_light_lightness_max = 5.5;

var color_dark_chroma_min = 0.3;
var color_dark_chroma_max = 0.5;
var color_light_chroma_min = 1.2;
var color_light_chroma_max = 2.8;


//Variation that "importance" can have on various properties

var importance_variation_dark_lightness_min = 0.025;
var importance_variation_dark_lightness_max = 0.075;
var importance_variation_light_lightness_min = 0.05;
var importance_variation_light_lightness_max = 0.1;

var importance_variation_dark_chroma_min = 0.1;
var importance_variation_dark_chroma_max = 0.1;
var importance_variation_light_chroma_min = 0.1;
var importance_variation_light_chroma_max = 0.1;
