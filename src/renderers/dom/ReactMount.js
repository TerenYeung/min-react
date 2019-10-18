import React from '../../core/React';
import setInnerHTML from '../../renderers/dom/shared/setInnerHTML';
import instantiateReactComponent from '../../reconciler/instantiateReactComponent';
import ReactUpdates from '../../reconciler/ReactUpdates';
import ReactReconciler from '../../reconciler/ReactReconciler';
import ReactDOMContainerInfo from '../../renderers/dom/shared/ReactDOMContainerInfo';
import DOMLazyTree from '../dom/shared/DOMLazyTree';
import ReactInstanceMap from '../../shared/ReactInstanceMap';
import shouldUpdateReactComponent from '../../shared/shouldUpdateReactComponent';
import ReactUpdateQueue from '../../reconciler/ReactUpdateQueue';

var DOC_NODE_TYPE = 9
var TopLevelWrapper = function() {

};

TopLevelWrapper.prototype.isReactComponent = {};
TopLevelWrapper.prototype.render = function() {
  return this.props.child;
}
TopLevelWrapper.isReactTopLevelWrapper = true;

function batchedMountComponentIntoNode(
  componentInstance,
  container,
  shouldReuseMarkup,
  context
) {
  var transaction = ReactUpdates.ReactReconcileTransaction.getPooled(false);

  transaction.perform(
    mountComponentIntoNode,
    null,
    componentInstance,
    container,
    transaction,
    shouldReuseMarkup,
    context
  );

  ReactUpdates.ReactReconcileTransaction.release(transaction);
}

function getTopLevelWrapperInContainer(container) {
  var root = getHostRootInstanceInContainer(container);

  return root ? root._hostContainerInfo._topLevelWrapper : null;
};

function getHostRootInstanceInContainer(container) {
  var rootEl = getReactRootElementInContainer(container);
  var prevHostInstance = rootEl && ReactDOMComponentTree.getInstanceFromNode(rootEl);

  return (
    prevHostInstance &&
    !prevHostInstance._hostParent ? prevHostInstance : null
  );
}

function getReactRootElementInContainer(container) {
  if (!container) {
    return null;
  }

  if (container.nodeType === DOC_NODE_TYPE) {
    return container.documentElement;
  } else {
    return container.firstChild;
  }
}

function mountComponentIntoNode(
  wrapperInstance,
  container,
  transaction,
  shouldReuseMarkup,
  context,
  ) {
  var markup = ReactReconciler.mountComponent(
    wrapperInstance,
    transaction,
    null,
    ReactDOMContainerInfo(wrapperInstance, container),
    context,
    0
  );

  wrapperInstance._renderedComponent = wrapperInstance;

  ReactMount._mountImageIntoNode(
    markup,
    container,
    wrapperInstance,
  );
}

var ReactMount = {
  render: function(nextElement, container, callback) {
    // 返回根组件实例
    return ReactMount._renderSubtreeIntoContainer(
      null,
      nextElement,
      container,
      callback
    );
  },
  _renderSubtreeIntoContainer: function(
    parentComponent,
    nextElement,
    container,
    callback
  ) {
    // 将根 ReactElement 包裹在 TopLevelWrapper 组件
    var nextWrappedElement = React.createElement(
      TopLevelWrapper,
      {
        child: nextElement,
      }
    );

    var nextContext;
    if (parentComponent) {
      var parentInst = ReactInstanceMap.get(parentComponent);
      nextContext = parentInst._processChildContext(parentInst._context);
    } else {
      nextContext = {};
    }

    console.log('toplevel')
    var prevComponent = getTopLevelWrapperInContainer(container);

    if (prevComponent) {
      var prevWrappedElement = prevComponent._currentElement;
      var prevElement = prevWrappedElement.props.child;

      if (shouldUpdateReactComponent(prevElement, nextElement)) {
        var publicInst = prevComponent._renderedComponent.getPublicInstance();
        var updatedCallback = callback && function() {
          callback.call(publicInst);
        };

        ReactMount._updateRootComponent(
          prevComponent,
          nextWrappedElement,
          nextContext,
          container,
          updatedCallback,
        );

        return publicInst;
      } else {
        ReactMount.unmountComponentAtNode(container);
      }
    }

    var component = ReactMount._renderNewRootComponent(
      nextWrappedElement,
      container,
    );

    return component;
  },
  _updateRootComponent(
    prevComponent,
    nextElement,
    nextContext,
    container,
    callback,
  ) {
    ReactUpdateQueue.enqueueElementInternal(prevComponent, nextElement, nextContext);

    if (callback) {
      ReactUpdateQueue.enqueueCallbackInternal(prevComponent, callback);
    }

    return prevComponent;
  },
  _renderNewRootComponent(
    nextElement,
    container,
  ) {
    var componentInstance = instantiateReactComponent(nextElement);
    // batchedMountComponentIntoNode(componentInstance, container)
    ReactUpdates.batchedUpdates(
      batchedMountComponentIntoNode,
      componentInstance,
      container,
    );

    return componentInstance;
  },
  _mountImageIntoNode(
    markup,
    container,
    instance
  ) {
    if (true) {
      while(container.lastChild) {
        container.removeChild(container.lastChild);
      }

      DOMLazyTree.insertTreeBefore(container, markup, null);
    } else {
      setInnerHTML(container, markup);
    }
  }
};

export default ReactMount;
