import * as d3 from 'd3';
import * as topojson from 'topojson';

require('./map.scss');

const WIDTH = 900;
const HEIGHT = 600;
const WORLD_TOPOJSON_PATH = 'https://unpkg.com/world-atlas@1/world/110m.json';
const DATA_PATH = 'http://localhost:8001/temp_city_1900-01-01_.json';

// Define containers
let svg = d3.select('#map').append('svg')
			.attr('width', WIDTH)
			.attr('height', HEIGHT);

// Define projection and path
let projection = d3.geoNaturalEarth1();
let path = d3.geoPath(projection);

// Load topology
d3.json(WORLD_TOPOJSON_PATH, (error, world) => {
	if (error) window.alert('Could not load topology');
	buildTopology(world, svg);

	// Load temperatures
	d3.json(DATA_PATH, (error, data) => {
		if (error) window.alert('Could not load temperatures');
		buildTemperatures(data, svg);
	});
});

function buildTemperatures(data, svg) {
	let temperatures = data[0]['1900-01-01'];

	svg.append('g')
		.attr('id', 'temperatures')
		.selectAll('circle')
		.data(temperatures)
		.enter()
			.append('circle')
			.attr('cx', d => projection([d.Longitude, d.Latitude])[0])
			.attr('cy', d => projection([d.Longitude, d.Latitude])[1])
			.attr('r', 2);
}

function buildTopology(topology, svg) {
	let countries = topojson.feature(topology, topology.objects.countries).features;

	svg.append('g')
		.attr('id', 'topology')
		.selectAll('path')
		.data(countries)
		.enter()
			.append('path')
			.attr('d', path)
			.attr('class', 'country');
}
