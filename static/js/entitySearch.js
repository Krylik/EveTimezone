var request = require('superagent');
var $ = require('jquery');

function EntitySearch(entityType, entityName, callback) {
    var searchUrl = 'https://esi.tech.ccp.is/v2/search/';

    fetch('https://esi.tech.ccp.is/dev/search/?' + $.param({
        categories: entityType,
        search: entityName,
        strict: true
    }))
    .then(function(response) {
        return response.json();
    })
    .then(function(j) {
        if (j[entityType].length > 0) {
            callback(null, j[entityType][0]);
        } else {
            callback("No entity with that name found in Eve");
        }
    })
    .catch(function(err) {
        callback("An error occurred while searching the Eve api for that entity name");
    })
}

module.exports = EntitySearch;
