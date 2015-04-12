var request = require('superagent');
var Base64 = require('base64-url');

var ImgurUpload = {
    upload: function(dataUri, name, title, callback) {
        request
        .post('https://api.imgur.com/3/upload.json')
        .set('Authorization', 'Client-ID ad09ebae2079daa')
        .send({
            type: 'base64',
            name:  name + '.png',
            title: title,
            description: 'Made using EveTimezone http://miningop.com/evetimezone/',
            image: Base64.encode(dataUri)
        })
        .end(function(res){
            if (res.ok) {
                callback(null, res.body.data);
            } else {
                callback(res.text);
            }
        })
    }
}

module.exports = ImgurUpload;
//
// function share(){
//     $.ajax({
//         url: 'https://api.imgur.com/3/upload.json',
//         type: 'POST',
//         headers: {
//             Authorization: 'Client-ID ad09ebae2079daa'
//         },
//         data: {
//             type: 'base64',
//             name:  name + '.png',
//             title: title,
//             description: 'Made using EveTimezone http://miningop.com/evetimezone/',
//             image: dataUri
//         },
//         dataType: 'json'
//     }).success(function(data) {
//         var url = 'http://imgur.com/' + data.data.id + '?tags';
//         callback(null, data.data);
//     }).error(function(err) {
//         callback
//     });
// }
