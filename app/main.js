import * as d3 from 'd3';
import buildMap from './map';

//require('./main.scss');

// Build map
const MAP_ID = 'map';
const MAP_WIDTH = 900;
const MAP_HEIGHT = 600;
const WORLD_TOPOJSON_PATH = 'https://unpkg.com/world-atlas@1/world/110m.json';
const TEMPERATURES_PATH = 'http://localhost:8001/temp_city_1900-01-01_.json';
buildMap(MAP_ID, TEMPERATURES_PATH, WORLD_TOPOJSON_PATH, MAP_WIDTH, MAP_HEIGHT);
