var getCreditCount = require('../');
var test = require('tape');
var isFunction = require('lodash.isfunction');

test('exports a function', function(t) {
  t.plan(1);
  t.ok(isFunction(getCreditCount));
});

test('works', function(t) {
  var FIXTURES = [
    ['Credits: 3', '3'],
    ['Credits: 3.', '3'],
    ['Credits: 1 to 3.', '1 to 3'],
    ['Credits: 3; Prereq: COP 3530.', '3']
  ];

  t.plan(FIXTURES.length);

  FIXTURES.forEach(function(f) {
    t.equal(getCreditCount(f[0]), f[1]);
  });
});