var entitySearch = require('./entitySearch');
var zkillSearch = require('./zkillSearch');
var moment = require('moment');
var Highcharts = require('Highcharts');
var $ = require('jquery');

/*
    I was going to use React for the various char/corp/alliance stuff and
    the charts and shit. And then I realised I was way too lazy to do that
    and just ended up using jQuery, because the other way would have been:
    -1 not enough jQuery.
*/

$('document').ready(function(){
    // On search:
    $('#entitySearchForm').on('submit', function(event) {
        // Prevent the page reload.
        event.preventDefault();
        // Get the type of entity we're looking for to pass through to zkill.
        // The eve entity search seems to treat these all the same.
        var entityType = $('#entityType').val();
        var entityName = $('#entityName').val();
        entitySearch(entityName, function(err, entity) {
            if (!err) {
                if (entity.characterID !== 0) {
                    /*
                        Setting the no-items and no-attackers results in a much
                        smaller payload returned from zkill.
                        Be nice to the 3rd party volunteers, people...
                        Bandwidth is not free.

                        Another side note: For alliances and corps, this simple approach
                        probably won't work so well, as you're going to have more
                        than 200 kills in a day, so you're not going to get a
                        proper representation of activity over a period.
                        I would probably need to implement some sort of range,
                        doing requests for all the requests in a day, for each
                        of the last 7 days. But I don't want to do too many
                        requests to zkill, so this will have to do.
                    */
                    var zkilloptions = {
                        no_items: true,
                        no_attackers: true,
                        limit: 200
                    };
                    zkilloptions[entityType + 'ID'] = entity.characterID;
                    zkillSearch(zkilloptions, function(err, kills) {
                        // Here we're going to normalize the kill time into hours
                        // We need to accumulate before we can normalize for
                        // highcharts.
                        var killTimes = {};
                        kills.forEach(function(kill) {
                            var hour = moment(kill.killTime).hour();
                            if (!killTimes[hour]) {
                                killTimes[hour] = 0;
                            }
                            killTimes[hour] += 1;
                        });
                        console.log(killTimes);
                        // The one thing i've found about highcharts, is that its
                        // axes stuff is kinda weird. It wants tuples. Go figure.
                        var highchartsTimes = [];
                        Object.keys(killTimes).forEach(function(key) {
                            highchartsTimes.push([key, killTimes[key]]);
                        });

                        var chart = new Highcharts.Chart({
                            chart: {
                                type: 'area',
                                renderTo: 'chart'
                            },
                            title: {
                                text: 'Kills and Deaths per hour'
                            },
                            xAxis: {
                                allowDecimals: false
                            },
                            yAxis: {
                                title: {
                                    text: 'Kills per hour'
                                }
                            },
                            plotOptions: {
                                area: {
                                    pointStart: 0
                                }
                            },
                            series: [{
                                name: entityName,
                                data: highchartsTimes
                            }]
                        });
                    });
                } else {
                    console.log("No entity with that name found in Eve");
                }
            } else {
                console.log(err);
            }
        });
    });
});
