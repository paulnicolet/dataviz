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

	let tempValues = temperatures.map(t => t.AverageTemperature);
	let minTemp = Math.min(...tempValues);
	let maxTemp = Math.max(...tempValues);

	let colorScale = d3.scaleLinear().domain([minTemp, maxTemp])
				      .interpolate(d3.interpolateHcl)
				      .range([d3.rgb(149, 184, 252, 0.5), d3.rgb(252, 18, 27, 0.5)]);

	let newTemp = svg.append('g')
					.attr('id', 'temperatures')
					.selectAll('g .temperature-group')
					.data(temperatures)
					.enter()
						.append('g')
						.attr('class', 'temperature-group');

	newTemp.append('circle')
			.attr('cx', d => projection([d.Longitude, d.Latitude])[0])
			.attr('cy', d => projection([d.Longitude, d.Latitude])[1])
			.attr('r', 7)
			.attr('fill', d => colorScale(d.AverageTemperature))
			.on('mouseover', function(d, i) {
				let circle = d3.select(this);
				let parent = d3.select(this.parentNode);

				circle.transition()
						.duration('300')
						.attr('r', 20);

				parent.append('text')
						.attr('x', circle.attr('cx'))
						.attr('y', circle.attr('cy'))
						.attr('fill', 'black')
						.attr('font-family', 'Inconsolata')
						.attr('font-size', 20)
						.attr('transform', `translate(0, ${-20})`)
						.text(`${d.City}: ${d.AverageTemperature.toFixed(1)}°`);

			})
			.on('mouseout', function(d, i) {
				let circle = d3.select(this);
				let parent = d3.select(this.parentNode);

				circle.transition()
						.duration('300')
						.attr('r', 7);

				parent.selectAll('text').transition().duration('50').remove();
			})
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
