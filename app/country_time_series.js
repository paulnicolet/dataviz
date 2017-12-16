import * as d3 from 'd3';
import * as c3 from 'c3';
import * as reg from 'regression';
import 'materialize-css';

require('./country_time_series.scss');
require('./css/c3.css');

class CountryTimeSeries {
    constructor(id, dataCountry, width, height) {

        this.id = id;
        this.dataCountry = dataCountry;
        this.width = width;
        this.height = height;

        this.displayedCountry = [];
        this.displayedData = []
        this.chart = null;

        this.zeroMeanButton = document.getElementById('zeroMean');
        this.resetCountryButton = document.getElementById('resetCountry');
        this.autocompleteID = "time-series-input";

        this.initChart();

        this.initAutocomplete();

        this.linkResetButton();

        this.linkZeroMeanButton();
    }

    linkResetButton() {
        this.resetCountryButton.addEventListener('click', () => {

            this.zeroMeanButton.disabled = true;
            this.resetCountryButton.disabled = true;

            this.chart.unload({
                ids: this.displayedData,
                done: () => {
                    this.displayedCountry = [];
                    this.displayedData = [];

                    this.addCountryTemp('World');

                    this.zeroMeanButton.disabled = false;
                    this.resetCountryButton.disabled = false;
                }
            });

        });
    }

    linkZeroMeanButton() {
        this.zeroMeanButton.addEventListener('click', () => {

            this.zeroMeanButton.disabled = true;
            this.resetCountryButton.disabled = true;

            var toUnload = this.displayedData.slice();

            this.displayedData = [];
            var columns = [];

            var xs = {};
            var types = {};
            var colors = {};


            var endWord = '';//' 0mean';
            for (var i = 0; i < this.displayedCountry.length; i++) {

                var countryName = this.displayedCountry[i] + endWord;
                var countryDatesName = 'dates ' + countryName;
                var regCountryName = 'Regression ' + countryName;

                this.displayedData.push(countryName);
                this.displayedData.push(countryDatesName);
                this.displayedData.push(regCountryName);

                var dates = [];
                dates.push(countryDatesName);
                var val = [];
                val.push(countryName);
                var fin = [];
                fin.push(regCountryName);

                columns.push(dates);
                columns.push(val);
                columns.push(fin);

                console.log(this.displayedCountry[i])

                console.log(this.dataCountry[this.displayedCountry[i]])

                var countryData = this.zeroMeansData(this.dataCountry[this.displayedCountry[i]]);

                console.log(countryData)

                this.computeCountryPointsAndAxisAndReg(countryData, val, dates, fin);

                this.prepareDataAttributes(countryName, countryDatesName, regCountryName, xs, types, colors);
            }

            this.chart.load({
                xs: xs,
                types: types,
                colors: colors,
                columns: columns,
                unload: toUnload,
            });

            this.resetCountryButton.disabled = false;
        });
    }

    zeroMeansData(countryData) {

        var result = [];

        var val = []
        var dates = []

        var mean = 0.0;
        var notNull = 0;
        for (var i = 0; i < countryData.length; i++) {
            dates.push(1850 + i);
            val.push(countryData[i]);

            if(countryData[i] != null) {
                mean += countryData[i];
                notNull++;
            }
        }

        mean /= notNull;

        for (var i = 0; i < countryData.length; i++) {
            if(val[i] != null) {
                result.push(val[i] - mean);
            } else {
                result.push(null);
            }
        }

        return result;
    }

    resetGraphData() {

        var worldData = this.dataCountry.World;

        var dates = [];
        dates.push('dates World');
        var val = [];
        val.push('World');
        var fin = [];
        fin.push('Regression World');

        this.displayedCountry.push('World');
        this.displayedData.push('dates World');
        this.displayedData.push('World');
        this.displayedData.push('Regression World');

        this.computeCountryPointsAndAxisAndReg(worldData, val, dates, fin);

        return [dates, val, fin];
    }

    initChart() {

        var worldColor = this.getRandomColor('World');

        this.chart = c3.generate({
            bindto: `#${this.id}`,
            data: {
                x: 'dates World',
                columns: this.resetGraphData(),
                types: {
                    World: 'scatter',
                    Reg_World: 'spline'
                },
                colors: {
                    "World": worldColor,
                    "Regression World": worldColor,

                },
            },
            point: {
                show: false,
            },
            axis: {
                x: {
                    tick: {
                        count: 20,
                        format: (d) => {
                            return d.toFixed(0);
                        }
                    },
                },
                y: {
                    tick: {
                        count: 10,
                        format: (d) => {
                            return d.toFixed(1);
                        }
                    },

                }
            },
            transition: {
                duration: 1000
            }
            /*
            interaction: {
                enabled: false
            }
            */
        });
    }

    initAutocomplete() {

        var countries = {}
        Object.keys(this.dataCountry).forEach((entry) => {
            countries[entry] = null;
        })
        countries['World'] = null;

        $("#" + this.autocompleteID).autocomplete({
            data: countries,
            limit: 20, // The max amount of results that can be shown at once. Default: Infinity.
            onAutocomplete: (val) => {
                if ($.inArray(val, this.displayedCountry) == -1) {
                    this.addCountryTemp(val);
                    $("#" + this.autocompleteID).val('');
                }
            },
            minLength: 2, // The minimum length of the input for the autocomplete to start. Default: 1.
        });
    }

    addCountryTemp(countryName) {

        var countryData = null;
        countryData = this.dataCountry[countryName];

        var countryDatesName = 'dates ' + countryName;
        var regCountryName = 'Regression ' + countryName;

        var dates = [];
        dates.push(countryDatesName);
        var val = [];
        val.push(countryName);
        var fin = [];
        fin.push(regCountryName);

        this.computeCountryPointsAndAxisAndReg(countryData, val, dates, fin);

        var xs = {};
        var types = {};
        var colors = {};

        this.prepareDataAttributes(countryName, countryDatesName, regCountryName, xs, types, colors);

        this.loadData(countryName, countryDatesName, regCountryName, val, dates, fin, xs, types, colors);
    }

    computeCountryPointsAndAxisAndReg(countryData, countryPoints, countryDates, regCountryLine) {

        var datas = [];

        for (var i = 0; i < countryData.length; i++) {
            countryDates.push(1850 + i);
            countryPoints.push(countryData[i]);

            if (countryData[i] != null) {
                datas.push([(1850 + i), countryData[i]]);
            }
        }

        var cc = reg.polynomial(datas, {
            order: 2,
            precision: 10
        });

        for (var i = 0; i < countryData.length; i++) {
            regCountryLine.push(cc.predict(1850 + i)[1]);
        }
    }

    prepareDataAttributes(countryName, countryDatesName, regCountryName, xs, types, colors) {

        xs[countryName] = countryDatesName;

        types[countryName] = 'scatter';
        types[regCountryName] = 'spline';

        var color = this.getRandomColor(countryName);
        colors[countryName] = color;
        colors[regCountryName] = color;
    }

    loadData(countryName, countryDatesName, regCountryName, countryPoints, countryDates, regCountryLine, xs, types, colors) {

        this.chart.load({
            xs: xs,
            columns: [
                countryDates,
                countryPoints,
                regCountryLine,
            ],
            types: types,
            colors: colors,
        });

        this.displayedCountry.push(countryName);
        this.displayedData.push(countryName);
        this.displayedData.push(countryDatesName);
        this.displayedData.push(regCountryName);
    }

    getRandomColor(countryName) {

        var tmp = countryName.split('_')

        var seed = 0;
        for (var i = 0, len = tmp[0].length; i < len; i++) {
            seed += tmp[0].charAt(i).charCodeAt(0);
        }

        var letters = '0123456789ABCDEF';
        var color = '#';
        for (var i = 0; i < 6; i++) {
            color += letters[((i + 1) * (seed + 1 + i)) % 16];
        }

        return color;
    }
}

export default function(id, dataCountryPath, width, height) {
    d3.json(dataCountryPath, (errorCountry, dataCountry) => {
        if (errorCountry) {
            window.alert('Could not load country_temperature data: ' + errorCountry);
        }

        return new CountryTimeSeries(id, dataCountry, width, height);
    })
}