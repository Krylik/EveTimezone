var $ = require('jquery');

var permalink = {
    get: function(key) {
        var rawParams = window.location.search.substring(1).split('&');
        var params = {};
        rawParams.forEach(function(param) {
            var tuple = param.split('=');
            if (tuple[0] != "") {
                params[decodeURIComponent(tuple[0])] = tuple.length > 1 ? decodeURIComponent(tuple[1]) : true;
            }
        });
        if (!key) {
            return params;
        } else {
            return params[key];
        }
    },

    set: function(key, value) {
        var params = this.get();
        params[key] = value;
        var newQueryString = $.param(params);
        history.pushState({}, '', window.location.pathname + '?' + newQueryString);
    }
};

module.exports = permalink;
