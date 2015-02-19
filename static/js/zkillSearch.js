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

function zkillSearch(options, callback) {
    var url = 'https://zkillboard.com/api/';
    Object.keys(options).forEach(function(key) {
        url += key.replace('_', '-') + '/';
        if (options[key] && options[key] !== true) {
            url += options[key] + '/';
        }
    });

    request
    .get(url)
    .accept('application/json')
    // Luckily superagent deals with compression for us :)
    .end(function(res) {
        if (res.ok) {
            callback(null, res.body);
        } else {
            callback(res.text);
        }
    });
}

module.exports = zkillSearch;
