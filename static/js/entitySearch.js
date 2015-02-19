var request = require('superagent');
var parseString = require('xml2js').parseString

function EntitySearch(entityNames, callback) {
    var searchUrl = 'https://api.eveonline.com/eve/CharacterID.xml.aspx';

    request
    .get(searchUrl)
    .query({names: entityNames})
    .end(function(res) {
        if (res.ok) {
            parseString(res.text, function(err, result) {
                if (err) {
                    callback(err);
                } else {
                    var entity = result.eveapi.result[0].rowset[0].row[0].$;
                    callback(null, entity);
                }
            });
        } else {
            callback(res.text);
        }
    });
}

module.exports = EntitySearch;
