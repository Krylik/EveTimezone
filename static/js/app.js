var entitySearch = require('./entitySearch');
var zkillSearch = require('./zkillSearch');
var moment = require('moment');
var Highcharts = require('Highcharts');
// This is included but not used, to force it to be browserified.
var HighchartsTheme = require('HighchartsTheme');
var $ = require('jquery');

/*
    I was going to use React for the various char/corp/alliance stuff and
    the charts and shit. And then I realised I was way too lazy to do that
    and just ended up using jQuery, because the other way would have been:
    -1 not enough jQuery.
*/

// Delete the stupid protocol relative font thats inserted by highcharts.
$('head link[href="//fonts.googleapis.com/css?family=Unica+One"]').remove();

$('document').ready(function(){
    // On search:
    $('#entitySearchForm').on('submit', function(event) {
        // Prevent the page reload.
        event.preventDefault();
        // Switch search icon to working icon.
        $('#entitySearchForm button i').removeClass('fa-search').addClass('fa-gears');
        // Get the type of entity we're looking for to pass through to zkill.
        // The eve entity search seems to treat these all the same.
        var entityType = $('#entityType').val();
        var entityName = $('#entityName').val();
        entitySearch(entityName, function(err, entity) {
            if (!err) {
                if (entity.characterID != 0) {
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
                        doing requests for all the kills in a day, for each
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
                        // Switch working icon to search icon.
                        $('#entitySearchForm button i').removeClass('fa-gears').addClass('fa-search');
                        // Here we're going to normalize the kill time into hours
                        // We need to accumulate before we can normalize for
                        // highcharts.
                        var killTimes = {};
                        // We have to seed this with all the hours, otherwise
                        // highcharts just makes shit up for the hours that arent
                        // in the data.
                        for (var i = 0; i < 24; i++) {
                            killTimes[i] = 0;
                        }
                        kills.forEach(function(kill) {
                            var hour = moment(kill.killTime).hour();
                            killTimes[hour] += 1;
                        });
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
                                allowDecimals: false,
                                labels: {
                                    formatter: function () {
                                        return (this.value < 10 ? '0' + this.value : this.value) + ':00';
                                    }
                                }
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
                    $('#entitySearchForm button i').removeClass('fa-gears').addClass('fa-search');
                }
            } else {
                console.log(err);
                $('#entitySearchForm button i').removeClass('fa-gears').addClass('fa-search');
            }
        });
    });
});
