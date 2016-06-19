var OS = require('opensubtitles-api');
var _ = require('underscore');
var download = require('download');
var program = require('commander');
var fs = require('fs');
var exit = require('exit');

var OpenSubtitles = new OS('OSTestUserAgent');
program.version('1')
    .option('-i, --imdb <required>', 'Imdb id - should be a number', parseInt);
program.parse(process.argv);
var imdbid = program.imdb;
if (!imdbid) {
  console.log('IMDB id is mandatory and should be a number');
  exit(1);
}
console.log('Looking for ' + imdbid);

OpenSubtitles.api.LogIn('progfool', '', 'en', 'OSTestUserAgent')
    .then(function(res){
      OpenSubtitles.api.SearchSubtitles(res.token, [{
        // Search the server.
        'imdbid': imdbid,
        'sublanguageid': 'eng'
      }]).then(function(res) {
        if (res['status'] == '200 OK') {
          // Restrict to the one which has only one CD.
          var list = _.filter(res['data'], function(item) {
            return item['SubSumCD'] == '1';
          });
          // Sort by download count and pick the most popular.
          list = _.sortBy(list, function(item) {
            return parseInt(item['SubDownloadsCnt'] || 0);
          }).reverse();
          if (list.length > 0) {
            var link = list[0]['SubDownloadLink'];
            var movieName = list[0]['MovieName'];
            console.log('Movie :  ' + movieName);
            var location = 'subtitles/' + movieName.replace(/ /g, '_') + '.gz';
            console.log('Saving in ' + location); 
            download(link).then(function(data) {
              // Finally save it in the subtitles folder.
              fs.writeFileSync(location, data);
            }).catch(function(err) {
              console.log(err);
            });
          } else {
            console.log('No element in list');
          }
        }
      }).catch(function(err) {
        console.log(err);
      });
    })
    .catch(function(err){
      console.log(err);
    });
