import * as d3 from 'd3';
import * as topojson from 'topojson';

require('./map.scss');

const WIDTH = 900;
const HEIGHT = 600;
const WORLD_TOPOJSON = 'https://unpkg.com/world-atlas@1/world/110m.json';

// Define containers
let svg = d3.select('#map').append('svg')
			.attr('width', WIDTH)
			.attr('height', HEIGHT);

let g = svg.append('g');

// Define projection and path
let projection = d3.geoNaturalEarth1();
let path = d3.geoPath(projection);

// Display topology
d3.json(WORLD_TOPOJSON, (error, world) => {
	let countries = topojson.feature(world, world.objects.countries).features;
	g.selectAll('path')
		.data(countries)
		.enter()
			.append('path')
			.attr('d', path)
			.attr('class', 'country');
});
