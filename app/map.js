import * as d3 from 'd3';
import * as chrom from  'd3-scale-chromatic';
import * as topojson from 'topojson';

require('./map.scss');

// Circle constants
const SMALL_CIRCLE = 3;
const LARGE_CIRCLE = 20;
const CIRCLE_ANIM_DURATION = '300';

class TemperaturesMap {
	constructor(id, dataPath, topologyPath, outerWidth, outerHeight) {
		this.id = id;
		this.width = outerWidth;
		this.height = outerHeight;

		// Define container
		this.svg = d3.select(`#${this.id}`).append('svg')
						.attr('width', this.width)
						.attr('height', this.height);

		// Define projection and path
		this.projection = d3.geoNaturalEarth1();
		this.path = d3.geoPath(this.projection);

		// Load and display
		this.init(dataPath, topologyPath);
	}

	renderTemperatures(year) {
		// Clean everything up
		d3.selectAll('circle').remove();

		let temperatures = this.data[year];

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
							.attr('fill', d => {
								let c = chrom.interpolateRdYlBu(this.colorScale(d.AverageTemperature));
								let color = d3.color(c);
								color.opacity = 0.9;
								return color;
							});

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
					.attr('class', 'map-popup')
					.attr('x', circle.attr('cx'))
					.attr('y', circle.attr('cy'))
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

	init(dataPath, topologyPath) {
		// Load data
		d3.json(topologyPath, (error, world) => {
			if (error) window.alert('Could not load topology');

			d3.json(dataPath, (error, data) => {
				if (error) window.alert('Could not load temperatures');

				// Get data
				this.topology = world;
				this.data = data.data;
				this.minTemp = data.min;
				this.maxTemp = data.max;

				// Create color scale
				this.colorScale =  d3.scaleLinear()
									.domain([this.minTemp, this.maxTemp])
						      		.range([1, 0]);

				// Render elements
				let minYear = Math.min(...Object.keys(this.data));

				this.renderTopology();
				this.renderTemperatures(minYear);
			});
		});
	}
}

export default function(id, dataPath, topoPath, width, height) {
	return new TemperaturesMap(id, dataPath, topoPath, width, height);
}
