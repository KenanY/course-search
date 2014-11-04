var document = require('global/document');
var value = require('observ');
var struct = require('observ-struct');
var Delegator = require('dom-delegator');
var mainLoop = require('main-loop');
var h = require('virtual-hyperscript');
var MultipleEvent = require('geval/multiple');
var changeEvent = require('value-event/change');

var courses = require('./catalog');

var state = struct({
  query: value(''),
  events: MultipleEvent(['change'])
});

state.events.change(function(data) {
  state.query.set(data.query);
});

Delegator();
var loop = mainLoop(state(), render);
document.body.appendChild(loop.target);
state(loop.update);

function render(state) {

  // Filter out courses which do not contain the search query
  //
  // Instead of filtering out courses that do not contain the search query
  // verbatim, it is more appropriate to split the query into keywords, and
  // proceed to remove courses that do not contain every keyword.
  var results = courses.filter(function(course) {
    var valid = true;
    state.query.toLowerCase().split(' ').forEach(function(keyword) {
      if (valid) {
        valid = course.name.toLowerCase().indexOf(keyword) >= 0
                || course.code.toLowerCase().indexOf(keyword) >= 0
                || course.description.toLowerCase().indexOf(keyword) >= 0;
      }
    });
    return valid;
  });

  var ret = [];

  var inputField = h('input', {
    type: 'search',
    name: 'query',
    value: String(state.query),
    'ev-event': changeEvent(state.events.change),
    autofocus: true
  });

  results.forEach(function(course) {
    ret.push(h('li', [
      h('h3', [
        h('span.code', course.code),
        h('span', ' ' + course.name)
      ]),
      h('ul.props', [
        h('li', 'Credits: ' + course.credits)
      ]),
      h('p', course.description)
    ]));
  });

  return h('div', [
    inputField,
    h('ul.results', ret)
  ]);
}