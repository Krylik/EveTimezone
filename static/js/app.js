var entitySearch = require('./entitySearch');
var zkillSearch = require('./zkillSearch');
var permalink = require('./permalink');
var moment = require('moment');
var chart = require('./chart');
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
    // This is a little hacky, and I should probably do something better with it
    // Set up values from permalink
    var name = permalink.get('name');
    if (name) {
        $('#entityName').val(name);
    }
    var type = permalink.get('type');
    if (type) {
        $('#entityType').val(type);
    }
    // Autosearch if both are set
    if (name && type) {
        search();
    }
    // On search:
    $('#entitySearchForm').on('submit', search);

    // Main search function
    function search(event) {
        // Prevent the page reload.
        if (event) {
            event.preventDefault();
        }
        // Switch search icon to working icon.
        $('#entitySearchForm button i').removeClass('fa-search').addClass('fa-gears');
        $('#entitySearchForm button').text('Working...');
        // Get the type of entity we're looking for to pass through to zkill.
        // The eve entity search seems to treat these all the same.
        var entityType = $('#entityType').val();
        var entityName = $('#entityName').val();
        // Set url using pushState for permalink
        permalink.set('name', entityName);
        permalink.set('type', entityType);
        // Search
        entitySearch(entityName, function(err, entity) {
            if (!err) {
                if (entity.characterID != 0) {
                    /*
                        Setting the no-items and no-attackers results in a much
                        smaller payload returned from zkill.
                        Be nice to the 3rd party volunteers, people...
                        Bandwidth is not free.

                        I have put in a "high-accuracy" mode, which will make 6
                        requests to zKill, each for 200 kills/deaths. This means
                        that it will fetch the last 1200 for an entity, which
                        should be enough to generate a proper representation.
                        This mode should be used sparingly, as you can only make
                        one of these per minute before hitting the request limit
                        for zKill's api.
                    */
                    var zkilloptions = {
                        no_items: true,
                        no_attackers: true,
                        limit: 200
                    };
                    zkilloptions[entityType + 'ID'] = entity.characterID;
                    // I'm not actually sure what the w-space modifier does, but it's there.
                    if ($('#wSpace').is(':checked')) {
                        zkilloptions['w_space'] = true;
                    }
                    var requestCount = 1;
                    if ($('#highAccuracy').is(':checked')) {
                        requestCount = 6;
                    }
                    zkillSearch(zkilloptions, requestCount, function(err, kills) {
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
                        // Make chart.
                        chart(entityName, highchartsTimes);
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
    }
});
