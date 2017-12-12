import * as d3 from 'd3';
import buildSlider from './slider';
import buildMap from './map';
import buildCountryTimeSeries from './country_time_series';
import buildBubbleChart from './bubbles';


require('./main.scss');

// Build time slider
const MAP_SLIDER_ID = 'map-slider';
const MAP_SLIDER_WIDTH = document.getElementById(MAP_SLIDER_ID).clientWidth;
const MAP_SLIDER_RATIO = 1/3;
const MAP_SLIDER_HEIGHT = MAP_SLIDER_RATIO * MAP_SLIDER_WIDTH;
const MAP_START_DATE = new Date('1745');
const MAP_END_DATE = new Date('2013');
let mapSlider = buildSlider(MAP_SLIDER_ID, MAP_START_DATE, MAP_END_DATE, MAP_SLIDER_WIDTH, MAP_SLIDER_HEIGHT);

// Build map
const MAP_ID = 'map';
const MAP_WIDTH = document.getElementById(MAP_ID).clientWidth;
const MAP_RATIO = 2/3;
const MAP_HEIGHT = MAP_RATIO * MAP_WIDTH;
const WORLD_TOPOJSON_PATH = './data/110m.json';
const TEMPERATURES_PATH = './data/temp_city_all.json';
let map = buildMap(MAP_ID, TEMPERATURES_PATH, WORLD_TOPOJSON_PATH, MAP_WIDTH, MAP_HEIGHT);

// Register with slider
mapSlider.moved(year => map.renderTemperatures(year));

// Build time series
const COUNTRY_TIME_SERIES_ID = 'country_time_series';
const COUNTRY_TIME_SERIES_PATH = './data/country_temp_from_1850-01-01_step_1y.json';
const GLOBAL_TIME_SERIES_PATH = './data/glob_temp_from_1850-01-01_step_1y.json';
const COUNTRY_TIME_SERIES_WIDTH = document.getElementById(COUNTRY_TIME_SERIES_ID).clientWidth;
const COUNTRY_TIME_SERIES_RATIO = 2/3;
const COUNTRY_TIME_SERIES_HEIGHT = COUNTRY_TIME_SERIES_RATIO * COUNTRY_TIME_SERIES_WIDTH;
buildCountryTimeSeries(COUNTRY_TIME_SERIES_ID, COUNTRY_TIME_SERIES_PATH,
	GLOBAL_TIME_SERIES_PATH, COUNTRY_TIME_SERIES_WIDTH, COUNTRY_TIME_SERIES_HEIGHT);


// Build bubble chart
const BUBBLE_CHART_ID = 'bubbles';
const BUBBLE_DETAILS_ID = 'bubble-details';
const BUBBLE_DATA_PATH = './data/final.min.json';
const BUBBLE_CHART_WIDTH = document.getElementById(BUBBLE_CHART_ID).clientWidth;
const BUBBLE_CHART_RATIO = 1/3;
const BUBBLE_CHART_HEIGHT = BUBBLE_CHART_RATIO * BUBBLE_CHART_WIDTH;
let bubbles = buildBubbleChart(BUBBLE_CHART_ID, BUBBLE_DETAILS_ID, BUBBLE_DATA_PATH, BUBBLE_CHART_WIDTH, BUBBLE_CHART_HEIGHT);


const BUBBLE_SLIDER_ID = 'bubble-slider';
const BUBBLE_SLIDER_WIDTH = document.getElementById(BUBBLE_SLIDER_ID).clientWidth;
const BUBBLE_SLIDER_RATIO = 1/3;
const BUBBLE_SLIDER_HEIGHT = MAP_SLIDER_RATIO * MAP_SLIDER_WIDTH;
const BUBBLE_START_DATE = new Date('1976');
const BUBBLE_END_DATE = new Date('2013');
let bubbleSlider = buildSlider(BUBBLE_SLIDER_ID, BUBBLE_START_DATE, BUBBLE_END_DATE, BUBBLE_SLIDER_WIDTH, BUBBLE_SLIDER_HEIGHT);
bubbleSlider.moved(year => bubbles.animateBubbles(year));

// Resize charts
window.addEventListener('resize', () => {
	// Resize map
	let newWidth = document.getElementById(MAP_ID).clientWidth;
	let newHeight = MAP_RATIO * newWidth;
	document.getElementById(MAP_ID).innerHTML = '';
	map.resize(newWidth, newHeight);

	// Resize bubbles
	newWidth = document.getElementById(BUBBLE_CHART_ID).clientWidth;
	newHeight = BUBBLE_CHART_RATIO * newWidth;
	document.getElementById(BUBBLE_CHART_ID).innerHTML = '';
	bubbles.resize(newWidth, newHeight);

	// Resize sliders
	newWidth = document.getElementById(MAP_SLIDER_ID).clientWidth;
	newHeight = MAP_SLIDER_RATIO * newWidth;
	document.getElementById(MAP_SLIDER_ID).innerHTML = '';
	mapSlider.resize(newWidth, newHeight);

	newWidth = document.getElementById(BUBBLE_SLIDER_ID).clientWidth;
	newHeight = BUBBLE_SLIDER_RATIO * newWidth;
	document.getElementById(BUBBLE_SLIDER_ID).innerHTML = '';
	bubbleSlider.resize(newWidth, newHeight);
});
