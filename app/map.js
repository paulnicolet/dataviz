import * as d3 from 'd3';
import * as chrom from  'd3-scale-chromatic';
import * as topojson from 'topojson';

require('./map.scss');

// Define margins
const MARGIN = {top: 20, bottom: 20, left: 20, right: 20};

// Circle constants
const OPACITY = 1;
const SMALL_CIRCLE = 3.5;
const LARGE_CIRCLE = 30;
const CIRCLE_ANIM_DURATION = '200';

// Legend constants
const LEGEND_WIDTH = 30;
const LEGEND_HEIGHT = 20;
const CORNER_RADIUS = 10;

// Topology constants
const TOPOLOGY_SCALING_RATIO = 120/640;

class TemperaturesMap {
	constructor(id, dataPath, topologyPath, outerWidth, outerHeight) {
		this.id = id;

		// Initiliaze size dependent attributes
		this.initSizable(outerWidth, outerHeight);

		// Initialize viz
		this.init(dataPath, topologyPath);
	}

	renderTemperatures(year) {
		// Clean everything up
		d3.selectAll('.temperature-group').remove();

		// Get temperatures for given year
		let temperatures = this.data[year];

		// Append new circles
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
								color.opacity = OPACITY;
								return color;
							});
		
		// Add circles animations
		this.animateCircle(newCircle);

	}

	animateCircle(circle) {
		circle.on('mouseover', function(d, i) {
			let group = this.parentNode;
			let circle = d3.select(this);
			let parent = d3.select(group);

			// Enlarge circle
			circle.transition()
					.duration(CIRCLE_ANIM_DURATION)
					.attr('r', LARGE_CIRCLE);

			// Append text description
			parent.append('text')
					.attr('class', 'map-popup')
					.attr('x', circle.attr('cx'))
					.attr('y', circle.attr('cy'))
					.attr('transform', `translate(${LARGE_CIRCLE}, ${-LARGE_CIRCLE - 5})`)
					.style('text-anchor', 'end')
					.text(`${d.City}: ${d.AverageTemperature.toFixed(1)}°`);

			group.parentNode.appendChild(group);
		})
		.on('mouseout', function(d, i) {
			let circle = d3.select(this);
			let parent = d3.select(this.parentNode);

			// Shrink circle
			circle.transition()
					.duration(CIRCLE_ANIM_DURATION)
					.attr('r', SMALL_CIRCLE);

			// Remove text
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

	renderLegend() {
		let legend = this.svg.append('g')
						.attr('id', 'map-legend');

		let low = d3.color(chrom.interpolateRdYlBu(1));
		let high = d3.color(chrom.interpolateRdYlBu(0));
		low.opacity = OPACITY;
		high.opacity = OPACITY;

		// Render legend rectangles
		legend.append('rect')
				.attr('width', LEGEND_WIDTH)
				.attr('height', LEGEND_HEIGHT)
				.attr('rx', CORNER_RADIUS)
				.attr('ry', CORNER_RADIUS)
				.style('fill', low);

		legend.append('rect')
				.attr('width', LEGEND_WIDTH)
				.attr('height', LEGEND_HEIGHT)
				.attr('rx', CORNER_RADIUS)
				.attr('ry', CORNER_RADIUS)
				.attr('transform', `translate(0, ${(3/2) * LEGEND_HEIGHT})`)
				.style('fill', high);

		// Render legend text
		legend.append('text')
				.text(`${this.minTemp.toFixed(1)}°`)
				.attr('class', 'map-legend-text')
				.attr('transform', `translate(${LEGEND_WIDTH + 5}, ${LEGEND_HEIGHT - 3})`);

		legend.append('text')
				.text(`${this.maxTemp.toFixed(1)}°`)
				.attr('class', 'map-legend-text')
				.attr('transform', `translate(${LEGEND_WIDTH + 5}, ${(5/2) * LEGEND_HEIGHT - 3})`);

	}

	init(dataPath, topologyPath) {
		// Load topology
		d3.json(topologyPath, (error, world) => {
			if (error) window.alert('Could not load topology');

			// Load temperature data
			d3.json(dataPath, (error, data) => {
				if (error) window.alert('Could not load temperatures');
				
				this.topology = world;
				this.data = data.data;
				this.minTemp = data.min;
				this.maxTemp = data.max;

				// Create color scale
				this.colorScale =  d3.scaleLinear()
									.domain([this.minTemp, this.maxTemp])
						      		.range([1, 0]);

				// Get minimum year
				this.minYear = Math.min(...Object.keys(this.data));

				// Render viz
				this.renderTopology();
				this.renderLegend();
				this.renderTemperatures(this.minYear);
			});
		});
	}

	resize(outerWidth, outerHeight) {
		// Reinitialize size dependent attributes
		this.initSizable(outerWidth, outerHeight);
		
		// Re-render viz
		this.renderTopology();
		this.renderLegend();
		this.renderTemperatures(this.minYear);
	}

	initSizable(outerWidth, outerHeight) {
		// Define dimension 
		this.width = outerWidth - MARGIN.left - MARGIN.right;
		this.height = outerHeight - MARGIN.top - MARGIN.bottom;

		// Define container
		this.svg = d3.select(`#${this.id}`).append('svg')
						.attr('width', outerWidth)
						.attr('height', outerHeight)
						.append('g')
						.attr('transform', `translate(${MARGIN.left}, ${MARGIN.top})`);

		// Define projection
		this.projection = d3.geoNaturalEarth1()
							.scale(this.width * TOPOLOGY_SCALING_RATIO)
							.translate([this.width/2, this.height/2]);

		// Define topology path
		this.path = d3.geoPath(this.projection);
	}
}

export default function(id, dataPath, topoPath, width, height) {
	return new TemperaturesMap(id, dataPath, topoPath, width, height);
}
