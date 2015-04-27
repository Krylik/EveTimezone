var moment = require('moment');
var Highcharts = require('Highcharts');
// This is included but not used, to force it to be browserified.
var HighchartsTheme = require('HighchartsTheme');

function drawChart(name, killboard, intervalsPerHour, data, callback) {
    var chart = new Highcharts.Chart({
        chart: {
            type: 'areaspline',
            renderTo: 'chart'
        },
        title: {
            text: 'Kills and Deaths (Combined) from ' + killboard
        },
        xAxis: {
            allowDecimals: true,
            labels: {
                formatter: function () {
                    if (this.value % 1 === 0) {
                        return (this.value < 10 ? '0' + this.value : this.value) + ':00';
                    }
                    return '';
                }
            },
            title: {
                text: 'Time of day'
            },
            plotBands: [
                // EU TZ
                {
                    from: 17,
                    to: 24,
                    color: 'rgba(59, 174, 209, 0.2)',
                    label: {
                        text: 'EU TZ',
                        style: {
                            color: '#ffffff',
                            fontWeight: 'bold'
                        },
                        y: 30
                    }
                },
                {
                    from: 0,
                    to: 2,
                    color: 'rgba(59, 174, 209, 0.2)'
                },
                // US TZ
                {
                    from: 0,
                    to: 8,
                    color: 'rgba(211, 60, 60, 0.2)',
                    label: {
                        text: 'US TZ',
                        style: {
                            color: '#ffffff',
                            fontWeight: 'bold'
                        },
                        y: 30
                    }
                },
                {
                    from: 22,
                    to: 24,
                    color: 'rgba(211, 60, 60, 0.2)'
                },
                // AU TZ
                {
                    from: 6,
                    to: 13,
                    color: 'rgba(194, 212, 60, 0.2)',
                    label: {
                        text: 'AU TZ',
                        style: {
                            color: '#ffffff',
                            fontWeight: 'bold'
                        },
                        y: 30
                    }
                }
            ],
            plotLines: [{
                color: '#bf3c30',
                width: 2,
                value: parseFloat(moment().utc().hour() + (moment().utc().minute() / 60)),
                label: {
                    text: 'Now',
                    rotation: 0,
                    style: {
                        color: '#ffffff',
                        fontWeight: 'bold'
                    }
                }
            }]
        },
        yAxis: {
            title: {
                text: 'Kills per ' + Math.round(60 / intervalsPerHour, 0) + ' minutes'
            }
        },
        plotOptions: {
            area: {
                pointStart: 0
            }
        },
        series: [{
            name: name,
            data: data
        }]
    }, callback);
}

module.exports = drawChart;
