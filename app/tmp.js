import * as d3 from 'd3';
import * as c3 from 'c3';
import * as reg from 'regression';
import * as topojson from 'topojson';

require('./country_time_series.scss');
require('./c3.css');


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

        var self = this;

        this.initChart();

        setTimeout(() => {
            this.addCountryTemp('Europe', self);
        }, 1000);


        setTimeout(function() {
            self.addCountryTemp('Asia', self);
        }, 2000);



        var button = document.getElementById('button2');
        button.addEventListener('click', function() {
            self.chart.unload(self.displayedCountry);
        });

        var button1 = document.getElementById('button1');
        button1.addEventListener('click', function() {

            self.displayedCountry.push('World');
            var columns = [];

            var xs = {};
            var types = {};
            var colors = {};


            var endWord = '_0mean';
            for (var i = 0; i < self.displayedCountry.length; i++) {

                var countryName = self.displayedCountry[i] + endWord;
                var countryDatesName = 'dates_' + countryName;
                var regCountryName = 'Reg_' + countryName;

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


            self.displayedData.push('World');
            self.displayedData.push('Reg_World');

            self.chart.load({
                xs: xs,
                types: types,
                colors: colors,
                columns: columns,
                unload: self.displayedData,
            });
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

    initChart() {

        var worldData = this.dataGlobal.World;

        var dates = [];
        dates.push('dates_World');
        var val = [];
        val.push('World');
        var fin = [];
        fin.push('Reg_World');

        this.computeCountryPointsAndAxisAndReg(worldData, val, dates, fin);

        var ch = c3.generate({
            bindto: `#${this.id}`,
            data: {
                x: 'dates_World',
                columns: [
                    dates,
                    val,
                    fin,
                ],
                types: {
                    World: 'scatter',
                    Reg_World: 'spline'
                },
                colors: {
                    World: '#ff0000',
                    Reg_World: '#ff0000',

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

        this.chart = ch;

    }

    addCountryTemp(countryName, self) {

        var countryData = self.dataCountry[countryName];
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

        var color = self.getRandomColor();
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

    getRandomColor() {
        var letters = '0123456789ABCDEF';
        var color = '#';
        for (var i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
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