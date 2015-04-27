var request = require('superagent');
var async = require('async');

function killSearch(options, pages, callback) {
    // Adding option to select killboard.
    var urls = {
        'zkill': 'https://zkillboard.com/api/',
        'eve-kill': 'https://beta.eve-kill.net/api/combined/'
    }
    var url = urls[options['killboard']];
    delete options['killboard'];
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

module.exports = killSearch;
