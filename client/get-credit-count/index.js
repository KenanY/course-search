function getCreditCount(str) {
  var start = 9;
  var end = str.indexOf(';');
  if (end > 14 || end < 0) {
    end = str.indexOf('.');
    if (end < 0) {
      end = str.length;
    }
  }
  return str.substring(start, end);
}

module.exports = getCreditCount;