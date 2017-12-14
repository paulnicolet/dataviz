import * as d3 from 'd3';

const MIN_RADIUS_WIDTH_RATIO = 1/200;
const MAX_RADIUS_WIDTH_RATIO = 1/25;
const MARGIN = {top: 20, right: 20, bottom: 20, left: 50};

const MOTION_DURATION = 1000;

class BubbleChart {
	constructor(id, detailsId, dataPath, outerWidth, outerHeight) {
		this.id = id;
		this.detailsId = detailsId;
		this.dataPath = dataPath;
		this.width = outerWidth - MARGIN.left - MARGIN.right;
		this.height = outerHeight - MARGIN.top - MARGIN.bottom;

		// Define container
		this.svg = d3.select(`#${this.id}`).append('svg')
						.attr('width', outerWidth)
						.attr('height', outerHeight)
						.append('g')
						.attr('transform', `translate(${MARGIN.left}, ${MARGIN.top})`);

		// Init chart
		this.init();
	}

	init() {
		// Create scales

		// xScale for GDP
		this.xScale = d3.scaleLog()
						.domain([100, 150000])
						.range([0, this.width]);

		// yScale for temperatures
		this.yScale = d3.scaleLinear()
						.domain([-10, 40])
						.range([this.height, 0]);

		// radiusScale for population
		this.radiusScale = d3.scaleLinear()
								.domain([0, 600000])
								.range([MIN_RADIUS_WIDTH_RATIO * this.width, MAX_RADIUS_WIDTH_RATIO * this.width]);

		// TODO temperature variation scale for color
		// Convert to color using chromatic (see map.js)

		d3.json(this.dataPath, (error, data) => {
			if (error) window.alert('Could not load bubble data');

			self.data = data;

			// Render chart
			this.renderAxis();
			this.renderBubbles(1976);
		});
	}

	animateBubbles(year) {
		self.currentYear = year;
		let data = self.data[year];

		this.updateDetails(self.currentCountry, data[self.currentCountry].temperature, data[self.currentCountry].gdp, data[self.currentCountry].population, data[self.currentCountry].variation);

		d3.selectAll('.bubble')
			.transition()
			.duration(MOTION_DURATION)
			.attr('cx', d => this.xScale(data[d.country].gdp))
			.attr('cy', d => this.yScale(data[d.country].temperature))
			.attr('r', d => this.radiusScale(data[d.country].population))
			.style("fill", () => `hsl(${Math.random() * 360},100%,50%)`);
	}

	renderBubbles(year) {
		self.currentYear = year;
		let data = Object.values(self.data[year]);

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
							.style("fill", () => `hsl(${Math.random() * 360}, 100%, 50%)`);

		newCircle.on('mouseover', (d, i) => {
			let data = self.data[self.currentYear];

			self.currentCountry = d.country;

			this.updateDetails(d.country, data[d.country].temperature, data[d.country].gdp, data[d.country].population, data[d.country].variation);
		});
	}

	updateDetails(country, temperature, gdp, population, variation) {
		d3.select(`#${this.detailsId} #country`).html(country);
		d3.select(`#${this.detailsId} #temp`).html(temperature.toFixed(1));
		d3.select(`#${this.detailsId} #gdp`).html(gdp.toFixed(3));
		d3.select(`#${this.detailsId} #pop`).html(population.toFixed(3));
		d3.select(`#${this.detailsId} #var`).html(variation);
	}

	renderAxis() {
		let xAxis = d3.axisBottom()
						.scale(this.xScale);

		this.svg.append('g')
					.attr('class', 'x axis')
					.attr('transform', `translate(0, ${this.height})`)
					.call(xAxis);


		let yAxis = d3.axisLeft()
						.scale(this.yScale);

		this.svg.append('g')
					.attr('class', 'y axis')
					.call(yAxis);
	}

	resize(outerWidth, outerHeight) {
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
						.domain([100, 150000])
						.range([0, this.width]);

		// yScale for temperatures
		this.yScale = d3.scaleLinear()
						.domain([-10, 40])
						.range([this.height, 0]);

		// radiusScale for population
		this.radiusScale = d3.scaleLinear()
								.domain([0, 600000])
								.range([MIN_RADIUS_WIDTH_RATIO * this.width, MAX_RADIUS_WIDTH_RATIO * this.width]);

		// Render chart
		this.renderAxis();
		this.renderBubbles(1976);
	}
}


export default function(id, detailsId, dataPath, width, height) {
	return new BubbleChart(id, detailsId, dataPath, width, height);
}
