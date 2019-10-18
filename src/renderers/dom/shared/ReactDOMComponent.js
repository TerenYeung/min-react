import EventPluginRegistry from '../../../events/EventPluginRegistry';
import CSSPropertyOperations from './CSSPropertyOperations';
import DOMProperty from './DOMProperty';
import DOMPropertyOperations from './DOMPropertyOperations';
import ReactMultiChild from '../../../reconciler/ReactMultiChild';
import escapeTextContentForBrowser from '../shared/escapeTextContentForBrowser';
import EventPluginHub from '../../../events/EventPluginHub';
import DOMNamespaces from './DOMNamespaces';
import ReactDOMComponentTree from './ReactDOMComponentTree';
import DOMLazyTree from './DOMLazyTree';


var globalIdCounter = 1;
var registrationNameModules = EventPluginRegistry.registrationNameModules;
var getNode = ReactDOMComponentTree.getNodeFromInstance;
var omittedCloseTags = {
  'area': true,
  'base': true,
  'br': true,
  'col': true,
  'embed': true,
  'hr': true,
  'img': true,
  'input': true,
  'keygen': true,
  'link': true,
  'meta': true,
  'param': true,
  'source': true,
  'track': true,
  'wbr': true,
  // NOTE: menuitem's close tag should be omitted, but that causes problems.
};
var CONTENT_TYPES = {
  string: true,
  number: true,
};
var RESERVED_PROPS = {
  children: null,
  dangerouslySetInnerHTML: null,
  suppressContentEditableWarning: null,
};

var deleteListener = EventPluginHub.deleteListener;
function enqueuePutListener(inst, registrationName, listener) {
  EventPluginHub.putListener(
    inst,
    registrationName,
    listener,
  );
}

function isCustomComponent(tagName, props) {
  return tagName.indexOf('-') >= 0 || props.is != null;
}

function ReactDOMComponent(element) {
  var tag = element.type;
  this._currentElement = element;
  this._tag = tag.toLowerCase();
  this._renderedChildren = null;
  this._rootNodeID = 0;
}

ReactDOMComponent.displayName = 'ReactDOMComponent';

ReactDOMComponent.Mixin = {
  mountComponent(
    transaction,
    hostParent,
    hostContainerInfo,
    context,
  ) {
    var props = this._currentElement.props;
    var mountImage;
    this._rootNodeID = globalIdCounter++;
    this._hostParent = hostParent;
    this._hostContainerInfo = hostContainerInfo;

    if (true) {
      var ownerDocument = hostContainerInfo._ownerDocument;
      var el;
      el = ownerDocument.createElement(this._currentElement.type);
      ReactDOMComponentTree.precacheNode(this, el);
      this._updateDOMProperties(null, props, transaction);
      var lazyTree = DOMLazyTree(el);
      this._createInitialChildren(transaction, props, context, lazyTree);

      mountImage = lazyTree;
    } else {
      var tagOpen = this._createOpenTagMarkupAndPutListeners(props);
      var tagContent = this._createContentMarkup(props);

      if (!tagContent && omittedCloseTags[this._tag]) {
        mountImage = tagOpen + '/>';
      } else {
        mountImage = `${tagOpen}>${tagContent}</${this._currentElement.type}>`;
      }
    }

    return mountImage;
  },
  receiveComponent(
    nextElement,
    transaction,
    context,
  ) {
    var prevElement = this._currentElement;
    this._currentElement = nextElement;
    this.updateComponent(transaction, prevElement, nextElement, context);
  },
  updateComponent(
    transaction,
    prevElement,
    nextElement,
    context,
  ) {
    var lastProps = prevElement,props;
    var nextProps = this._currentElement.props;

    this._updateDOMProperties(lastProps, nextProps, transaction);
    this._updateDOMChildren(lastProps, nextProps, transaction, context);
  },
  unmountComponent(safely) {
    this.unmountChildren(safely);
    ReactDOMComponentTree.uncacheNode(this);
    EventPluginHub.deleteAllListeners(this);
    this._domID = 0;
    this._wrapperState = null;
  },
  getHostNode() {
    return getNode(this);
  },
  getPublicInstance() {
    return getNode(this);
  },
  /**
   * @description 这步主要是创建开标签，然后将 DOM 标签的属性和相关事件句柄设置到开标签
   * @param {*} props
   */
  _createOpenTagMarkupAndPutListeners(props) {
    var ret = `<${this._currentElement.type}`;

    for (var propKey in props) {
      if (!props.hasOwnProperty(propKey)) {
        continue;
      }

      var propValue = props[propKey];
      if (propValue == null) {
        continue;
      }

      // 绑定事件句柄

      if (registrationNameModules.hasOwnProperty(propKey)) {
        if (propValue) {
          enqueuePutListener(this, propKey, propValue);
        }

      } else {
        if (propKey === 'style') {
          if (propValue) {
            propValue = this._previousStyleCopy = Object.assign({}, props.style);
          }
          propValue = CSSPropertyOperations.createMarkupForStyles(propValue, this);
        }

        var markup = null;
        markup = DOMPropertyOperations.createMarkupForProperty(propKey, propValue);

        if (markup) {
          ret += ' ' + markup;
        }
      }
    }

    return ret;
  },
  _createContentMarkup(props) {
    var ret = '';
    var innerHTML = props.dangerouslySetInnerHTML;

    if (innerHTML != null) {
      if (innerHTML.__html != null) {
        ret = innerHTML.__html;
      }
    } else {
      var contentToUse = CONTENT_TYPES[typeof props.children] ? props.children : null;

      var childrenToUse = contentToUse != null ? null : props.children;

      if (contentToUse != null) {
        ret = escapeTextContentForBrowser(contentToUse);
      } else if (childrenToUse != null) {
        var mountImages = this.mountChildren(childrenToUse);
        ret = mountImages.join('');
      }
    }

    return ret;
  },
  _updateDOMProperties(lastProps, nextProps, transaction) {
    var propKey;
    var styleName;
    var styleUpdates;

    for (propKey in lastProps) {
      if (nextProps.hasOwnProperty(propKey) || !lastProps.hasOwnProperty(propKey) || lastProps[propKey] == null) {
        continue;
      }

      if (propKey === 'style') {
        var lastStyle = this._previousStyleCopy;

        for (styleName in lastStyle) {
          if (lastStyle.hasOwnProperty(styleName)) {
            styleUpdates = styleUpdates || {};
            styleUpdates[styleName] = '';
          }
        }
        this._previousStyleCopy = null;
      } else if (registrationNameModules.hasOwnProperty(propKey)) {
        if (lastProps[propKey]) {
          deleteListener(this, propKey);
        }
      } else if (isCustomComponent(this._tag, lastProps)) {
        if (!RESERVED_PROPS.hasOwnProperty(propKey)) {
          DOMPropertyOperations.deleteValueForAttribute(
            getNode(this),
            propKey
          );
        }
      } else if (
        DOMProperty.properties[propKey]
        || DOMProperty.isCustomAttribute(propKey)
      ) {
        DOMPropertyOperations.deleteValueForProperty(getNode(this), propKey);
      }
    }

    for (propKey in nextProps) {
      var nextProp = nextProps[propKey];
      var lastProp = propKey === 'style'
        ? this._previousStyleCopy
        : lastProps != null
          ? lastProps[propKey]
          : undefined;

      if (
        !nextProps.hasOwnProperty(propKey) || nextProp === lastProp || (nextProp == null && lastProp == null)
        ) {
          continue;
        }

      if (propKey === 'style') {
        if (nextProp) {
          nextProp = this._previousStyleCopy = Object.assign({}, nextProp);
        } else {
          this._previousStyleCopy = null;
        }

        if (lastProp) {
          for (styleName in lastProp) {
            if (
              lastProp.hasOwnProperty(styleName) &&
              (
                !nextProp || !nextProp.hasOwnProperty(styleName)
              )
            ) {
              styleUpdates = styleUpdates || {};
              styleUpdates[styleName] = '';
            }
          }

          for (styleName in nextProp) {
            if (
              nextProp.hasOwnProperty(styleName) &&
              lastProp[styleName] !== nextProp[styleName]
            ) {
              styleUpdates = styleUpdates || {};
              styleUpdates[styleName] = nextProp[styleName];
            }
          }
        } else {
          styleUpdates = nextProp;
        }
      } else if (registrationNameModules.hasOwnProperty(propKey)) {
        // DOM events
        if (nextProp) {
          enqueuePutListener(this, propKey, nextProp, transaction);
        } else if (lastProp) {
          deleteListener(this, propKey);
        }
      } else if (isCustomComponent(this._tag, nextProps)) {
        // React Component
        if (!RESERVED_PROPS.hasOwnProperty(propKey)) {
          DOMPropertyOperations.setValueForAttribute(
            getNode(this),
            propKey,
            nextProp,
          );
        }
      } else if (
        DOMProperty.properties[propKey] ||
        DOMProperty.isCustomAttribute(propKey)
      ) {
        var node = getNode(this);

        if (nextProp != null) {
          DOMPropertyOperations.setValueForProperty(node, propKey, nextProp);
        } else {
          DOMPropertyOperations.deleteValueForProperty(node, propKey);
        }
      }
    }

    if (styleUpdates) {
      CSSPropertyOperations.setValueForStyles(
        getNode(this),
        styleUpdates,
        this
      );
    }
  },
  _updateDOMChildren(
    lastProps,
    nextProps,
    transaction,
    context,
  ) {
    var lastContent = CONTENT_TYPES[typeof lastProps.children] ? lastProps.children : null;
    var nextContent = CONTENT_TYPES[typeof nextProps.children] ? nextProps.children : null;

    var lastHtml = lastProps.dangerouslySetInnerHTML && lastProps.dangerouslySetInnerHTML.__html;
    var nextHtml = nextProps.dangerouslySetInnerHTML && nextProps.dangerouslySetInnerHTML.__html;

    var lastChildren = lastContent != null ? null : lastProps.children;
    var nextChildren = nextContent != null ? null : nextProps.children;

    var lastHasContentOrHtml = lastContent != null || lastHtml != null;
    var nextHasContentOrHtml = nextContent != null || nextHtml != null;

    if (lastChildren != null && nextChildren == null) {
      this.updateChildren(null, transaction, context);
    } else if (lastHasContentOrHtml && !nextHasContentOrHtml) {
      this.updateTextContent('');
    }

    if (nextContent != null) {
      this.updateTextContent('' + nextContent);
    } else if (nextHtml != null) {
      if (lastHtml !== nextHtml) {
        this.updateMarkup('' + nextHtml);
      }
    } else if (nextChildren != null) {
      this.updateChildren(nextChildren, transaction, context);
    }
  },
  _createInitialChildren(
    transaction,
    props,
    context,
    lazyTree
  ) {
    var innerHTML = props.dangerouslySetInnerHTML;

    if (innerHTML != null) {
      if (innerHTML.__html != null) {
        DOMLazyTree.queueHTML(lazyTree, innerHTML.__html);
      }
    } else {
      var contentToUse = CONTENT_TYPES[typeof props.children] ? props.children : null;
      var childrenToUse = contentToUse != null ? null : props.children;

      if (contentToUse != null) {
        if (contentToUse !== '') {
          DOMLazyTree.queueText(lazyTree, contentToUse);
        }
      } else if (childrenToUse != null) {
        var mountImages = this.mountChildren(childrenToUse, transaction, context);

        for (var i = 0; i < mountImages.length; i++) {
          DOMLazyTree.queueChild(lazyTree, mountImages[i]);
        }
      }
    }
  }
};

Object.assign(
  ReactDOMComponent.prototype,
  ReactDOMComponent.Mixin,
  ReactMultiChild.Mixin,
);

export default ReactDOMComponent;
