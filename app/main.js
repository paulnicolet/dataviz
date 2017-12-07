import * as d3 from 'd3';
import buildSlider from './slider';
import buildMap from './map';
import buildCountryTimeSeries from './country_time_series';


require('./main.scss');

// Build time slider
const SLIDER_ID = 'slider';
const SLIDER_WIDTH = 400;
const SLIDER_HEIGHT = 100;
const START_DATE = new Date('1745');
const END_DATE = new Date('2013');
//let slider = buildSlider(SLIDER_ID, START_DATE, END_DATE, SLIDER_WIDTH, SLIDER_HEIGHT);

// Build map
const MAP_ID = 'map';
const MAP_WIDTH = 900;
const MAP_HEIGHT = 600;
const WORLD_TOPOJSON_PATH = 'https://unpkg.com/world-atlas@1/world/110m.json';
const TEMPERATURES_PATH = './data/temp_city_all.json';
//let map = buildMap(MAP_ID, TEMPERATURES_PATH, WORLD_TOPOJSON_PATH, MAP_WIDTH, MAP_HEIGHT, slider);

// Register with slider
//slider.moved(year => map.renderTemperatures(year));

// build time series
const COUNTRY_TIME_SERIES_ID = 'country_time_series';
const COUNTRY_TIME_SERIES_PATH = './data/country_temp_from_1850-01-01_step_1y.json';
const GLOBAL_TIME_SERIES_PATH = './data/glob_temp_from_1850-01-01_step_1y.json';
const COUNTRY_TIME_SERIES_WIDTH = 900;
const COUNTRY_TIME_SERIES_HEIGHT = 600;
buildCountryTimeSeries(COUNTRY_TIME_SERIES_ID, COUNTRY_TIME_SERIES_PATH,
	GLOBAL_TIME_SERIES_PATH, COUNTRY_TIME_SERIES_WIDTH, COUNTRY_TIME_SERIES_HEIGHT);
