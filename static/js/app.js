var entitySearch = require('./entitySearch');
var zkillSearch = require('./zkillSearch');
var permalink = require('./permalink');
var moment = require('moment');
// var svg2png = require('Svg2Png');
var chart = require('./chart');
// var imgur = require('./imgurUpload');
var $ = require('jquery');

/*
    I was going to use React for the various char/corp/alliance stuff and
    the charts and shit. And then I realised I was way too lazy to do that
    and just ended up using jQuery, because the other way would have been:
    -1 not enough jQuery.
*/

// Delete the stupid protocol relative font thats inserted by highcharts.
$('head link[href="//fonts.googleapis.com/css?family=Unica+One"]').remove();

// Set up events, and load values from query params.
$('document').ready(function(){
    // Helper functions
    // Show the working message and changing the icon
    function setWorking(isWorking) {
        if (isWorking) {
            $('#searchButton i').removeClass('fa-search').addClass('fa-gear').addClass('fa-spin');
            $('#searchButton span').text('Working...');
        } else {
            $('#searchButton i').removeClass('fa-gear').removeClass('fa-spin').addClass('fa-search');
            $('#searchButton span').text('Search');
        }
    }

    // Showing the error message when something goes wrong.
    function showError(error) {
        $('#error span').text(error);
        $('#error').show(200, function(){
            setTimeout(function(){
                $('#error').hide(200);
            }, 5000);
        });
    }
    // For the close button on the error panel
    $('#error i').on('click', function(event){
        $('#error').hide(200);
    });

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
    // On Imgur Upload
    // $('#imgurUpload').on('click', function(){
    //     console.log('Clickeed');
    //     svg2png.saveSvgAsPng($('div.highcharts-container svg')[0], entityId, {}, function(uri) {
    //         console.log(uri);
    //         imgur.upload(uri, entityId, name, function(err, data){
    //             console.log(data);
    //         });
    //     });
    // });
    // On search:
    $('#entitySearchForm').on('submit', search);

    // Main search function
    var entityId;
    function search(event) {
        // Prevent the page reload.
        if (event) {
            event.preventDefault();
        }
        // Switch search icon to working icon.
        setWorking(true);
        // Get the type of entity we're looking for to pass through to zkill.
        // The eve entity search seems to treat these all the same.
        type = $('#entityType').val();
        name = $('#entityName').val();
        // Set url using pushState for permalink
        permalink.set('name', name);
        permalink.set('type', type);
        // Search
        entitySearch(name, function(err, entity) {
            if (!err) {
                entityId = entity.characterID;
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
                    zkilloptions[type + 'ID'] = entity.characterID;
                    // I'm not actually sure what the w-space modifier does, but it's there.
                    if ($('#wSpace').is(':checked')) {
                        zkilloptions['w_space'] = true;
                    }
                    var requestCount = 1;
                    if ($('#highAccuracy').is(':checked')) {
                        requestCount = 6;
                    }
                    zkillSearch(zkilloptions, requestCount, function(err, kills) {
                        setWorking(false);
                        if (!err) {
                            // Here we're going to normalize the kill time into hours
                            // We need to accumulate before we can normalize for
                            // highcharts.
                            var killTimes = {};
                            // We have to seed this with all the hours, otherwise
                            // highcharts just makes shit up for the hours that arent
                            // in the data.
                            for (var i = 0; i < 25; i++) {
                                killTimes[i] = 0;
                            }
                            var spikeyness = 2; // intervals per hour
                            kills.forEach(function(kill) {
                                var hour = moment(kill.killTime).hour();
                                // We're going to cut the minutes into (60/spikeyness) min increments.
                                var min = moment(kill.killTime).minute();
                                var minInterval = Math.round((min / 60 * 100) / (100 / spikeyness)) * (1 / spikeyness); // I want it in n^-spikeyness, so .25 not 25
                                // Initialize the interval if it doesnt exist.
                                if (!killTimes[hour + minInterval]) {
                                    killTimes[hour + minInterval] = 0;
                                }
                                killTimes[hour + minInterval] += 1;
                            });
                            // The one thing i've found about highcharts, is that its
                            // axes stuff is kinda weird. It wants tuples sorted by first element. Go figure.
                            var highchartsTimes = [];
                            var intervals = Object.keys(killTimes).map(function(i){
                                return parseFloat(i);
                            }).sort(function(a, b) {
                                // Oh Javascript. Sorting floats by default,
                                // still puts 10 before 2.
                                if (a < b) {
                                    return -1;
                                } else if (a > b) {
                                    return 1;
                                } else {
                                    return 0;
                                }
                            });

                            intervals.forEach(function(key) {
                                highchartsTimes.push([key, killTimes["" + key]]);
                            });

                            if ($('#chart').children().length > 0) {
                                $('#chart').clone().removeAttr('id').prependTo('#history');
                            }
                            // Make chart.
                            chart(name, spikeyness, highchartsTimes, function(chart) {
                                // Embed logo or face because i can :)
                                var typeUpcase = type.replace(/\b[a-z]/g, function(letter) {
                                    return letter.toUpperCase();
                                });
                                var imgUrl = typeUpcase + '/' + entity.characterID + '_32';
                                // For fuck sake :CCPlease:
                                // Alliance and corps are png, characters are jpg.
                                imgUrl += type == 'character' ? '.jpg' : '.png';
                                var imgX = chart.legend.group.translateX - 30;
                                var imgY = chart.legend.group.translateY - 3;
                                imgUrl = 'https://image.eveonline.com/' + imgUrl;
                                // I have noticed that this image doesnt move on a resize.
                                // I may end up removing it, but I'll leave it for now.
                                // Yep, i'll have to remove it when i finally add imgur upload
                                // because it taints the image source.
                                chart.renderer.image(imgUrl, imgX, imgY, 32, 32).add();
                                // Enable Upload to Imgur
                                // $('#imgurUpload').removeClass('pure-button-disabled').removeAttr('disabled');
                            });
                        } else {
                            showError(err);
                        }
                    });
                } else {
                    showError("No entity with that name found in Eve");
                    setWorking(false);
                }
            } else {
                showError("An error occurred while searching the Eve api for that entity name");
                setWorking(false);
            }
        });
    }
});
