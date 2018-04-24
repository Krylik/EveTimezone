var request = require('superagent');
var async = require('async');

function killSearch(options, pages, callback, progress) {
    // Adding option to select killboard.
    var urls = {
        'zkill': 'https://zkillboard.com/api/'
    }
    var url = urls[options['killboard']];
    delete options['killboard'];
    if (options['solar_systemID']) {
        options['solarSystemID'] = options['solar_systemID'];
        delete options['solar_systemID'];
    }

    Object.keys(options).forEach(function(key) {
        url += key.replace('_', '-') + '/';
        if (options[key] && options[key] !== true) {
            url += options[key] + '/';
        }
    });

    // For those unfamiliar with the totally awesome async module:
    // https://github.com/caolan/async#times
    var finished = 0;
    async.times(pages, function(n, next) {
        // Delay each request by (n - 1) * 2 seconds
        // i.e. the first request will be immediate
        // the next request will happen after 2 sec, next after 4 etc.
        // This is to prevent hammering the api too hard.
        setTimeout(function(){
            fetch(url + 'page/' + (n + 1) + '/')
            .then(function(response) {
                return response.json();
            })
            .then(function(j) {
                finished += 1;
                if (progress) {
                    progress(Math.round(finished / pages * 100));
                }
                return next(null, j);
            })
            .catch(function(e) {
                console.error(e);
            });
        }, (n - 1) * 500);
    }, function(err, data) {
        var concatData = [];
        data.forEach(function(set) {
            concatData = concatData.concat(set);
        })
        callback(err, concatData);
    });
}

module.exports = killSearch;
