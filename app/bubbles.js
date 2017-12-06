import * as d3 from 'd3';

const MIN_RADIUS = 5;
const MAX_RADIUS = 20;
const MARGIN = {top: 20, right: 20, bottom: 20, left: 50};

class BubbleChart {
	constructor(id, outerWidth, outerHeight) {
		this.id = id;
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
						.domain([0, 150000])
						.range([0, this.width]);

		// yScale for temperatures
		this.yScale = d3.scaleLinear()
						.domain([-30, 30])
						.range([this.height, 0]);

		// radiusScale for population
		this.radiusScale = d3.scaleLinear()
								.domain([0, 600000000])
								.range([MIN_RADIUS, MAX_RADIUS]);

		// TODO temperature variation scale for color
		// Convert to color using chromatic (see map.js)

		// Render chart
		this.renderAxis();
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
}


export default function(id, width, height) {
	return new BubbleChart(id, width, height);
}
