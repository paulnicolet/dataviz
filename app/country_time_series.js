import * as d3 from 'd3';
import * as c3 from 'c3';
import * as reg from 'regression';
import 'materialize-css';

require('./country_time_series.scss');
require('./css/c3.css');

class CountryTimeSeries {
    constructor(id, dataCountry, startDate) {

        this.id = id;
        this.dataCountry = dataCountry;
        this.startDate = startDate;

        // current state of the time series
        this.displayedCountry = [];
        this.displayedData = []
        this.chart = null;

        // html object linked to this javascript class
        this.zeroMeanButton = document.getElementById('zeroMean');
        this.resetCountryButton = document.getElementById('resetCountry');
        this.autocompleteID = "time-series-input";
        this.autocompleteInput = document.getElementById(this.autocompleteID);

        this.initChart();

        this.initAutocomplete();

        this.linkResetButton();

        this.linkZeroMeanButton();
    }

    linkResetButton() {
        this.resetCountryButton.addEventListener('click', () => {

            // block interaction until work is done
            this.zeroMeanButton.disabled = true;
            this.resetCountryButton.disabled = true;
            this.autocompleteInput.disabled = true;

            this.chart.unload({
                // unload current displayed data
                ids: this.displayedData,
                done: () => {

                    // reset the time series
                    this.displayedCountry = [];
                    this.displayedData = [];

                    this.addCountryTemp('World');
                }
            });
        });
    }

    linkZeroMeanButton() {
        this.zeroMeanButton.addEventListener('click', () => {

            // block interaction until work is done
            this.zeroMeanButton.disabled = true;
            this.resetCountryButton.disabled = true;
            this.autocompleteInput.disabled = true;

            // copy the data to unload
            var toUnload = this.displayedData.slice();

            // reset the graph data to show
            this.displayedData = [];
            var columns = [];

            // the parameter we will link to the new data
            var xs = {};
            var types = {};
            var colors = {};

            // for each displayed country, do its 0-mean
            for (var i = 0; i < this.displayedCountry.length; i++) {

                var countryName = this.displayedCountry[i];
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

                // zero mean the data
                var countryData = this.zeroMeansData(this.dataCountry[this.displayedCountry[i]]);

                // prepare the data for the graph
                this.computeCountryPointsAndAxisAndReg(countryData, val, dates, fin);

                // prepare the attribute for the data for the graph
                this.prepareDataAttributes(countryName, countryDatesName, regCountryName, xs, types, colors);
            }

            this.chart.load({
                xs: xs,
                types: types,
                colors: colors,
                columns: columns,
                // don't forget to unload current data
                unload: toUnload,
                done: () => {
                    // when work is done, only allow a reset interaction
                    this.resetCountryButton.disabled = false;
                }
            });
        });
    }

    zeroMeansData(countryData) {

        var result = [];

        var val = []
        var dates = []

        var mean = 0.0;
        var notNull = 0;
        // gather data to compute the mean
        for (var i = 0; i < countryData.length; i++) {
            dates.push(this.startDate + i);
            val.push(countryData[i]);

            // obvioulsy, we only want correct data
            if (countryData[i] != null) {
                mean += countryData[i];
                notNull++;
            }
        }

        mean /= notNull;

        // minus the mean for every data
        for (var i = 0; i < countryData.length; i++) {
            if (val[i] != null) {
                result.push(val[i] - mean);
            } else {
                result.push(null);
            }
        }

        return result;
    }

    resetGraphData() {

        // at reset state, only world data are displayed
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

        // creation of the object chart
        this.chart = c3.generate({
            bindto: `#${this.id}`,
            data: {
                x: 'dates World',
                columns: this.resetGraphData(),
                // scatter for the data point, spline for the regression
                types: {
                    World: 'scatter',
                    Reg_World: 'spline'
                },
                colors: {
                    "World": worldColor,
                    "Regression World": worldColor,
                },
            },
            // don't display point for the spline
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
                    label: {
                        text: 'Year',
                        position: 'outer'
                    }
                },
                y: {
                    tick: {
                        count: 10,
                        format: (d) => {
                            return d.toFixed(1);
                        }
                    },
                    label: {
                        text: 'Temperature (°C)',
                        position: 'outer'
                    }

                }
            },
            // 1 sec transition for every animation
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

        // creation of the data to autocomplete
        var countries = {}
        Object.keys(this.dataCountry).forEach((entry) => {
            countries[entry] = null;
        })
        countries['World'] = null;

        // initialization of the autocomplete process
        $("#" + this.autocompleteID).autocomplete({
            data: countries,
            limit: 20,
            onAutocomplete: (val) => {
                if ($.inArray(val, this.displayedCountry) == -1) {
                    this.addCountryTemp(val);
                    $("#" + this.autocompleteID).val('');
                }
            },
            minLength: 2,
        });
    }

    addCountryTemp(countryName) {

        // desactivate interaction during the process of adding a country to the time series
        this.zeroMeanButton.disabled = true;
        this.resetCountryButton.disabled = true;
        this.autocompleteInput.disabled = true;

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

        // compute the data we want to the graphic (the points + the regression)
        this.computeCountryPointsAndAxisAndReg(countryData, val, dates, fin);

        var xs = {};
        var types = {};
        var colors = {};

        // prepare the attribute for this data
        this.prepareDataAttributes(countryName, countryDatesName, regCountryName, xs, types, colors);

        // load the data
        this.loadData(countryName, countryDatesName, regCountryName, val, dates, fin, xs, types, colors);
    }

    computeCountryPointsAndAxisAndReg(countryData, countryPoints, countryDates, regCountryLine) {

        var datas = [];

        // take every correct point to compute a nice linear regression
        for (var i = 0; i < countryData.length; i++) {
            countryDates.push(this.startDate + i);
            countryPoints.push(countryData[i]);

            if (countryData[i] != null) {
                datas.push([(this.startDate + i), countryData[i]]);
            }
        }  

        // regression of order 2 
        var cc = reg.polynomial(datas, {
            order: 2,
            precision: 10
        });

        // compute the point for each year with the regression
        for (var i = 0; i < countryData.length; i++) {
            regCountryLine.push(cc.predict(this.startDate + i)[1]);
        }
    }

    prepareDataAttributes(countryName, countryDatesName, regCountryName, xs, types, colors) {

        // tell who is scatter who is spline and which color to give
        xs[countryName] = countryDatesName;

        types[countryName] = 'scatter';
        types[regCountryName] = 'spline';

        var color = this.getRandomColor(countryName);
        colors[countryName] = color;
        colors[regCountryName] = color;
    }

    loadData(countryName, countryDatesName, regCountryName, countryPoints, countryDates, regCountryLine, xs, types, colors) {

        // load new data
        this.chart.load({
            xs: xs,
            columns: [
                countryDates,
                countryPoints,
                regCountryLine,
            ],
            types: types,
            colors: colors,
            done: () => {
                // allow interaction again when work is done
                this.zeroMeanButton.disabled = false;
                this.resetCountryButton.disabled = false;
                this.autocompleteInput.disabled = false;
            }
        });

        // add the country to the currently displayed one
        this.displayedCountry.push(countryName);
        this.displayedData.push(countryName);
        this.displayedData.push(countryDatesName);
        this.displayedData.push(regCountryName);
    }

    getRandomColor(countryName) {

        // generate a fix 'random' color for each country
        // using the country name
        var tmp = countryName.split('_');

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

export default function(id, dataCountryPath, startDate) {
    d3.json(dataCountryPath, (errorCountry, dataCountry) => {
        if (errorCountry) {
            window.alert('Could not load country_temperature data: ' + errorCountry);
        }

        return new CountryTimeSeries(id, dataCountry, startDate);
    })
}