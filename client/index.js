var document = require('global/document');
var value = require('observ');
var struct = require('observ-struct');
var Delegator = require('dom-delegator');
var mainLoop = require('main-loop');
var h = require('virtual-dom/virtual-hyperscript');
var sendChange = require('value-event/change');
var find = require('lodash.find');
var diff = require('virtual-dom/vtree/diff');
var patch = require('virtual-dom/vdom/patch');
var create = require('virtual-dom/vdom/create-element');
var extend = require('xtend');
var sortBy = require('lodash.sortby');

var courses = require('./catalog');

function channels(funcs, context) {
  return Object.keys(funcs).reduce(createHandle, {});

  function createHandle(acc, name) {
    var handle = Delegator.allocateHandle(funcs[name].bind(null, context));
    acc[name] = handle;
    return acc;
  }
}

function mercury(obj) {
  var copy = extend(obj);
  var copyChannels = copy.channels;
  var copyHandles = copy.handles;

  if (copyChannels) {
    copy.channels = value(null);
  }
  else if (copyHandles) {
    copy.handles = value(null);
  }

  var observ = struct(copy);

  if (copyChannels) {
    observ.channels.set(channels(copyChannels, observ));
  }
  else if (copyHandles) {
    observ.handles.set(channels(copyHandles, observ));
  }

  return observ;
}

function change(state, data) {
  console.log('change');
  state.query.set(data.query);
}

var state = mercury({
  query: value(''),
  channels: {
    change: change
  }
});

Delegator();

var loop = mainLoop(state(), render, {
  diff: diff,
  create: create,
  patch: patch
});

document.body.appendChild(loop.target);
state(loop.update);

function prerequisites(course) {
  var preqs = course.prerequisites;
  if (preqs) {
    var r = preqs.match(/[A-Z]{3}[0-9]{4}C*/g);
    console.log(r);
    if (r) {
      var c = find(courses, {'code': r[0]});
      console.log(c);
      if (c) {
        return h('li', [
          'Prerequisites: ' +
          preqs.substring(0, preqs.indexOf(r)),
          h('abbr', {
            title: c.name
          }, r),
          preqs.substring(preqs.indexOf(r[0]) + r[0].length + 1)
        ]);
      }
    }
    return h('li', 'Prerequisites: ' + course.prerequisites);
  }
  return null;
}

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

  results = sortBy(results, 'code');

  var ret = [];

  var inputField = h('input', {
    type: 'search',
    name: 'query',
    value: String(state.query),
    'ev-event': sendChange(state.channels.change),
    autofocus: true
  });

  results.forEach(function(course) {
    ret.push(h('li', [
      h('h3', [
        h('span.code', course.code),
        h('span', ' ' + course.name)
      ]),
      h('ul.props', [
        h('li', 'Credits: ' + course.credits),
        prerequisites(course)
      ]),
      h('p', course.description)
    ]));
  });

  return h('div', [
    inputField,
    h('ul.results', ret)
  ]);
}
