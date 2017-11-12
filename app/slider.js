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

		// Render elements
		this.renderAxis();
		this.renderSlider();
	}

	renderSlider() {
		// TODO error here on brushing
		let brush = d3.brushX()
					.on('brush', () => console.log('BRUSHED'));

		let slider = this.svg.append('g')
							.attr('class', 'slider')
							.call(brush);

		let handle = slider.append('g')
							.attr('class', 'slider-handle');

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
}

export default function(id, minDate, maxDate, width, height) {
	return new Slider(id, minDate, maxDate, width, height);
}
