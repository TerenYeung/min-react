
import hyphenateStyleName from '../../../renderers/dom/shared/hyphenateStyleName';
import dangerousStyleValue from '../shared/dangerousStyleValue';

var styleFloatAccessor = 'cssFloat';

function processStyleName(styleName) {
  return hyphenateStyleName(styleName);
}

/**
 * {
 *  border: '1px solid red',
 *  opacity: .5,
 *  color: 'rgba(24, 24, 24, .2)',
 * }
 */
var CSSPropertyOperations = {
  createMarkupForStyles(styles, component) {
    var serialized = '';

    for (var styleName in styles) {
      if (!styles.hasOwnProperty(styleName)) {
        continue;
      }

      var styleValue = styles[styleName];

      if (styleValue != null) {
        // 将 camelCase 转换为 kebaCase
        serialized += processStyleName(styleName) + ':';
        serialized += dangerousStyleValue(styleName, styleValue, component) + ';';
      }
    }

    return serialized || null;
  },
  setValueForStyles(node, styles, component) {
    var style = node.style;
    for (var styleName in styles) {
      if (!styles.hasOwnProperty(styleName)) {
        continue;
      }

      var styleValue = dangerousStyleValue(
        styleName,
        styles[styleName],
        component
      );

      if (styleName === 'float' || styleName === 'cssFloat') {
        styleName = styleFloatAccessor;
      }

      if (styleValue) {
        style[styleName] = styleValue;
      } else {
        style[styleName] = '';
      }
    }
  }
};

export default CSSPropertyOperations;

