var fs = require('graceful-fs');
var path = require('path');

var folder = path.resolve(__dirname, 'client/catalog/' + process.argv[2]);

var files = fs.readdirSync(folder);

console.log('module.exports = [');

files.forEach(function(file) {
  console.log('  require(\'./' + file.substring(0, file.indexOf('.json')) + '\'),');
});

console.log('];');
