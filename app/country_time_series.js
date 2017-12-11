import * as d3 from 'd3';
import * as c3 from 'c3';
import * as reg from 'regression';
import 'materialize-css';

require('./country_time_series.scss');
require('./css/c3.css');

class CountryTimeSeries {
    constructor(id, dataCountry, dataGlobal, width, height) {

        this.id = id;
        this.dataCountry = dataCountry;
        this.dataGlobal = dataGlobal;
        this.width = width;
        this.height = height;

        this.displayedCountry = [];
        this.displayedData = []
        this.chart = null;

        this.zeroMeanButton = document.getElementById('zeroMean');
        this.resetCountryButton = document.getElementById('resetCountry');

        var self = this;

        this.initChart();

        this.initAutocomplete();

        this.resetCountryButton.addEventListener('click', () => {
            this.chart.unload({
                ids: this.displayedData,
                done: () => {
                    this.displayedCountry = []
                    this.displayedData = []

                    this.addCountryTemp('World', self);

                    this.zeroMeanButton.disabled = false;
                }
            });

        });

        this.zeroMeanButton.addEventListener('click', () => {

            this.zeroMeanButton.disabled = true;
            this.resetCountryButton.disabled = true;

            var toUnload = this.displayedData.slice()
            toUnload.push('World');
            toUnload.push('Reg_World');

            self.displayedCountry.push('World');
            this.displayedData = []
            var columns = [];

            var xs = {};
            var types = {};
            var colors = {};


            var endWord = '_0mean';
            for (var i = 0; i < self.displayedCountry.length; i++) {

                var countryName = self.displayedCountry[i] + endWord;
                var countryDatesName = 'dates_' + countryName;
                var regCountryName = 'Reg_' + countryName;

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

                var countryData = null;
                if (self.displayedCountry[i] == 'World') {
                    countryData = self.dataGlobal.World;
                } else {
                    countryData = self.dataCountry[self.displayedCountry[i]];
                }

                countryData = self.zeroMeansData(countryData);

                self.computeCountryPointsAndAxisAndReg(countryData, val, dates, fin);

                self.prepareDataAttributes(self, countryName, countryDatesName, regCountryName, xs, types, colors);
            }

            self.chart.load({
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
        for (var i = 0; i < countryData.length; i++) {
            var tmp = countryData[i].split("_");
            dates.push(tmp[0]);
            val.push(tmp[1]);

            mean += parseFloat(tmp[1]);
        }

        mean /= countryData.length;

        for (var i = 0; i < countryData.length; i++) {
            result.push(dates[i] + "_" + (val[i] - mean).toString());
        }

        return result;
    }

    resetGraphData() {

        var worldData = this.dataGlobal.World;

        var dates = [];
        dates.push('dates_World');
        var val = [];
        val.push('World');
        var fin = [];
        fin.push('Reg_World');

        this.displayedData.push('dates_World');
        this.displayedData.push('World');
        this.displayedData.push('Reg_World');

        this.computeCountryPointsAndAxisAndReg(worldData, val, dates, fin);

        return [dates, val, fin];
    }

    initChart() {

        var worldColor = this.getRandomColor('World');

        this.chart = c3.generate({
            bindto: `#${this.id}`,
            data: {
                x: 'dates_World',
                columns: this.resetGraphData(),
                types: {
                    World: 'scatter',
                    Reg_World: 'spline'
                },
                colors: {
                    World: worldColor,
                    Reg_World: worldColor,

                },
            },
            point: {
                show: false,
            },
            axis: {
                x: {
                    type: 'timeseries',
                    tick: {
                        format: '%Y-%m-%d'
                    }
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
        $('input.autocomplete').autocomplete({
            data: {
                "Apple": 'bob',
                "Microsoft": 'ada',
                "Google": 'https://placehold.it/250x250'
            },
            limit: 20, // The max amount of results that can be shown at once. Default: Infinity.
            onAutocomplete: function(val) {
                console.log(val)
            },
            minLength: 1, // The minimum length of the input for the autocomplete to start. Default: 1.
        });
    }

    addCountryTemp(countryName, self) {

        var countryData = null;
        if (countryName == 'World') {
            countryData = self.dataGlobal.World;
        } else {
            countryData = self.dataCountry[countryName];
        }
        var countryDatesName = 'dates_' + countryName;
        var regCountryName = 'Reg_' + countryName;

        var dates = [];
        dates.push(countryDatesName);
        var val = [];
        val.push(countryName);
        var fin = [];
        fin.push(regCountryName);

        self.computeCountryPointsAndAxisAndReg(countryData, val, dates, fin);

        var xs = {};
        var types = {};
        var colors = {};

        self.prepareDataAttributes(self, countryName, countryDatesName, regCountryName, xs, types, colors);

        self.loadData(self, countryName, countryDatesName, regCountryName, val, dates, fin, xs, types, colors);
    }

    computeCountryPointsAndAxisAndReg(countryData, countryPoints, countryDates, regCountryLine) {

        var datas = [];

        for (var i = 0; i < countryData.length; i++) {
            var tmp = countryData[i].split("_");
            countryDates.push(tmp[0]);
            countryPoints.push(tmp[1]);

            if (tmp[1] != 'nan') {
                datas.push([i, parseFloat(tmp[1])]);
            }
        }

        var cc = reg.polynomial(datas, {
            order: 2,
            precision: 10
        });

        for (var i = 0; i < cc.points.length; i++) {
            regCountryLine.push(cc.points[i][1]);
        }
    }

    prepareDataAttributes(self, countryName, countryDatesName, regCountryName, xs, types, colors) {

        xs[countryName] = countryDatesName;

        types[countryName] = 'scatter';
        types[regCountryName] = 'spline';

        var color = self.getRandomColor(countryName);
        colors[countryName] = color;
        colors[regCountryName] = color;
    }

    loadData(self, countryName, countryDatesName, regCountryName, countryPoints, countryDates, regCountryLine, xs, types, colors) {



        self.chart.load({
            xs: xs,
            columns: [
                countryDates,
                countryPoints,
                regCountryLine,
            ],
            types: types,
            colors: colors,
        });

        self.displayedCountry.push(countryName);
        self.displayedData.push(countryName);
        self.displayedData.push(countryDatesName);
        self.displayedData.push(regCountryName);
    }

    getRandomColor(countryName) {

        var tmp = countryName.split('_')

        var seed = 0;
        for (var i = 0, len = tmp[0].length; i < len; i++) {
            seed += tmp[0].charAt(i).charCodeAt(0);
        }

        console.log(seed)

        var letters = '0123456789ABCDEF';
        var color = '#';
        for (var i = 0; i < 6; i++) {
            color += letters[((i + 1) * seed) % 16];
        }

        console.log(color)

        return color;
    }
}

export default function(id, dataCountryPath, dataGlobalPath, width, height) {
    d3.json(dataCountryPath, (errorCountry, dataCountry) => {
        if (errorCountry) {
            window.alert('Could not load country_temperature data');
        }

        d3.json(dataGlobalPath, (errorGlobal, dataGlobal) => {
            if (errorGlobal) {
                window.alert('Could not load global_temperature data');
            }

            return new CountryTimeSeries(id, dataCountry, dataGlobal, width, height);

        })
    })
}
