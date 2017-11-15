import * as d3 from 'd3';

require('./slider.scss');

const MARGIN = 20;

class Slider {
	constructor(id, minDate, maxDate, outerWidth, outerHeight) {
		this.id = id;
		this.minDate = minDate;
		this.maxDate = maxDate;
		this.width = outerWidth;
		this.sliderWidth = this.width - 2 * MARGIN;
		this.height = outerHeight;

		// Define container
		this.svg = d3.select(`#${id}`).append('svg')
						.attr('width', this.width)
						.attr('height', this.height);

		// Define timescale
		this.format = d3.timeFormat('%Y');
		this.scale = d3.scaleTime()
						.domain([this.minDate, this.maxDate])
						.range([0, this.sliderWidth])
						.clamp(true);

		// Define movement related fields
		this.lastLeft = null;
		this.lastRight = null;
		this.currentYear = null;
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
							.attr('transform', `translate(${MARGIN}, 0)`)
							.call(brush);

		slider.selectAll('.selection,.handle').remove();

		let handle = slider.append('g')
							.attr('id', 'slider-handle');

		handle.append('path')
				.attr('transform', `translate(0, ${this.height / 2})`)
				.attr('d', 'M 0 -10 V 10');
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
				.attr('transform', `translate(${MARGIN}, ${this.height / 2})`)
				.call(axis);
	}

	brushed(instance) {
		let handle = d3.select('#slider-handle');

		// Upon first event, only get selection coordinates
		if (this.lastLeft == null && this.lastRight == null) {
			this.lastLeft = d3.event.selection[0];
			this.lastRight = d3.event.selection[1];
			return;
		}

		let pos = 0;
		if (this.lastLeft == d3.event.selection[0]) {
			pos = d3.event.selection[1];
		} else {
			pos = d3.event.selection[0];
		}

		// Scale to get corresponding year
		let year = this.scale.invert(pos).getFullYear().toString();

		// Do not update anything if handle did not move enough
		if (year == this.currentYear) {
			return;
		}
		this.currentYear = year;

		// Clamp handle and translate
		pos = this.scale(new Date(year));
		handle.attr('transform', `translate(${pos}, 0)`);

		// Call handlers
		this.handlers.forEach(f => f(year));

		// Update current selection
		this.lastLeft = d3.event.selection[0];
		this.lastRight = d3.event.selection[1];
	}

	// Register handlers
	moved(handler) {
		this.handlers.push(handler);
	}
}

export default function(id, minDate, maxDate, width, height) {
	return new Slider(id, minDate, maxDate, width, height);
}
