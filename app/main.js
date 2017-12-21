import * as d3 from 'd3';
import './layout';
import buildSlider from './slider';
import buildMap from './map';
import buildCountryTimeSeries from './country_time_series';
import buildBubbleChart from './bubbles';

require('./main.scss');

// Build map
const MAP_ID = 'map';
const MAP_WIDTH = document.getElementById(MAP_ID).clientWidth;
const MAP_RATIO = 2/3;
const MAP_HEIGHT = MAP_RATIO * MAP_WIDTH;
const WORLD_TOPOJSON_PATH = './data/110m.json';
const TEMPERATURES_PATH = './data/temp_city_all.json';
let map = buildMap(MAP_ID, TEMPERATURES_PATH, WORLD_TOPOJSON_PATH, MAP_WIDTH, MAP_HEIGHT);

// Build time slider
const MAP_SLIDER_ID = 'map-slider';
const MAP_PLAY_ID = 'play-map-btn';
const MAP_STOP_ID = 'stop-map-btn';
const MAP_PLAY_INTERVAL = 300;
const MAP_SLIDER_WIDTH = document.getElementById(MAP_SLIDER_ID).clientWidth;
const MAP_SLIDER_RATIO = 1/6;
const MAP_SLIDER_HEIGHT = MAP_SLIDER_RATIO * MAP_SLIDER_WIDTH;
const MAP_START_DATE = 1850;
const MAP_END_DATE = 2013;
let mapSlider = buildSlider(MAP_SLIDER_ID, MAP_START_DATE, MAP_END_DATE, MAP_SLIDER_WIDTH, MAP_SLIDER_HEIGHT);
mapSlider.moved(year => map.renderTemperatures(year));

let mapIntervalID;
document.getElementById(MAP_PLAY_ID).addEventListener('click', (e) => {
	e.target.classList.add("disabled");
	mapIntervalID = setInterval(() => {
		mapSlider.inc();
	}, MAP_PLAY_INTERVAL);
});

document.getElementById(MAP_STOP_ID).addEventListener('click', (e) => {
	clearInterval(mapIntervalID);
	document.getElementById(MAP_PLAY_ID).classList.remove("disabled");
});

// Build time series
const COUNTRY_TIME_SERIES_ID = 'country_time_series';
const COUNTRY_TIME_SERIES_PATH = './data/temp_time_series.json';
buildCountryTimeSeries(COUNTRY_TIME_SERIES_ID, COUNTRY_TIME_SERIES_PATH);


// Build bubble chart
const BUBBLE_CHART_ID = 'bubbles';
const BUBBLE_DETAILS_ID = 'bubble-details';
const BUBBLE_DATA_PATH = './data/final.min.json';
const BUBBLE_CHART_WIDTH = document.getElementById(BUBBLE_CHART_ID).clientWidth;
const BUBBLE_CHART_RATIO = 1/3;
const BUBBLE_CHART_HEIGHT = BUBBLE_CHART_RATIO * BUBBLE_CHART_WIDTH;
let bubbles = buildBubbleChart(BUBBLE_CHART_ID, BUBBLE_DETAILS_ID, BUBBLE_DATA_PATH, BUBBLE_CHART_WIDTH, BUBBLE_CHART_HEIGHT);


const BUBBLE_SLIDER_ID = 'bubble-slider';
const BUBBLE_PLAY_ID = 'play-bubbles-btn';
const BUBBLE_STOP_ID = 'stop-bubbles-btn';
const BUBBLE_PLAY_INTERVAL = 1000;
const BUBBLE_SLIDER_WIDTH = document.getElementById(BUBBLE_SLIDER_ID).clientWidth;
const BUBBLE_SLIDER_RATIO = 1/6;
const BUBBLE_SLIDER_HEIGHT = MAP_SLIDER_RATIO * MAP_SLIDER_WIDTH;
const BUBBLE_START_DATE = 1950;
const BUBBLE_END_DATE = 2013;
let bubbleSlider = buildSlider(BUBBLE_SLIDER_ID, BUBBLE_START_DATE, BUBBLE_END_DATE, BUBBLE_SLIDER_WIDTH, BUBBLE_SLIDER_HEIGHT);
bubbleSlider.moved(year => bubbles.animateBubbles(year));

let bubbleIntervalID;
document.getElementById(BUBBLE_PLAY_ID).addEventListener('click', (e) => {
	e.target.classList.add("disabled");
	bubbleIntervalID = setInterval(() => {
		bubbleSlider.inc();
	}, BUBBLE_PLAY_INTERVAL);
});

document.getElementById(BUBBLE_STOP_ID).addEventListener('click', (e) => {
	clearInterval(bubbleIntervalID);
	document.getElementById(BUBBLE_PLAY_ID).classList.remove("disabled");
});

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