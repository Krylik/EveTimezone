/*
    I was going to add a bunch of the supported options into this thing,
    but due to how zkill uses its params (as path strings instead of query
    params... kinda weird, but ok.) I'm actually not going to bother. I'm
    only going to implement what I need to get this particular tool working,
    by making a little conversion thingie for an options object. It just
    converts keys and values into the url (which seems to work ok for now).

    If someone else wants to use this thing, and wants me to make an actual
    npm module for it and flesh it out a bit with some validation etc, drop me a
    mail somewhere.
*/

var request = require('superagent');
var async = require('async');

function zkillSearch(options, pages, callback) {
    var url = 'https://zkillboard.com/api/';
    Object.keys(options).forEach(function(key) {
        url += key.replace('_', '-') + '/';
        if (options[key] && options[key] !== true) {
            url += options[key] + '/';
        }
    });

    // For those unfamiliar with the totally awesome async module:
    // https://github.com/caolan/async#times
    async.times(pages, function(n, next) {
        // Delay each request by (n - 1) * 2 seconds
        // i.e. the first request will be immediate
        // the next request will happen after 2 sec, next after 4 etc.
        // This is to prevent hammering the api too hard.
        setTimeout(function(){
            request
            // n starts at 0
            .get(url + 'page/' + (n + 1) + '/')
            // Luckily superagent deals with compression for us :)
            .end(function(res) {
                if (res.ok) {
                    next(null, res.body);
                } else {
                    next(res.text);
                }
            });
        }, (n - 1) * 2000);
    }, function(err, data) {
        var concatData = [];
        data.forEach(function(set) {
            concatData = concatData.concat(set);
        })
        callback(err, concatData);
    });
}

module.exports = zkillSearch;
