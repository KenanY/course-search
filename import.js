var hyperquest = require('hyperquest');
var cheerio = require('cheerio');
var path = require('path');
var writeFileAtomicSync = require('write-file-atomic').sync;
var getCreditCount = require('@course-search/get-credit-count');
var concat = require('concat-stream');
var eol = require('os').EOL;

var url = 'https://catalog.ufl.edu/ugrad/current/courses/descriptions/'
          + process.argv[2] + '.aspx';

hyperquest(url).pipe(concat(function(data) {
  var $ = cheerio.load(data);

  var childs = $('div.ms-rte-layoutszone-inner').children();

  childs.each(function(index) {
    if ($(this).hasClass('crsTITLE')) {
      var credits = $(childs[index + 1]).text();
      var description = childs[index + 2];
      var course = {};
      course.code = $('a', $(this)).attr('name');
      course.name = $(this).text();
      course.name = course.name.slice(course.name.indexOf(course.code)
                                      + course.code.length
                                      + 1);
      course.code = course.code.replace(/ /g, '');

      course.credits = credits;

      course.credits = getCreditCount(credits);
      course.credits = course.credits.length === 1
        ? parseInt(course.credits, 10)
        : course.credits;

      course.description = $(description).text();

      var file = path.join(__dirname, 'client/catalog/', process.argv[2]);
      file = path.join(file, course.code.toLowerCase() + '.json');

      writeFileAtomicSync(file, JSON.stringify(course, null, '  ') + eol);
    }
  });
}));
