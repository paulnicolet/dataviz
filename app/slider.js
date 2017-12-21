import * as d3 from 'd3';

require('./slider.scss');

const MARGIN = {top: 20, bottom: 20, left: 30, right: 30};

class Slider {
	constructor(id, minValue, maxValue, outerWidth, outerHeight) {
		this.id = id;
		this.minValue = minValue;
		this.maxValue = maxValue;
		this.lastLeft = null;
		this.lastRight = null;
		this.currentValue = minValue;
		this.handlers = [];

		// Initialize size dependent attributes
		this.initSizable(outerWidth, outerHeight);

		// Render elements
		this.renderAxis();
		this.renderSlider();
	}

	renderSlider() {
		// Define brush
		let brush = d3.brushX()
						.handleSize(1)
						.on('brush', () => this.brushed(this));

		// Define slider
		let slider = this.svg.append('g')
							.attr('class', 'slider')
							.call(brush);

		slider.selectAll('.selection,.handle').remove();

		// Append slider handle
		let handle = slider.append('g')
							.attr('id', 'slider-handle');

		handle.append('path')
				.attr('transform', `translate(0, ${this.height / 2})`)
				.attr('d', 'M 0 -15 V 15');

		handle.append('text')
				.attr('id', 'current-value')
				.attr('transform', `translate(-15, ${this.height / 2 - 20})`);
	}

	renderAxis() {
		let axis = d3.axisBottom()
						.scale(this.scale)
						.tickSize(0)
						.tickPadding(20)
						.tickFormat(d3.format(""))
						.tickValues([this.scale.domain()[0], this.scale.domain()[1]]);

		this.svg.append('g')
				.attr('class', 'x axis')
				.attr('transform', `translate(0, ${this.height / 2})`)
				.call(axis);
	}

	brushed(instance) {
		let handle = d3.select(`#${this.id} #slider-handle`);

		// Upon first event, or new click, reset points
		let isFirst = (this.lastLeft == null && this.lastRight == null);
		let isNewSelection = (d3.event.selection[0] != this.lastLeft && d3.event.selection[1] != this.lastRight);
		if (isFirst || isNewSelection) {
			this.lastLeft = d3.event.selection[0];
			this.lastRight = d3.event.selection[1];
			return;
		}

		// Infer with point of selection to take into account from last move
		let pos = 0;
		if (this.lastLeft == d3.event.selection[0]) {
			pos = d3.event.selection[1];
		} else {
			pos = d3.event.selection[0];
		}

		// Scale to get corresponding value
		let value = parseInt(this.scale.invert(pos));

		// Do not update anything if handle did not move enough
		if (value == this.currentValue) {
			return;
		}

		// Set new current value
		this.currentValue = value;

		// Clamp handle and translate
		pos = this.scale(value);
		handle.attr('transform', `translate(${pos}, 0)`);

		// Update text
		d3.select(`#${this.id} #current-value`).text(value);

		// Call handlers
		this.handlers.forEach(f => f(value));

		// Update current selection
		this.lastLeft = d3.event.selection[0];
		this.lastRight = d3.event.selection[1];
	}

	inc() {
		// Do not increment if already max value
		if (this.currentValue >= this.maxValue) {
			return;
		}

		// Increment slider value
		this.currentValue++;

		// Clamp handle and translate
		let pos = this.scale(this.currentValue);
		let handle = d3.select(`#${this.id} #slider-handle`);
		handle.attr('transform', `translate(${pos}, 0)`);

		// Update text
		d3.select(`#${this.id} #current-value`).text(this.currentValue);

		// Call handlers
		this.handlers.forEach(f => f(this.currentValue));
	}

	// Register handlers
	moved(handler) {
		this.handlers.push(handler);
	}

	resize(outerWidth, outerHeight) {
		this.initSizable(outerWidth, outerHeight);

		// Render elements
		this.renderAxis();
		this.renderSlider();
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

		// Define timescale
		this.scale = d3.scaleLinear()
						.domain([this.minValue, this.maxValue])
						.range([0, this.width])
						.clamp(true);
	}
}

export default function(id, minValue, maxValue, width, height) {
	return new Slider(id, minValue, maxValue, width, height);
}
