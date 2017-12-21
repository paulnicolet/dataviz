import * as d3 from 'd3';
import * as chrom from  'd3-scale-chromatic';

// Define margins
const MARGIN = {top: 20, right: 20, bottom: 70, left: 70};

// Bubble constants
const MIN_RADIUS_WIDTH_RATIO = 1/200;
const MAX_RADIUS_WIDTH_RATIO = 1/25;
const BUBBLE_OPACITY = 0.7;
const MOTION_DURATION = 1000;
const LARGE_VARIATION = 2.5;
const X_AXIS_LABEL = 'GDP (x10³ $)';
const Y_AXIS_LABEL = 'Temperature (°C)';

class BubbleChart {
	constructor(id, detailsId, dataPath, outerWidth, outerHeight) {
		this.id = id;
		this.detailsId = detailsId;
		this.dataPath = dataPath;
		
		// Init chart
		this.init(outerWidth, outerHeight);
	}

	init(outerWidth, outerHeight) {
		// Load temperature data
		d3.json(this.dataPath, (error, data) => {
			if (error) window.alert('Could not load bubble data');

			this.data = data;
			this.metadata = data.metadata;

			// Initialize size dependent attributes
			this.initSizable(outerWidth, outerHeight);

			// Get minimum year
			this.minYear = Math.min(...Object.keys(this.data).filter(e => e !== 'metadata'));

			// Render chart
			this.renderAxis();
			this.renderBubbles(this.minYear);
		});
	}

	animateBubbles(year) {
		// Get year data
		this.currentYear = year;
		let data = this.data[year];

		// Update details if a country is selected
		if (this.currentCountry != null) {
			this.updateDetails(this.currentCountry, 
								data[this.currentCountry].temperature, 
								data[this.currentCountry].gdp, 
								data[this.currentCountry].population, 
								data[this.currentCountry].variation);			
		}

		// Move each bubble with new year data
		d3.selectAll('.bubble')
			.transition()
			.duration(MOTION_DURATION)
			.attr('cx', d => this.xScale(data[d.country].gdp))
			.attr('cy', d => this.yScale(data[d.country].temperature))
			.attr('r', d => this.radiusScale(data[d.country].population))
			.style("fill", d => d3.color(chrom.interpolateRdYlGn(this.variationScale(data[d.country].variation))));
	}

	renderBubbles(year) {
		// Get year data
		this.currentYear = year;
		let data = Object.values(this.data[year]);

		// Append circles
		let newCircle = this.svg.append('g')
							.attr('id', 'bubbles')
							.selectAll('bubble')
							.data(data)
							.enter()
							.append('circle')
							.attr('class', 'bubble')
							.attr('cx', d => this.xScale(d.gdp))
							.attr('cy', d => this.yScale(d.temperature))
							.attr('r', d => this.radiusScale(d.population))
							.style("fill-opacity", BUBBLE_OPACITY)
							.style("fill", d => d3.color(chrom.interpolateRdYlGn(this.variationScale(d.variation))));

		// Display details on mouseover
		newCircle.on('mouseover', (d, i) => {
			let data = this.data[this.currentYear];

			this.currentCountry = d.country;

			this.updateDetails(d.country, data[d.country].temperature, data[d.country].gdp, data[d.country].population, data[d.country].variation);
		});
	}

	updateDetails(country, temperature, gdp, population, variation) {
		d3.select(`#${this.detailsId} #country`).html(country);
		d3.select(`#${this.detailsId} #temp`).html(temperature.toFixed(1));
		d3.select(`#${this.detailsId} #gdp`).html(gdp.toFixed(3));
		d3.select(`#${this.detailsId} #pop`).html(population.toFixed(3));
		d3.select(`#${this.detailsId} #var`).html(variation.toFixed(2));
	}

	renderAxis() {
		// Define x axis
		let xAxis = d3.axisBottom()
						.scale(this.xScale);

		this.svg.append('g')
					.attr('class', 'x axis')
					.attr('transform', `translate(0, ${this.height})`)
					.call(xAxis);

		// Define y axis
		let yAxis = d3.axisLeft()
						.scale(this.yScale);

		this.svg.append('g')
					.attr('class', 'y axis')
					.call(yAxis);

		// Label axis
		this.svg.append('text')
				.attr('text-anchor', 'end')
				.attr('transform', `translate(${this.width}, ${this.height + MARGIN.bottom/2})`)
				.attr('class', 'label')
				.text(X_AXIS_LABEL);

		this.svg.append('text')
				.attr('text-anchor', 'end')
				.attr('transform', `translate(${-MARGIN.left/2}, 0)rotate(-90)`)
				.attr('class', 'label')
				.text(Y_AXIS_LABEL);
	}

	initSizable(outerWidth, outerHeight) {
		// Define width and height
		this.width = outerWidth - MARGIN.left - MARGIN.right;
		this.height = outerHeight - MARGIN.top - MARGIN.bottom;

		// Define container
		this.svg = d3.select(`#${this.id}`).append('svg')
						.attr('width', outerWidth)
						.attr('height', outerHeight)
						.append('g')
						.attr('transform', `translate(${MARGIN.left}, ${MARGIN.top})`);

		// xScale for GDP
		this.xScale = d3.scaleLog()
						.domain([this.metadata.minGDP, this.metadata.maxGDP])
						.range([0, this.width]);

		// yScale for temperatures
		this.yScale = d3.scaleLinear()
						.domain([this.metadata.minTemp, this.metadata.maxTemp])
						.range([this.height, 0]);

		// radiusScale for population
		this.radiusScale = d3.scaleLinear()
								.domain([this.metadata.minPop, this.metadata.maxPop])
								.range([MIN_RADIUS_WIDTH_RATIO * this.width, MAX_RADIUS_WIDTH_RATIO * this.width]);

		// Color scale for variation
		this.variationScale = d3.scaleLinear()
								.domain([0, LARGE_VARIATION])
								.range([1, 0]);
	}

	resize(outerWidth, outerHeight) {
		// Reinit size-dependend attributes
		this.initSizable(outerWidth, outerHeight);

		// Render chart
		this.renderAxis();
		this.renderBubbles(this.currentYear);
	}
}


export default function(id, detailsId, dataPath, width, height) {
	return new BubbleChart(id, detailsId, dataPath, width, height);
}
