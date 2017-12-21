# Data Visualisation Project

## About

This project has been developed in the Data Visualization (COM-480) context at EPFL. 

The main goal is to leverage world temperature data in order to highlight the global warming phenomena, using simple and user-friendly visualizations.

## Getting started

1. Install [Node.js](https://nodejs.org/en/)
2. Install dependencies: `npm install`
3. Start development server: `npm start`

To build the production version to `/docs`:

1. `npm run build`
2. `npm run deploy`

Boilerplate from: [kikohs/d3-es6-boilerplate](https://github.com/kikohs/d3-es6-boilerplate). 

## Project structure

<pre>
.
├── CHANGELOG.md
├── README.md
├── app                                 Visualisation source code
│   ├── bubbles.js
│   ├── country_time_series.js
│   ├── country_time_series.scss
│   ├── css
│   ├── data
│   ├── fonts
│   ├── img
│   ├── index.html
│   ├── layout.js
│   ├── main.js
│   ├── main.scss
│   ├── map.js
│   ├── map.scss
│   ├── slider.js
│   └── slider.scss
├── build                               Compiled project
├── data                                Original raw data
├── docs                                GitHub pages folder                    
├── node_modules                        Dependencies
├── package-lock.json
├── package.json
├── processing                          Pre-processing scripts
├── webpack.config.js
└── webpack.production.config.js
</pre>