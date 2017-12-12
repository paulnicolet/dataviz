import * as d3 from 'd3';
import buildSlider from './slider';
import buildMap from './map';
import buildCountryTimeSeries from './country_time_series';
import buildBubbleChart from './bubbles';


require('./main.scss');

// Build time slider
const MAP_SLIDER_ID = 'map-slider';
const MAP_SLIDER_WIDTH = 400;
const MAP_SLIDER_HEIGHT = 100;
const MAP_START_DATE = new Date('1745');
const MAP_END_DATE = new Date('2013');
//let mapSlider = buildSlider(MAP_SLIDER_ID, MAP_START_DATE, MAP_END_DATE, MAP_SLIDER_WIDTH, MAP_SLIDER_HEIGHT);

// Build map
const MAP_ID = 'map';
const MAP_WIDTH = 900;
const MAP_HEIGHT = 600;
const WORLD_TOPOJSON_PATH = './data/110m.json';
const TEMPERATURES_PATH = './data/temp_city_all.json';
//let map = buildMap(MAP_ID, TEMPERATURES_PATH, WORLD_TOPOJSON_PATH, MAP_WIDTH, MAP_HEIGHT);

// Register with slider
//mapSlider.moved(year => map.renderTemperatures(year));

// Build time series
const COUNTRY_TIME_SERIES_ID = 'country_time_series';
const COUNTRY_TIME_SERIES_PATH = './data/country_temp_from_1850-01-01_step_1y.json';
const GLOBAL_TIME_SERIES_PATH = './data/glob_temp_from_1850-01-01_step_1y.json';
const COUNTRY_TIME_SERIES_WIDTH = 900;
const COUNTRY_TIME_SERIES_HEIGHT = 600;
buildCountryTimeSeries(COUNTRY_TIME_SERIES_ID, COUNTRY_TIME_SERIES_PATH,
	GLOBAL_TIME_SERIES_PATH, COUNTRY_TIME_SERIES_WIDTH, COUNTRY_TIME_SERIES_HEIGHT);


// Build bubble chart
const BUBBLE_CHART_ID = 'bubbles';
const BUBBLE_DATA_PATH = './data/final.min.json';
const BUBBLE_CHART_WIDTH = 900;
const BUBBLE_CHART_HEIGHT = 400;
let bubbles = buildBubbleChart(BUBBLE_CHART_ID, BUBBLE_DATA_PATH, BUBBLE_CHART_WIDTH, BUBBLE_CHART_HEIGHT);

const BUBBLE_SLIDER_ID = 'bubble-slider';
const BUBBLE_SLIDER_WIDTH = 400;
const BUBBLE_SLIDER_HEIGHT = 100;
const BUBBLE_START_DATE = new Date('1976');
const BUBBLE_END_DATE = new Date('2013');
let bubbleSlider = buildSlider(BUBBLE_SLIDER_ID, BUBBLE_START_DATE, BUBBLE_END_DATE, BUBBLE_SLIDER_WIDTH, BUBBLE_SLIDER_HEIGHT);
bubbleSlider.moved(year => bubbles.animateBubbles(year));
