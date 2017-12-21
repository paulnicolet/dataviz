import 'materialize-css';

const APPARITION_DURATION = 2000;
const APPARITION_HEIGHT_RATIO = 1/4;

$(document).ready(function(){
    // Scrollfire to make section appearing as scrolling
    var options = [
        {
            selector: '#time-series-section', 
            offset: $('#time-series-section').height() * APPARITION_HEIGHT_RATIO, 
            callback: function(el) {
                $('#time-series-section').fadeTo(APPARITION_DURATION, 1);
            } 
        },

        {
            selector: '#map-section', 
            offset: $('#map-section').height() * APPARITION_HEIGHT_RATIO, 
            callback: function(el) {
                $('#map-section').fadeTo(APPARITION_DURATION, 1);
            } 
        },

        {
            selector: '#bubble-section', 
            offset: $('#bubble-section').height() * APPARITION_HEIGHT_RATIO, 
            callback: function(el) {
                $('#bubble-section').fadeTo(APPARITION_DURATION, 1);
            } 
        },
    ];

    Materialize.scrollFire(options);
});