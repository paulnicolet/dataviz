import * as d3 from 'd3';
import buildSlider from './slider';
import buildMap from './map';

require('./main.scss');

// Build time slider
const SLIDER_ID = 'slider';
const SLIDER_WIDTH = 900;
const SLIDER_HEIGHT = 100;
const START_DATE = new Date('1900');
const END_DATE = new Date('2017');
buildSlider(SLIDER_ID, START_DATE, END_DATE, SLIDER_WIDTH, SLIDER_HEIGHT);


// Build map
const MAP_ID = 'map';
const MAP_WIDTH = 900;
const MAP_HEIGHT = 600;
const WORLD_TOPOJSON_PATH = 'https://unpkg.com/world-atlas@1/world/110m.json';
const TEMPERATURES_PATH = './data/temp_city_1900-01-01_.json';
buildMap(MAP_ID, TEMPERATURES_PATH, WORLD_TOPOJSON_PATH, MAP_WIDTH, MAP_HEIGHT);
