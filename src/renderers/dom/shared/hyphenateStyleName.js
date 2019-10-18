var msPattern = /^ms-/;
var _uppercasePattern = /([A-Z])/g;
function hyphenate(string) {
  return string.replace(_uppercasePattern, '-$1').toLowerCase();
}
function hyphenateStyleName(string) {
  return hyphenate(string).replace(msPattern, '-ms-');
}

export default hyphenateStyleName;
