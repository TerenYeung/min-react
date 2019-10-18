import DOMProperty from '../../../renderers/dom/shared/DOMProperty';
import quoteAttributeValueForBrowser from '../shared/quoteAttributeValueForBrowser';

function shouldIgnoreValue(propertyInfo, value) {
  return value == null ||
    (propertyInfo.hasBooleanValue && !value) ||
    (propertyInfo.hasNumericValue && isNaN(value)) ||
    (propertyInfo.hasPositiveNumericValue && (value < 1)) ||
    (propertyInfo.hasOverloadedBooleanValue && value === false);
}

var DOMPropertyOperations = {
  createMarkupForProperty(name, value) {
    var propertyInfo = DOMProperty.properties.hasOwnProperty(name) ? DOMProperty.properties[name] : null;

    if (propertyInfo) {
      var attributeName = propertyInfo.attributeName;

      return `${attributeName}=${quoteAttributeValueForBrowser(value)}`;

    } else if (DOMProperty.isCustomAttribute(name)) {
      if (value == null) {
        return '';
      }

      return name + '=' + quoteAttributeValueForBrowser(value);
    }

    return null;
  },
  setAttributeForRoot(node) {
    node.setAttribute(DOMProperty.ROOT_ATTRIBUTE_NAME, '');
  },
  setValueForAttribute(node, name, value) {
    if (value == null) {
      node.removeAttribute(name);
    } else {
      node.setAttribute(name, '' + value);
    }
  },
  setValueForProperty(node, name, value) {
    var propertyInfo = DOMProperty.properties.hasOwnProperty(name)
      ? DOMProperty.properties[name]
      : null;

    if (propertyInfo) {
      var mutationMethod = propertyInfo.mutationMethod;

      if (mutationMethod) {
        mutationMethod(node, value);
      } else if (shouldIgnoreValue(propertyInfo, value)) {
        this.deleteValueForProperty(node, name);
        return;
      } else if (propertyInfo.mustUseProperty) {
        node[propertyInfo.propertyName] = value;
      } else {
        var attributeName = propertyInfo.attributeName;
        var namespace = propertyInfo.attributeNamespaces;

        if (namespace) {
          node.setAttributeNS(namespace, attributeName, '' + value);
        } else if (
          propertyInfo.hasBooleanValue ||
          (
            propertyInfo.hasOverloadedBooleanValue && value === true
          )
        ) {
          node.setAttribute(attributeName, '');
        } else {
          node.setAttribute(attributeName, '' + value);
        }
      }
    } else if (DOMProperty.isCustomAttribute(name)) {
      DOMPropertyOperations.setValueForAttribute(node, name, value);
      return;
    }
  },
  deleteValueForProperty(node, name) {
    var propertyInfo = DOMProperty.properties.hasOwnProperty(name)
      ? DOMProperty.properties[name]
      : null;

    if (propertyInfo) {
      var mutationMethod = propertyInfo.mutationMethod;
      if (mutationMethod) {
        mutationMethod(node, undefined);
      } else if (propertyInfo.mustUseProperty) {
        var propName = propertyInfo.propertyName;
        if (propertyInfo.hasBooleanValue) {
          node[propName] = false;
        } else {
          node[propName] = '';
        }
      } else {
        node.removeAttribute(propertyInfo.attributeName);
      }
    } else if (DOMProperty.isCustomAttribute(name)) {
      node.removeAttribute(name);
    }
  }
};

export default DOMPropertyOperations;
