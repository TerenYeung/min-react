import ReactInstanceMap from '../shared/ReactInstanceMap';
import ReactReconciler from './ReactReconciler';
import shouldUpdateReactComponent from '../shared/shouldUpdateReactComponent';
import ReactNodeTypes from '../shared/ReactNodeTypes';

var CompositeTypes = {
  ImpureClass: 0,
  PureClass: 1,
  StatelessFunctional: 2,
};

function StatelessComponent(Component) {

}

StatelessComponent.prototype.render = function() {
  var Component = ReactInstanceMap.get(this)._currentElement.type;
  var element = Component(this.props, this.context, this.updater);
  return element;
}

function isPureComponent(Component) {
  return !!(Component.prototype && Component.prototype.isPureComponent);
}

function shouldConstruct(Component) {
  return !!(Component.prototype && Component.prototype.isReactComponent);
}

var ReactCompositeComponent = {
  construct(element) {
    this._currentElement = element;
    this._compositeType = null;
    this._instance = null;
    this._hostParent = null;
    this._hostContainerInfo = null;

    this._updateBatchNumber = null;
    this._pendingElement = null;
    this._pendingStateQueue = null;
    this._pendingReplaceState = false;
    this._pendingForceUpdate = false;

    this._renderedComponent = null;
    this._context = null;
    this._mountOrder = 0;

    this._pendingDallbacks = null;
  },
  mountComponent(
    transaction,
    hostParent,
    hostContainerInfo,
    context,
  ) {
    this._context = context;
    this._hostParent = hostParent;
    this._hostContainerInfo = hostContainerInfo;

    var publicProps = this._currentElement.props;
    var Component = this._currentElement.type;

    var updateQueue = (transaction && transaction.getUpdateQueue()) || null;
    // var updateQueue = null;
    var doConstruct = shouldConstruct(Component);
    var inst = this._constructComponent(
      doConstruct,
      publicProps
    );
    var renderedElement;

    // Functional Component
    if (!doConstruct && (inst == null || inst.render == null)) {
      renderedElement = inst;
      inst = new StatelessComponent(Component);
      this._compositeType = CompositeTypes.StatelessFunctional;
    } else {
      if (isPureComponent(Component)) {
        this._compositeType = CompositeTypes.PureClass;
      } else {
        this._compositeType = CompositeTypes.ImpureClass;
      }
    }

    inst.props = publicProps;
    inst.updater = updateQueue;
    this._instance = inst;
    ReactInstanceMap.set(inst, this);
    var initialState = inst.state;
    if (initialState === undefined) {
      inst.state = initialState = null;
    }

    var markup;
    markup = this.performInitialMount(renderedElement, hostParent, hostContainerInfo, transaction, context);
    // markup = this.performInitialMount(renderedElement, hostParent, hostContainerInfo, null, context);

    if (inst.componentDidMount) {
      inst.componentDidMount();
    }

    return markup;
  },
  _constructComponent(
    doConstruct,
    publicProps,
    publicContext,
    updateQueue,
  ) {
    return this._constructComponentWithoutOwner(
      doConstruct,
      publicProps,
      publicContext,
      updateQueue,
    );
  },
  _constructComponentWithoutOwner(
    doConstruct,
    publicProps,
    publicContext,
    updateQueue,
  ) {
    var Component = this._currentElement.type;
    if (doConstruct) {
      return new Component(publicProps, publicContext, updateQueue);
    }

    return Component(publicProps, publicContext, updateQueue);
  },
  performInitialMount(
    renderedElement,
    hostParent,
    hostContainerInfo,
    transaction,
    context
  ) {
    var inst = this._instance;

    if (inst.componentWillMount) {
      inst.componentWillMount();
    }

    // If not a stateless component, we now render
    if (renderedElement === undefined) {
      renderedElement = this._renderValidatedComponent();
    }

    var child = this._instantiateReactComponent(
      renderedElement,
    );
    this._renderedComponent = child;
    var markup = ReactReconciler.mountComponent(
      child,
      transaction,
      hostParent,
      hostContainerInfo,
    );

    return markup;
  },
  performUpdateIfNecessary(transaction) {
    if (this._pendingElement != null) {
      ReactReconciler.receiveComponent(
        this,
        this._pendingElement,
        transaction,
        this._context,
      );
    } else if (this._pendingStateQueue !== null || this._penddingForceUpdate) {
      this.updateComponent(
        transaction,
        this._currentElement,
        this._currentElement,
        this._context,
        this._context
      );
    } else {
      this._updateBatchNumber = null;
    }
  },
  receiveComponent(
    nextElement,
    transaction,
    nextContext
  ) {
    var prevElement = this._currentElement;
    var prevContext = this._context;
    this._pendingElement = null;
    this.updateComponent(
      transaction,
      prevElement,
      nextElement,
      prevContext,
      nextContext,
    );
  },
  updateComponent(
    transaction,
    prevParentElement,
    nextParentElement,
    prevUnmaskedContext,
    nextUnmaskedContext,
  ) {
    var inst = this._instance;
    var willReceive = false;
    var nextContext;

    if (this._context === nextUnmaskedContext) {
      nextContext = inst.context;
    } else {
      nextContext = this._processContext(nextUnmaskedContext);
      willReceive = true;
    }

    var prevProps = prevParentElement.props;
    var nextProps = nextParentElement.props;

    if (prevParentElement !== nextParentElement) {
      willReceive = true;
    }

    if (willReceive && inst.componentWillReceiveProps) {
      inst.componentWillReceiveProps(nextProps, nextContext);
    }

    var nextState = this._processPendingState(nextProps, nextContext);
    var shouldUpdate = true;

    if (!this._pendingForceUpdate) {
      if (inst.shouldComponentUpdate) {
        shouldUpdate = inst.shouldComponentUpdate(nextProps, nextState, nextContext);
      } else {

      }
    }

    this._updateBatchNumber = null;
    if (shouldUpdate) {
      this._pendingForceUpdate = false;
      this._performComponentUpdate(
        nextParentElement,
        nextProps,
        nextState,
        nextContext,
        transaction,
        nextUnmaskedContext
      );
    } else {
      this._currentElement = nextParentElement;
      this._context = nextUnmaskedContext;
      inst.props = nextProps;
      inst.state = nextState;
      inst.context = nextContext;
    }
  },
  unmountComponent(safely) {
    if (!this._renderedComponent) {
      return;
    }

    var inst = this._instance;

    if (inst.componentWillUnmount) {
      inst.componentWillUnmount();
    }

    if (this._renderedComponent) {
      ReactReconciler.unmountComponent(
        this._renderedComponent,
        safely
      );
      this._renderedNodeType = null;
      this._renderedComponent = null;
      this._instance = null;

      this._pendingStateQueue = null;
      this._pendingReplaceState = null;
      this._pendingForceUpdate = false;
      this._pendingCallbacks = null;
      this._pendingElement = null;

      this._context = null;
      this._rootNodeID = 0;
      this._topLevelWrapper = null;

      ReactInstanceMap.remove(inst);
    }
  },
  getHostNode: function() {
    return ReactReconciler.getHostNode(this._renderedComponent);
  },
  _processPendingState(props, context) {
    var inst = this._instance;
    var queue = this._pendingStateQueue;
    var replace = this._pendingReplaceState;
    this._pendingReplaceState = false;
    this._pendingStateQueue = null;

    if (!queue) {
      return inst.state;
    }

    if (replace && queue.length === 1) {
      return queue[0];
    }

    var nextState = Object.assign({}, replace ? queue[0] : inst.state);

    for (var i = replace ? 1 : 0; i < queue.length; i++) {
      var partial = queue[i];
      Object.assign(
        nextState,
        typeof partial === 'function' ? partial.call(inst, nextState, props, context) : partial
      );
    }

    return nextState;
  },
  _performComponentUpdate(
    nextElement,
    nextProps,
    nextState,
    nextContext,
    transaction,
    unmaskedContext,
  ) {
    var inst = this._instance;
    var hasComponentDidUpdate = Boolean(inst.componentDidUpdate);
    var prevProps;
    var prevState;
    var prevContext;

    if (hasComponentDidUpdate) {
      prevProps = inst.props;
      prevState = inst.state;
      prevContext = inst.context;
    }

    if (inst.componentWillUpdate) {
      inst.componentWillUpdate(nextProps, nextState, nextContext);
    }

    this._currentElement = nextElement;
    this._context = unmaskedContext;
    inst.props = nextProps;
    inst.state = nextState;
    inst.context = nextContext;

    this._updateRenderedComponent(transaction, unmaskedContext);

    if (hasComponentDidUpdate) {
      transaction.getReactMountReady()
        .enqueue(
          inst.componentDidUpdate.bind(inst, prevProps, prevState, prevContext),
          inst
        );
    }
  },
  _updateRenderedComponent(
    transaction,
    context,
  ) {
    var prevComponentInstance = this._renderedComponent;
    var prevRenderedElement = prevComponentInstance._currentElement;
    var nextRenderedElement = this._renderValidatedComponent();

    if (shouldUpdateReactComponent(
      prevRenderedElement,
      nextRenderedElement
    )) {
      ReactReconciler.receiveComponent(
        prevComponentInstance,
        nextRenderedElement,
        transaction,
        this._processChildContext(context),
      );
    } else {
      var oldHostNode = ReactReconciler.getHostNode(prevComponentInstance);
      ReactReconciler.unmountComponent(prevComponentInstance, false);

      var nodeType = ReactNodeTypes.getType(nextRenderedElement);
      this._renderedNodeType = nodeType;
      var child = this._instantiateReactComponent(nextReanderedElement);
      this._renderedComponent = child;
      var nextMarkup = ReactReconciler.mountComponent(
        child,
        transaction,
        this._hostParent,
        this._hostContainerInfo,
        this._processChildContext(context)
      );

      this._replaceNodeWithMarkup(
        oldHostNode,
        nextMarkup,
        prevComponentInstance
      );
    }
  },
  _renderValidatedComponent() {
    var renderedElement;
    renderedElement = this._renderValidatedComponentWithoutOwnerOrContext();

    return renderedElement;
  },
  _renderValidatedComponentWithoutOwnerOrContext() {
    var inst = this._instance;
    var renderedElement;
    renderedElement = inst.render();

    return renderedElement;
  },
  _processContext(context) {
    var maskedContext = this._maskContext(context);

    return maskedContext;
  },
  _processChildContext(_currentContext) {
    var Component = this._currentElement.type;
    var inst = this._instance;
    var childContext;

    if (inst.getChildContext) {
      childContext = inst.getChildContext();
    }

    if (childContext) {
      return Object.assign({}, currentContext, childContext);
    }

    return _currentContext;
  },
  _maskContext(context) {
    var Component = this._currentElement.type;
    var contextTypes = Component.contextTypes;

    if (!contextTypes) {
      return {};
    }

    var maskedContext = {};

    for (var contextName in contextTypes) {
      maskedContext[contextName] = context[contextName];
    }

    return maskedContext;
  },
  _renderValidatedComponent() {
    var renderedElement;
    renderedElement = this._renderValidatedComponentWithoutOwnerOrContext();

    return renderedElement;
  },
  _renderValidatedComponentWithoutOwnerOrContext() {
    var inst = this._instance;
    var renderedElement;
    renderedElement = inst.render();

    return renderedElement;
  },
  _instantiateReactComponent: null
};

export default ReactCompositeComponent;
