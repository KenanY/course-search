# get-credit-count

Extract credit count from catalog text.

## Example

``` javascript
var getCreditCount = require('get-credit-count');

getCreditCount('Credits: 1.');
// => '1'
```

## API

``` javascript
var get-credit-count = require('get-credit-count');
```

### `getCreditCount(str)`

Returns credit count from _String_ `str` as a _String_.