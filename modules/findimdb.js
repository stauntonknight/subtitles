var OS = require('opensubtitles-api');
var _ = require('underscore');
var exit = require('exit');
var winston = require('winston');
var program = require('commander');

program.version('1')
    .option('-n, --name <required>', 'Name - should be a text');
program.parse(process.argv);

var IMDBClient = function() {
  var OpenSubtitles = new OS('OSTestUserAgent');
  this.searchByName = function(nameSubText) {
    getClient().then(function(res) {
      OpenSubtitles.api.SearchSubtitles(res.token, [{
        query: nameSubText
      }], {limit: 5} ).then(function(res) {
        if (res['status'] != '200 OK') {
          winston.log('error', 'Not found');
          return;
        }
        var data = res['data'];
        var map = _.groupBy(data, function(movie) {
          return movie['IDMovieImdb'];
        });
        winston.log('info', _.keys(map));
      }).catch(function(err) {
        winston.log('error', err);
      });
    }).catch(function(err) {
      winston.log('error', 'No login' + err);
    });
  };

  // TODO: Move this to a library and share it.
  var getClient = function() {
    return OpenSubtitles.api.LogIn('progfool', '', 'en', 'OSTestUserAgent');
  };
};

new IMDBClient().searchByName(program.name);
