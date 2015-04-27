var moment = require('moment');
var Highcharts = require('Highcharts');
// This is included but not used, to force it to be browserified.
var HighchartsTheme = require('HighchartsTheme');

function drawChart(name, killboard, intervalsPerHour, data, callback) {
    var chart = new Highcharts.Chart({
        chart: {
            renderTo: 'chart',
            zoomType: 'xy',
            height: 600
        },
        title: {
            text: 'Kills and Deaths from ' + killboard
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
        yAxis: [
            {
                title: {
                    text: 'Kills/Deaths'
                },
                labels: {
                    format: '{value}',
                }
            },
            {
                title: {
                    text: 'ISK Killed/Lost'
                },
                labels: {
                    format: '{value}M',
                    formatter: function() { return this.value.toFixed(0); }
                },
                opposite: true,
                min: 0,
                maxPadding: 0.01,
            }
        ],
        plotOptions: {
            area: {
                pointStart: 0,
                fillOpacity: 0.4
            }
        },
        series: [
            {
                name: name + ' Kills',
                type: 'areaspline',
                color: '#32956e',
                yaxis: 0,
                data: data.kills.numbers,
                tooltip: {
                    headerFormat: '<span style="font-size: 10px">Hour: {point.key}</span><br/>',
                    pointFormat: '{series.name}: <b>{point.y}</b><br/>',
                    valueSuffix: ' kills'
                }
            },
            {
                name: name + ' Deaths',
                type: 'areaspline',
                color: '#cd4a4a',
                yaxis: 0,
                data: data.deaths.numbers,
                tooltip: {
                    headerFormat: '<span style="font-size: 10px">Hour: {point.key}</span><br/>',
                    pointFormat: '{series.name}: <b>{point.y}</b><br/>',
                    valueSuffix: ' kills'
                }
            },
            {
                name: name + ' ISK Killed',
                type: 'spline',
                yAxis: 1,
                color: '#029857',
                data: data.kills.values,
                pointStart: 0,
                tooltip: {
                    headerFormat: '<span style="font-size: 10px">Hour: {point.key}</span><br/>',
                    pointFormat: '{series.name}: <b>{point.y}</b><br/>',
                    valueSuffix: 'M ISK',
                    valueDecimals: 0
                }
            },
            {
                name: name + ' ISK Lost',
                type: 'spline',
                yAxis: 1,
                color: '#ce1515',
                data: data.deaths.values,
                pointStart: 0,
                tooltip: {
                    headerFormat: '<span style="font-size: 10px">Hour: {point.key}</span><br/>',
                    pointFormat: '{series.name}: <b>{point.y}</b><br/>',
                    valueSuffix: 'M ISK',
                    valueDecimals: 0
                }
            }
        ]
    }, callback);
}

module.exports = drawChart;
