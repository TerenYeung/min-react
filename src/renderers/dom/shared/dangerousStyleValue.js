import CSSProperty from '../../../renderers/dom/shared/CSSProperty';

var isUnitlessNumber = CSSProperty.isUnitlessNumber;

function dangerousStyleValue(name, value, component) {
  var isEmpty = value == null || typeof value === 'boolean' || value === '';
  if (isEmpty) return '';

  var isNonNumeric = isNaN(value);
  // 将数值型样式值转换为字符串
  if (isNonNumeric || value === 0 || isUnitlessNumber.hasOwnProperty(name) && isUnitlessNumber[name]) {
    return '' + value;
  }

  if (typeof value === 'string') {
    value = value.trim();
  }

  // ?
  return value + 'px';
}

export default dangerousStyleValue;
