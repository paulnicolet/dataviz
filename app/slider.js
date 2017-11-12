import * as d3 from 'd3';

require('./slider.scss');

class Slider {
	constructor(id, minDate, maxDate, outerWidth, outerHeight) {
		this.id = id;
		this.minDate = minDate;
		this.maxDate = maxDate;
		this.width = outerWidth;
		this.height = outerHeight;

		// Define container
		this.svg = d3.select(`#${id}`).append('svg')
						.attr('width', this.width)
						.attr('height', this.height);


		// Define timescale
		this.format = d3.timeFormat('%Y');
		this.scale = d3.scaleTime()
						.domain([this.minDate, this.maxDate])
						.range([0, this.width])
						.clamp(true);

		// Define event handlers
		this.handlers = [];

		// Render elements
		this.renderAxis();
		this.renderSlider();
	}

	renderSlider() {
		// Define brush
		let brush = d3.brushX()
						.handleSize(1)
						.on('brush', () => this.brushed(this));

		let slider = this.svg.append('g')
							.attr('class', 'slider')
							.call(brush);

		slider.selectAll('.selection,.handle').remove();

		let handle = slider.append('g')
							.attr('id', 'slider-handle');

		handle.append('path')
				.attr('transform', `translate(0, ${this.height / 2})`)
				.attr('d', 'M 0 -10 V 10');

		handle.append('text')
				.attr('transform', `translate(0, ${this.height / 2 - 20})`)
				.text(this.format(this.minDate));
	}

	renderAxis() {
		let axis = d3.axisBottom()
						.scale(this.scale)
						.tickFormat(t => this.format(t))
						.tickSize(0)
						.tickPadding(12)
						.tickValues([this.scale.domain()[0], this.scale.domain()[1]]);

		this.svg.append('g')
				.attr('class', 'x axis')
				.attr('transform', `translate(0, ${this.height / 2})`)
				.call(axis);
	}

	brushed(instance) {
		let handle = d3.select('#slider-handle');
		let lastLeft = handle.attr('lastLeft');
		let lastRight = handle.attr('lastRight');

		if (lastLeft != null && lastRight != null) {
			let newX = 0;
			if (lastLeft == d3.event.selection[0]) {
				newX = d3.event.selection[1];
			} else {
				newX = d3.event.selection[0];
			}

			// Scale to get corresponding year
			let year = new Date(this.scale.invert(newX).getFullYear().toString());

			// Clamp handle and translate
			newX = this.scale(year);
			handle.attr('transform', `translate(${newX}, 0)`);

			// Call handlers
			// TODO only if current year changed
			this.handlers.forEach(f => f(year));
		}

		handle.attr('lastLeft', d3.event.selection[0])
				.attr('lastRight', d3.event.selection[1]);
	}

	// Register handlers
	moved(handler) {
		this.handlers.push(handler);
	}
}

export default function(id, minDate, maxDate, width, height) {
	return new Slider(id, minDate, maxDate, width, height);
}
