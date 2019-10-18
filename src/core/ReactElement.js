import REACT_ELEMENT_TYPE from './shared/ReactElementSymbol';

var RESERVED_PROPS = {
  key: true,
  ref: true,
  __self: true,
  __source: true,
};

var ReactElement = function(type, props) {
  var element = {
    $$typeof: Symbol.for('react.element'),
    type,
    props,
  }

  return element;
}

ReactElement.createElement = function(type, config, children) {
  var propName;
  var props = {};
  var key = null;
  var ref = null;
  var self = null;
  var source = null;

  if (config != null) {
    ref = '' + config.ref;
    key = '' + config.key;

    self = config.__self === undefined ? null : config.__self;
    source = config.__source === undefined ? null : config.__source;

    for (propName in config) {
      if (hasOwnProperty.call(config, propName) && !RESERVED_PROPS.hasOwnProperty(propName)) {
        props[propName] = config[propName];
      }
    }
  }

  var childrenLength = arguments.length - 2;
  if (childrenLength === 1) {
    props.children = children;
  } else if (childrenLength > 1) {
    var childArray = Array(childrenLength);
    for (var i = 0; i < childrenLength; i++) {
      childArray[i] = arguments[i + 2];
    }
    props.children = childArray;
  }

  // 如果待创建的 ReactElement 是 CompositeComponent 并且存在 defaultProps，则将 defaultProps 设置进未填值的 props 中
  if (type && type.defaultProps) {
    var defaultProps = type.defaultProps;

    for (propName in defaultProps) {
      if (props[propName] == undefined) {
        props[propName] = defaultProps[propName];
      }
    }
  }


  return ReactElement(type, props);
}

ReactElement.isValidElement = function(object) {
  return (
    typeof object === 'object' &&
    object != null && object.$$typeof === REACT_ELEMENT_TYPE
  )
}

export default ReactElement;
