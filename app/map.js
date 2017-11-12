import * as d3 from 'd3';
import * as topojson from 'topojson';

require('./map.scss');

// Circle constants
const SMALL_CIRCLE = 7;
const LARGE_CIRCLE = 20;
const CIRCLE_ANIM_DURATION = '300';

// Color constants
const COLD_COLOR = d3.rgb(149, 184, 252, 0.5);
const HOT_COLOR = d3.rgb(252, 18, 27, 0.5);

class TemeraturesMap {
	constructor(id, data, topology, outerWidth, outerHeight) {
		this.id = id;
		this.data = data;
		this.topology = topology;
		this.width = outerWidth;
		this.height = outerHeight;

		// Define container
		this.svg = d3.select(`#${this.id}`).append('svg')
						.attr('width', this.width)
						.attr('height', this.height);

		// Define projection and path
		this.projection = d3.geoNaturalEarth1();
		this.path = d3.geoPath(this.projection);

		// Render elements
		this.renderTopology();
		this.renderTemperatures();
	}

	renderTemperatures() {
		let temperatures = this.data[0]['1900-01-01'];

		let tempValues = temperatures.map(t => t.AverageTemperature);
		let minTemp = Math.min(...tempValues);
		let maxTemp = Math.max(...tempValues);

		let colorScale = d3.scaleLinear().domain([minTemp, maxTemp])
						      .interpolate(d3.interpolateHcl)
						      .range([COLD_COLOR, HOT_COLOR]);

		let newCircle = this.svg.append('g')
							.attr('id', 'temperatures')
							.selectAll('g .temperature-group')
							.data(temperatures)
							.enter()
							.append('g')
							.attr('class', 'temperature-group')
							.append('circle')
							.attr('cx', d => this.projection([d.Longitude, d.Latitude])[0])
							.attr('cy', d => this.projection([d.Longitude, d.Latitude])[1])
							.attr('r', SMALL_CIRCLE)
							.attr('fill', d => colorScale(d.AverageTemperature));

		this.animateCircle(newCircle);

	}

	animateCircle(circle) {
		circle.on('mouseover', function(d, i) {
			let circle = d3.select(this);
			let parent = d3.select(this.parentNode);

			circle.transition()
					.duration(CIRCLE_ANIM_DURATION)
					.attr('r', LARGE_CIRCLE);

			parent.append('text')
					.attr('x', circle.attr('cx'))
					.attr('y', circle.attr('cy'))
					.attr('fill', 'black')
					.attr('font-family', 'Inconsolata')
					.attr('font-size', LARGE_CIRCLE)
					.attr('transform', `translate(0, ${-LARGE_CIRCLE})`)
					.text(`${d.City}: ${d.AverageTemperature.toFixed(1)}°`);

		})
		.on('mouseout', function(d, i) {
			let circle = d3.select(this);
			let parent = d3.select(this.parentNode);

			circle.transition()
					.duration(CIRCLE_ANIM_DURATION)
					.attr('r', SMALL_CIRCLE);

			parent.selectAll('text').remove();
		});
	}

	renderTopology() {
		let countries = topojson.feature(this.topology, this.topology.objects.countries).features;

		this.svg.append('g')
				.attr('id', 'topology')
				.selectAll('path')
				.data(countries)
				.enter()
					.append('path')
					.attr('d', this.path)
					.attr('class', 'country');
	}
}

export default function(id, dataPath, topoPath, width, height) {
	d3.json(topoPath, (error, world) => {
		if (error) window.alert('Could not load topology');

		d3.json(dataPath, (error, data) => {
			if (error) window.alert('Could not load temperatures');

			return new TemeraturesMap(id, data, world, width, height);
		})
	})
}
