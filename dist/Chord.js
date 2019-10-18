(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.Chord = factory());
}(this, function () { 'use strict';

  var ReactNoopUpdateQueue = {
    enqueueSetState: function enqueueSetState(publicInstance, partialState) {},
    enqueueCallback: function enqueueCallback(publicInstance, callback) {}
  };

  function ReactComponent(props, context, updater) {
    this.props = props;
    this.context = context;
    this.updater = updater || ReactNoopUpdateQueue;
  }

  ReactComponent.prototype.isReactComponent = {};

  ReactComponent.prototype.setState = function (partialState, callback) {
    this.updater.enqueueSetState(this, partialState);

    if (callback) {
      this.updater.enqueueCallback(this, callback, "setState");
    }
  };

  function _typeof(obj) {
    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  var REACT_ELEMENT_TYPE = typeof Symbol === 'function' && Symbol["for"] && Symbol["for"]('react.element') || 0xeac7;

  var RESERVED_PROPS = {
    key: true,
    ref: true,
    __self: true,
    __source: true
  };

  var ReactElement = function ReactElement(type, props) {
    var element = {
      $$typeof: Symbol["for"]('react.element'),
      type: type,
      props: props
    };
    return element;
  };

  ReactElement.createElement = function (type, config, children) {
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
    } // 如果待创建的 ReactElement 是 CompositeComponent 并且存在 defaultProps，则将 defaultProps 设置进未填值的 props 中


    if (type && type.defaultProps) {
      var defaultProps = type.defaultProps;

      for (propName in defaultProps) {
        if (props[propName] == undefined) {
          props[propName] = defaultProps[propName];
        }
      }
    }

    return ReactElement(type, props);
  };

  ReactElement.isValidElement = function (object) {
    return _typeof(object) === 'object' && object != null && object.$$typeof === REACT_ELEMENT_TYPE;
  };

  var React = {
    Component: ReactComponent,
    createElement: ReactElement.createElement,
    isValidElement: ReactElement.isValidElement
  };

  var genericComponentClass = null;
  var textComponentClass = null;
  var ReactHostComponent = {
    createInternalComponent: function createInternalComponent(element) {
      return new genericComponentClass(element);
    },
    createInstanceForText: function createInstanceForText(text) {
      return new textComponentClass(text);
    },
    injection: {
      injectGenericComponentClass: function injectGenericComponentClass(componentClass) {
        genericComponentClass = componentClass;
      },
      injectTextComponentClass: function injectTextComponentClass(componentClass) {
        textComponentClass = componentClass;
      }
    }
  };

  var oneArgumentPooler = function oneArgumentPooler(copyFieldsFrom) {
    var Klass = this;

    if (Klass.instancePool.length) {
      var instance = Klass.instancePool.pop();
      Klass.call(instance, copyFieldsFrom);
      return instance;
    } else {
      return new Klass(copyFieldsFrom);
    }
  };

  var standardReleaser = function standardReleaser(instance) {
    var Klass = this;
    instance.destructor();

    if (Klass.instancePool.length < Klass.poolSize) {
      Klass.instancePool.push(instance);
    }
  };

  var DEFAULT_POOLER = oneArgumentPooler;
  var DEFAULT_POOL_SIZE = 10;

  var addPoolingTo = function addPoolingTo(CopyConstructor, pooler) {
    var NewKlass = CopyConstructor;
    NewKlass.instancePool = [];
    NewKlass.getPooled = pooler || DEFAULT_POOLER;

    if (!NewKlass.poolSize) {
      NewKlass.poolSize = DEFAULT_POOL_SIZE;
    }

    NewKlass.release = standardReleaser;
    return NewKlass;
  };

  var PooledClass = {
    addPoolingTo: addPoolingTo
  };

  var Transaction = {
    reinitializeTransaction: function reinitializeTransaction() {
      this.transactionWrappers = this.getTransactionWrappers();

      if (this.wrapperInitData) {
        this.wrapperInitData.length = 0;
      } else {
        this.wrapperInitData = [];
      }

      this._isInTransaction = false;
    },
    _isInTransaction: false,
    getTransactionWrappers: null,
    isInTransaction: function isInTransaction() {
      return !!this._isInTransaction;
    },
    perform: function perform(method, scope, a, b, c, d, e, f) {
      var ret;

      try {
        this._isInTransaction = true;
        this.initializeAll(0);
        ret = method.call(scope, a, b, c, d, e, f);
      } finally {
        this.closeAll(0);
        this._isInTransaction = false;
      }

      return ret;
    },
    initializeAll: function initializeAll(startIndex) {
      var transactionWrappers = this.transactionWrappers;

      for (var i = startIndex; i < transactionWrappers.length; i++) {
        var wrapper = transactionWrappers[i];

        try {
          this.wrapperInitData[i] = {};
          this.wrapperInitData[i] = wrapper.initialize ? wrapper.initialize.call(this) : null;
        } finally {
          if (this.wrapperInitData[i] === {}) {
            this.initializeAll(i + 1);
          }
        }
      }
    },
    closeAll: function closeAll(startIndex) {
      var transactionWrappers = this.transactionWrappers;

      for (var i = startIndex; i < transactionWrappers.length; i++) {
        var wrapper = transactionWrappers[i];
        var initData = this.wrapperInitData[i];

        if (initData !== {} && wrapper.close) {
          wrapper.close.call(this, initData);
        }
      }

      this.wrapperInitData.length = 0;
    }
  };

  var CallbackQueue =
  /*#__PURE__*/
  function () {
    function CallbackQueue(arg) {
      _classCallCheck(this, CallbackQueue);

      this._callbacks = null;
      this._contexts = null;
      this._arg = arg;
    }

    _createClass(CallbackQueue, [{
      key: "enqueue",
      value: function enqueue(callback, context) {
        this._callbacks = this._callbacks || [];

        this._callbacks.push(callback);

        this._contexts = this._contexts || [];

        this._contexts.push(context);
      }
    }, {
      key: "notifyAll",
      value: function notifyAll() {
        var callbacks = this._callbacks;
        var contexts = this._contexts;
        var arg = this._arg;

        if (callbacks && contexts) {
          this._callbacks = null;
          this._contexts = null;

          for (var i = 0; i < callbacks.length; i++) {
            callbacks[i].call(contexts[i], arg);
          }

          callbacks.length = 0;
          contexts.length = 0;
        }
      }
    }, {
      key: "reset",
      value: function reset() {
        this._callbacks = null;
        this._contexts = null;
      }
    }, {
      key: "destructor",
      value: function destructor() {
        this.reset();
      }
    }]);

    return CallbackQueue;
  }();

  var CallbackQueue$1 = PooledClass.addPoolingTo(CallbackQueue);

  var ReactOwner = {
    addComponentAsRefTo: function addComponentAsRefTo(component, ref, owner) {
      owner.attachRef(ref, component);
    },
    removeComponentAsRefFrom: function removeComponentAsRefFrom(component, ref, owner) {
      var ownerPublicInstance = owner.getPublicInstance();

      if (ownerPublicInstance && ownerPublicInstance.refs[ref] === component.getPublicInstance()) {
        owner.detachRef(ref);
      }
    }
  };

  var ReactRef = {};

  function attachRef(ref, component, owner) {
    if (typeof ref === 'function') {
      ref(component.getPublicInstance());
    } else {
      ReactOwner.addComponentAsRefTo(component, ref, owner);
    }
  }

  function detachRef(ref, component, owner) {
    if (typeof ref === 'function') {
      ref(null);
    } else {
      ReactOwner.removeComponentAsRefFrom(component, ref, owner);
    }
  }

  ReactRef.attachRefs = function (instance, element) {
    if (element === null || _typeof(element) !== 'object') {
      return;
    }

    var ref = element.ref;

    if (ref != null) {
      attachRef(ref, instance, element._owner);
    }
  };

  ReactRef.detachRefs = function (instance, element) {
    if (element === null || _typeof(element) !== 'object') {
      return;
    }

    var ref = element.ref;

    if (ref != null) {
      detachRef(ref, instance, element._owner);
    }
  };

  var ReactReconciler = {
    mountComponent: function mountComponent(internalInstance, transaction, hostParent, hostContainerInfo, context) {
      var markup = internalInstance.mountComponent(transaction, hostParent, hostContainerInfo, context);
      return markup;
    },
    receiveComponent: function receiveComponent(internalInstance, nextElement, transaction, context) {
      var prevElement = internalInstance._currentElement;

      if (nextElement === prevElement && context === internalInstance._context) {
        return;
      }

      internalInstance.receiveComponent(nextElement, transaction, context);
    },
    performUpdateIfNecessary: function performUpdateIfNecessary(internalInstance, transaction, updateBatchNumber) {
      if (internalInstance._updateBatchNumber !== updateBatchNumber) {
        return;
      }

      internalInstance.performUpdateIfNecessary(transaction);
    },
    getHostNode: function getHostNode(internalInstance) {
      return internalInstance.getHostNode();
    },
    unmountComponent: function unmountComponent(internalInstance, safely) {
      ReactRef.detachRefs(internalInstance, internalInstance._currentElement);
      internalInstance.unmountComponent(safely);
    }
  };

  var batchingStrategy = null;
  var dirtyComponents = [];
  var updateBatchNumber = 0;
  var ReactUpdatesInjection = {
    injectBatchingStrategy: function injectBatchingStrategy(_batchingStrategy) {
      batchingStrategy = _batchingStrategy;
    },
    injectReconcileTransaction: function injectReconcileTransaction(ReconcileTransaction) {
      ReactUpdates.ReactReconcileTransaction = ReconcileTransaction;
    }
  };

  var flushBatchedUpdates = function flushBatchedUpdates() {
    while (dirtyComponents.length) {
      if (dirtyComponents.length) {
        // new ReactUpdatesFlushTransaction();
        var transaction = ReactUpdatesFlushTransaction.getPooled();
        transaction.perform(runBatchedUpdates, null, transaction);
        ReactUpdatesFlushTransaction.release(transaction);
      }
    }
  };

  function mountOrderComparator(c1, c2) {
    return c1._mountOrder - c2._mountOrder;
  }

  function runBatchedUpdates(transaction) {
    var len = transaction.dirtyComponentsLength;
    dirtyComponents.sort(mountOrderComparator);
    updateBatchNumber++;

    for (var i = 0; i < len; i++) {
      var component = dirtyComponents[i];
      var callbacks = component._pendingCallbacks;
      component._pendingCallbacks = null;
      ReactReconciler.performUpdateIfNecessary(component, transaction.reconcileTransaction, updateBatchNumber);

      if (callbacks) {
        for (var j = 0; j < callbacks.length; j++) {
          transaction.callbackQueue.enqueue(callbacks[j], component.getPublicInstance());
        }
      }
    }
  }

  var NESTED_UPDATES = {
    initialize: function initialize() {
      this.dirtyComponentsLength = dirtyComponents.length;
    },
    close: function close() {
      if (this.dirtyComponentsLength !== dirtyComponents.length) {
        dirtyComponents.splice(0, this.dirtyComponentsLength);
        flushBatchedUpdates();
      } else {
        dirtyComponents.length = 0;
      }
    }
  };
  var UPDATE_QUEUEING = {
    initialize: function initialize() {
      this.callbackQueue.reset();
    },
    close: function close() {
      this.callbackQueue.notifyAll();
    }
  };
  var TRANSACTION_WRAPPERS = [NESTED_UPDATES, UPDATE_QUEUEING];

  function ReactUpdatesFlushTransaction() {
    this.reinitializeTransaction();
    this.dirtyComponentsLength = null;
    this.callbackQueue = CallbackQueue$1.getPooled();
    this.reconcileTransaction = ReactUpdates.ReactReconcileTransaction.getPooled(true);
  }

  Object.assign(ReactUpdatesFlushTransaction.prototype, Transaction, {
    getTransactionWrappers: function getTransactionWrappers() {
      return TRANSACTION_WRAPPERS;
    },
    destructor: function destructor() {
      this.dirtyComponentsLength = null;
      CallbackQueue$1.release(this.callbackQueue);
      this.callbackQueue = null;
      ReactUpdates.ReactReconcileTransaction.release(this.reconcileTransaction);
      this.reconcileTransaction = null;
    },
    perform: function perform(method, scope, a) {
      return Transaction.perform.call(this, this.reconcileTransaction.perform, this.reconcileTransaction, method, scope, a);
    }
  });

  function enqueueUpdate(component) {
    if (!batchingStrategy.isBatchingUpdates) {
      // 如果第一次更新，则将状态锁 isBatchingUpdates = true
      batchingStrategy.batchedUpdates(enqueueUpdate, component);
      return;
    } // 然后将待更新的组件 push 到 dirtyComponents


    dirtyComponents.push(component);

    if (component._updateBatchNumber == null) {
      component._updateBatchNumber = updateBatchNumber + 1;
    }
  }

  function batchedUpdates(callback, a, b, c, d, e) {
    return batchingStrategy.batchedUpdates(callback, a, b, c, d, e);
  }

  PooledClass.addPoolingTo(ReactUpdatesFlushTransaction);
  var ReactUpdates = {
    ReactReconcileTransaction: null,
    batchedUpdates: batchedUpdates,
    injection: ReactUpdatesInjection,
    enqueueUpdate: enqueueUpdate,
    flushBatchedUpdates: flushBatchedUpdates
  };

  /**
   *
    {
      SimpleEventPlugin,
      EnterLeaveEventPlugin,
      ChangeEventPlugin,
      SelectEventPlugin,
      BeforeInputEventPlugin,
    }
    */
  var namesToPlugins = {};
  var eventPluginOrder = null;

  function recomputePluginOrdering() {
    if (!eventPluginOrder) {
      return;
    }

    for (var pluginName in namesToPlugins) {
      var pluginModule = namesToPlugins[pluginName];
      var pluginIndex = eventPluginOrder.indexOf(pluginName);

      if (EventPluginRegistry.plugins[pluginIndex]) {
        continue;
      }

      EventPluginRegistry.plugins[pluginIndex] = pluginModule;
      /**
       * {
       *  input: {
       *    phasedRegistrationNames: {},
       *    dependencies: []
       *  }
       * }
       */

      var publishedEvents = pluginModule.eventTypes;

      for (var eventName in publishedEvents) {
        publishEventForPlugin(publishedEvents[eventName], pluginModule, eventName);
      }
    }
  }

  function publishEventForPlugin(dispatchConfig, pluginModule, eventName) {
    EventPluginRegistry.eventNameDispatchConfigs[eventName] = dispatchConfig;
    var phasedRegistrationNames = dispatchConfig.phasedRegistrationNames;

    if (phasedRegistrationNames) {
      for (var phaseName in phasedRegistrationNames) {
        if (phasedRegistrationNames.hasOwnProperty(phaseName)) {
          var phasedRegistrationName = phasedRegistrationNames[phaseName];
          publishRegistrationName(phasedRegistrationName, // onEvent
          pluginModule, // SimpleEventPlugin
          eventName // input
          );
        }
      }

      return true;
    } else if (dispatchConfig.registrationName) {
      publishRegistrationName(dispatchConfig.registrationName, pluginModule, eventName);
    }

    return false;
  }

  function publishRegistrationName(registrationName, pluginModule, eventName) {
    /**
     * registrationNameModules = {
     *  onEvent: SimpleEventPlugin
     * }
     */
    EventPluginRegistry.registrationNameModules[registrationName] = pluginModule;
    EventPluginRegistry.registrationNameDependencies[registrationName] = pluginModule.eventTypes[eventName].dependencies;
  }

  var EventPluginRegistry = {
    eventNameDispatchConfigs: {},
    plugins: [],
    registrationNameModules: {},
    registrationNameDependencies: {},
    injectEventPluginOrder: function injectEventPluginOrder(injectedEventPluginOrder) {
      eventPluginOrder = Array.prototype.slice.call(injectedEventPluginOrder);
      recomputePluginOrdering();
    },
    injectEventPluginsByName: function injectEventPluginsByName(injectedNamesToPlugins) {
      var isOrderingDirty = false;

      for (var pluginName in injectedNamesToPlugins) {
        if (!injectedNamesToPlugins.hasOwnProperty(pluginName)) {
          continue;
        }

        var pluginModule = injectedNamesToPlugins[pluginName];

        if (!namesToPlugins.hasOwnProperty(pluginName) || namesToPlugins[pluginName] !== pluginModule) {
          /**
           *
            {
              SimpleEventPlugin,
              EnterLeaveEventPlugin,
              ChangeEventPlugin,
              SelectEventPlugin,
              BeforeInputEventPlugin,
            }
          */
          namesToPlugins[pluginName] = pluginModule;
          isOrderingDirty = true;
        }
      }

      if (isOrderingDirty) {
        recomputePluginOrdering();
      }
    }
  };

  var getDictionaryKey = function getDictionaryKey(inst) {
    return '.' + inst._rootNodeID;
  };

  var listenerBank = {};
  var EventPluginHub = {
    putListener: function putListener(inst, registrationName, listener) {
      var key = getDictionaryKey(inst);
      var bankForRegistrationName = listenerBank[registrationName] || (listenerBank[registrationName] = {});
      bankForRegistrationName[key] = listener;
      var PluginModule = EventPluginRegistry.registrationNameModules[registrationName];

      if (PluginModule && PluginModule.didPutListener) {
        PluginModule.didPutListener(inst, registrationName, listener);
      }
    },
    deleteListener: function deleteListener(inst, registrationName) {
      var PluginModule = EventPluginRegistry.registrationNameModules[registrationName];

      if (PluginModule && PluginModule.willDeleteListener) {
        PluginModule.willDeleteListener(inst, registrationName);
      }
    },
    deleteAllListeners: function deleteAllListeners(inst) {
      var key = getDictionaryKey(inst);

      for (var registrationName in listenerBank) {
        if (!listenerBank.hasOwnProperty(registrationName)) {
          continue;
        }

        if (!listenerBank[registrationName][key]) {
          continue;
        }

        var PluginModule = EventPluginRegistry.registrationNameModules[registrationName];

        if (PluginModule && PluginModule.willDeleteListener) {
          PluginModule.willDeleteListener(inst, registrationName);
        }

        delete listenerBank[registrationName][key];
      }
    },
    injection: {
      injectEventPluginOrder: EventPluginRegistry.injectEventPluginOrder,
      injectEventPluginsByName: EventPluginRegistry.injectEventPluginsByName
    }
  };

  var ATTRIBUTE_NAME_START_CHAR = ":A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD";
  var DOMPropertyInjection = {
    MUST_USE_PROPERTY: 0x1,
    HAS_BOOLEAN_VALUE: 0x4,
    injectDOMPropertyConfig: function injectDOMPropertyConfig(domPropertyConfig) {
      var Properties = domPropertyConfig.Properties || {};
      var DOMAttributeNames = domPropertyConfig.DOMAttributeNames || {};
      var DOMAttributeNamespaces = domPropertyConfig.DOMAttributeNamespaces || {};
      var DOMPropertyNames = domPropertyConfig.DOMPropertyNames || {};
      var DOMMutationMethods = domPropertyConfig.DOMMutationMethods || {};

      if (domPropertyConfig.isCustomAttribute) {
        DOMProperty._isCustomAttributeFunctions.push(domPropertyConfig.isCustomAttribute);
      }

      for (var propName in Properties) {
        var lowerCased = propName.toLowerCase();
        var propConfig = Properties[propName];
        var propertyInfo = {
          attributeName: lowerCased,
          attributeNamespace: null,
          propertyName: propName,
          mutationMethod: null
        };

        if (DOMAttributeNames.hasOwnProperty(propName)) {
          var attributeName = DOMAttributeNames[propName];
          propertyInfo.attributeName = attributeName;
        }

        if (DOMAttributeNamespaces.hasOwnProperty(propName)) {
          propertyInfo.attributeNamespace = DOMAttributeNamespaces[propName];
        }

        if (DOMPropertyNames.hasOwnProperty(propName)) {
          propertyInfo.propertyName = DOMPropertyNames[propName];
        }

        if (DOMMutationMethods.hasOwnProperty(propName)) {
          propertyInfo.mutationMethod = DOMMutationMethods[propName];
        }

        DOMProperty.properties[propName] = propertyInfo;
      }
    }
  };
  var DOMProperty = {
    ID_ATTRIBUTE_NAME: 'data-reactid',
    ROOT_ATTRIBUTE_NAME: 'data-reactroot',
    ATTRIBUTE_NAME_CHAR: ATTRIBUTE_NAME_START_CHAR + "\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040",
    properties: {},
    _isCustomAttributeFunctions: [],
    isCustomAttribute: function isCustomAttribute(attributeName) {
      for (var i = 0; i < DOMProperty._isCustomAttributeFunctions.length; i++) {
        var isCustomAttributeFn = DOMProperty._isCustomAttributeFunctions[i];

        if (isCustomAttributeFn(attributeName)) {
          return true;
        }
      }

      return false;
    },
    injection: DOMPropertyInjection
  };

  var ReactComponentEnvironment = {
    processChildrenUpdates: null,
    injection: {
      injectEnvironment: function injectEnvironment(environment) {
        ReactComponentEnvironment.processChildrenUpdates = environment.processChildrenUpdates;
      }
    }
  };

  var ReactInjection = {
    Component: ReactComponentEnvironment.injection,
    HostComponent: ReactHostComponent.injection,
    Updates: ReactUpdates.injection,
    EventPluginHub: EventPluginHub.injection,
    DOMProperty: DOMProperty.injection
  };

  var msPattern = /^ms-/;
  var _uppercasePattern = /([A-Z])/g;

  function hyphenate(string) {
    return string.replace(_uppercasePattern, '-$1').toLowerCase();
  }

  function hyphenateStyleName(string) {
    return hyphenate(string).replace(msPattern, '-ms-');
  }

  var isUnitlessNumber = {
    animationIterationCount: true,
    borderImageOutset: true,
    borderImageSlice: true,
    borderImageWidth: true,
    boxFlex: true,
    boxFlexGroup: true,
    boxOrdinalGroup: true,
    columnCount: true,
    flex: true,
    flexGrow: true,
    flexPositive: true,
    flexShrink: true,
    flexNegative: true,
    flexOrder: true,
    gridRow: true,
    gridColumn: true,
    fontWeight: true,
    lineClamp: true,
    lineHeight: true,
    opacity: true,
    order: true,
    orphans: true,
    tabSize: true,
    widows: true,
    zIndex: true,
    zoom: true,
    // SVG-related properties
    fillOpacity: true,
    floodOpacity: true,
    stopOpacity: true,
    strokeDasharray: true,
    strokeDashoffset: true,
    strokeMiterlimit: true,
    strokeOpacity: true,
    strokeWidth: true
  };
  var CSSProperty = {
    isUnitlessNumber: isUnitlessNumber
  };

  var isUnitlessNumber$1 = CSSProperty.isUnitlessNumber;

  function dangerousStyleValue(name, value, component) {
    var isEmpty = value == null || typeof value === 'boolean' || value === '';
    if (isEmpty) return '';
    var isNonNumeric = isNaN(value); // 将数值型样式值转换为字符串

    if (isNonNumeric || value === 0 || isUnitlessNumber$1.hasOwnProperty(name) && isUnitlessNumber$1[name]) {
      return '' + value;
    }

    if (typeof value === 'string') {
      value = value.trim();
    } // ?


    return value + 'px';
  }

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
    createMarkupForStyles: function createMarkupForStyles(styles, component) {
      var serialized = '';

      for (var styleName in styles) {
        if (!styles.hasOwnProperty(styleName)) {
          continue;
        }

        var styleValue = styles[styleName];

        if (styleValue != null) {
          // 将 camelCase 转换为 kebaCase
          serialized += processStyleName(styleName) + ':';
          serialized += dangerousStyleValue(styleName, styleValue) + ';';
        }
      }

      return serialized || null;
    },
    setValueForStyles: function setValueForStyles(node, styles, component) {
      var style = node.style;

      for (var styleName in styles) {
        if (!styles.hasOwnProperty(styleName)) {
          continue;
        }

        var styleValue = dangerousStyleValue(styleName, styles[styleName]);

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

  var matchHtmlRegExp = /["'&<>]/;

  function escapeHtml(string) {
    var str = '' + string;
    var match = matchHtmlRegExp.exec(str);

    if (!match) {
      return str;
    }

    var escape;
    var html = '';
    var index = 0;
    var lastIndex = 0;

    for (index = match.index; index < str.length; index++) {
      switch (str.charCodeAt(index)) {
        case 34:
          // "
          escape = '&quot;';
          break;

        case 38:
          // &
          escape = '&amp;';
          break;

        case 39:
          // '
          escape = '&#x27;'; // modified from escape-html; used to be '&#39'

          break;

        case 60:
          // <
          escape = '&lt;';
          break;

        case 62:
          // >
          escape = '&gt;';
          break;

        default:
          continue;
      }

      if (lastIndex !== index) {
        html += str.substring(lastIndex, index);
      }

      lastIndex = index + 1;
      html += escape;
    }

    return lastIndex !== index ? html + str.substring(lastIndex, index) : html;
  }

  function escapeTextContentForBrowser(text) {
    if (typeof text === 'boolean' || typeof text === 'number') {
      return '' + text;
    }

    return escapeHtml(text);
  }

  function quoteAttributeValueForBrowser(value) {
    return '"' + escapeTextContentForBrowser(value) + '"';
  }

  function shouldIgnoreValue(propertyInfo, value) {
    return value == null || propertyInfo.hasBooleanValue && !value || propertyInfo.hasNumericValue && isNaN(value) || propertyInfo.hasPositiveNumericValue && value < 1 || propertyInfo.hasOverloadedBooleanValue && value === false;
  }

  var DOMPropertyOperations = {
    createMarkupForProperty: function createMarkupForProperty(name, value) {
      var propertyInfo = DOMProperty.properties.hasOwnProperty(name) ? DOMProperty.properties[name] : null;

      if (propertyInfo) {
        var attributeName = propertyInfo.attributeName;
        return "".concat(attributeName, "=").concat(quoteAttributeValueForBrowser(value));
      } else if (DOMProperty.isCustomAttribute(name)) {
        if (value == null) {
          return '';
        }

        return name + '=' + quoteAttributeValueForBrowser(value);
      }

      return null;
    },
    setAttributeForRoot: function setAttributeForRoot(node) {
      node.setAttribute(DOMProperty.ROOT_ATTRIBUTE_NAME, '');
    },
    setValueForAttribute: function setValueForAttribute(node, name, value) {
      if (value == null) {
        node.removeAttribute(name);
      } else {
        node.setAttribute(name, '' + value);
      }
    },
    setValueForProperty: function setValueForProperty(node, name, value) {
      var propertyInfo = DOMProperty.properties.hasOwnProperty(name) ? DOMProperty.properties[name] : null;

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
          } else if (propertyInfo.hasBooleanValue || propertyInfo.hasOverloadedBooleanValue && value === true) {
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
    deleteValueForProperty: function deleteValueForProperty(node, name) {
      var propertyInfo = DOMProperty.properties.hasOwnProperty(name) ? DOMProperty.properties[name] : null;

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

  function traverseAllChildrenImpl(children, nameSoFar, callback, traverseContext) {
    var type = _typeof(children);

    if (type === 'undefined' || type === 'boolean') {
      children = null;
    }

    if (children === null || type === 'string' || type === 'number' || type === 'object' && children.$$typeof === Symbol["for"]('react.element')) {
      callback(traverseContext, children, '' + (Math.random() * 100 + Date.now()));
      return 1;
    }

    var child;
    var nextName;
    var subtreeCount = 0;

    if (Array.isArray(children)) {
      for (var i = 0; i < children.length; i++) {
        child = children[i];
        subtreeCount += traverseAllChildrenImpl(child, nextName, callback, traverseContext);
      }
    }

    return subtreeCount;
  }

  function traverseAllChildren(children, callback, traverseContext) {
    if (children == null) return 0;
    return traverseAllChildrenImpl(children, '', callback, traverseContext);
  }

  var ReactInstanceMap = {
    get: function get(key) {
      return key._reactInternalInstance;
    },
    remove: function remove(key) {
      key._reactInternalInstance = undefined;
    },
    has: function has(key) {
      return key._reactInternalInstance !== undefined;
    },
    set: function set(key, value) {
      key._reactInternalInstance = value;
    }
  };

  function shouldUpdateReactComponent(prevElement, nextElement) {
    var prevEmpty = prevElement === null || prevElement === false;
    var nextEmpty = nextElement === null || nextElement === false;

    if (prevEmpty || nextEmpty) {
      return prevEmpty === nextEmpty;
    }

    var prevType = _typeof(prevElement);

    var nextType = _typeof(nextElement);

    if (prevType === 'string' || prevType === 'number') {
      return nextType === 'string' || nextType === 'number';
    } else {
      return nextType === 'object' && prevElement.type === nextElement.type && prevElement.key === nextElement.key;
    }
  }

  var ReactNodeTypes = {
    HOST: 0,
    COMPOSITE: 1,
    EMPTY: 2,
    getType: function getType(node) {
      if (node === null || node === false) {
        return ReactNodeTypes.EMPTY;
      } else if (React.isValidElement(node)) {
        if (typeof node.type === 'function') {
          return ReactNodeTypes.COMPOSITE;
        } else {
          return ReactNodeTypes.HOST;
        }
      }
    }
  };

  var _ReactCompositeCompon;
  var CompositeTypes = {
    ImpureClass: 0,
    PureClass: 1,
    StatelessFunctional: 2
  };

  function StatelessComponent(Component) {}

  StatelessComponent.prototype.render = function () {
    var Component = ReactInstanceMap.get(this)._currentElement.type;

    var element = Component(this.props, this.context, this.updater);
    return element;
  };

  function isPureComponent(Component) {
    return !!(Component.prototype && Component.prototype.isPureComponent);
  }

  function shouldConstruct(Component) {
    return !!(Component.prototype && Component.prototype.isReactComponent);
  }

  var ReactCompositeComponent = (_ReactCompositeCompon = {
    construct: function construct(element) {
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
    mountComponent: function mountComponent(transaction, hostParent, hostContainerInfo, context) {
      this._context = context;
      this._hostParent = hostParent;
      this._hostContainerInfo = hostContainerInfo;
      var publicProps = this._currentElement.props;
      var Component = this._currentElement.type;
      var updateQueue = transaction && transaction.getUpdateQueue() || null; // var updateQueue = null;

      var doConstruct = shouldConstruct(Component);

      var inst = this._constructComponent(doConstruct, publicProps);

      var renderedElement; // Functional Component

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
      markup = this.performInitialMount(renderedElement, hostParent, hostContainerInfo, transaction, context); // markup = this.performInitialMount(renderedElement, hostParent, hostContainerInfo, null, context);

      if (inst.componentDidMount) {
        inst.componentDidMount();
      }

      return markup;
    },
    _constructComponent: function _constructComponent(doConstruct, publicProps, publicContext, updateQueue) {
      return this._constructComponentWithoutOwner(doConstruct, publicProps, publicContext, updateQueue);
    },
    _constructComponentWithoutOwner: function _constructComponentWithoutOwner(doConstruct, publicProps, publicContext, updateQueue) {
      var Component = this._currentElement.type;

      if (doConstruct) {
        return new Component(publicProps, publicContext, updateQueue);
      }

      return Component(publicProps, publicContext, updateQueue);
    },
    performInitialMount: function performInitialMount(renderedElement, hostParent, hostContainerInfo, transaction, context) {
      var inst = this._instance;

      if (inst.componentWillMount) {
        inst.componentWillMount();
      } // If not a stateless component, we now render


      if (renderedElement === undefined) {
        renderedElement = this._renderValidatedComponent();
      }

      var child = this._instantiateReactComponent(renderedElement);

      this._renderedComponent = child;
      var markup = ReactReconciler.mountComponent(child, transaction, hostParent, hostContainerInfo);
      return markup;
    },
    performUpdateIfNecessary: function performUpdateIfNecessary(transaction) {
      if (this._pendingElement != null) {
        ReactReconciler.receiveComponent(this, this._pendingElement, transaction, this._context);
      } else if (this._pendingStateQueue !== null || this._penddingForceUpdate) {
        this.updateComponent(transaction, this._currentElement, this._currentElement, this._context, this._context);
      } else {
        this._updateBatchNumber = null;
      }
    },
    receiveComponent: function receiveComponent(nextElement, transaction, nextContext) {
      var prevElement = this._currentElement;
      var prevContext = this._context;
      this._pendingElement = null;
      this.updateComponent(transaction, prevElement, nextElement, prevContext, nextContext);
    },
    updateComponent: function updateComponent(transaction, prevParentElement, nextParentElement, prevUnmaskedContext, nextUnmaskedContext) {
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
        }
      }

      this._updateBatchNumber = null;

      if (shouldUpdate) {
        this._pendingForceUpdate = false;

        this._performComponentUpdate(nextParentElement, nextProps, nextState, nextContext, transaction, nextUnmaskedContext);
      } else {
        this._currentElement = nextParentElement;
        this._context = nextUnmaskedContext;
        inst.props = nextProps;
        inst.state = nextState;
        inst.context = nextContext;
      }
    },
    unmountComponent: function unmountComponent(safely) {
      if (!this._renderedComponent) {
        return;
      }

      var inst = this._instance;

      if (inst.componentWillUnmount) {
        inst.componentWillUnmount();
      }

      if (this._renderedComponent) {
        ReactReconciler.unmountComponent(this._renderedComponent, safely);
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
    getHostNode: function getHostNode() {
      return ReactReconciler.getHostNode(this._renderedComponent);
    },
    _processPendingState: function _processPendingState(props, context) {
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
        Object.assign(nextState, typeof partial === 'function' ? partial.call(inst, nextState, props, context) : partial);
      }

      return nextState;
    },
    _performComponentUpdate: function _performComponentUpdate(nextElement, nextProps, nextState, nextContext, transaction, unmaskedContext) {
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
        transaction.getReactMountReady().enqueue(inst.componentDidUpdate.bind(inst, prevProps, prevState, prevContext), inst);
      }
    },
    _updateRenderedComponent: function _updateRenderedComponent(transaction, context) {
      var prevComponentInstance = this._renderedComponent;
      var prevRenderedElement = prevComponentInstance._currentElement;

      var nextRenderedElement = this._renderValidatedComponent();

      if (shouldUpdateReactComponent(prevRenderedElement, nextRenderedElement)) {
        ReactReconciler.receiveComponent(prevComponentInstance, nextRenderedElement, transaction, this._processChildContext(context));
      } else {
        var oldHostNode = ReactReconciler.getHostNode(prevComponentInstance);
        ReactReconciler.unmountComponent(prevComponentInstance, false);
        var nodeType = ReactNodeTypes.getType(nextRenderedElement);
        this._renderedNodeType = nodeType;

        var child = this._instantiateReactComponent(nextReanderedElement);

        this._renderedComponent = child;
        var nextMarkup = ReactReconciler.mountComponent(child, transaction, this._hostParent, this._hostContainerInfo, this._processChildContext(context));

        this._replaceNodeWithMarkup(oldHostNode, nextMarkup, prevComponentInstance);
      }
    },
    _renderValidatedComponent: function _renderValidatedComponent() {
      var renderedElement;
      renderedElement = this._renderValidatedComponentWithoutOwnerOrContext();
      return renderedElement;
    },
    _renderValidatedComponentWithoutOwnerOrContext: function _renderValidatedComponentWithoutOwnerOrContext() {
      var inst = this._instance;
      var renderedElement;
      renderedElement = inst.render();
      return renderedElement;
    },
    _processContext: function _processContext(context) {
      var maskedContext = this._maskContext(context);

      return maskedContext;
    },
    _processChildContext: function _processChildContext(_currentContext) {
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
    _maskContext: function _maskContext(context) {
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
    }
  }, _defineProperty(_ReactCompositeCompon, "_renderValidatedComponent", function _renderValidatedComponent() {
    var renderedElement;
    renderedElement = this._renderValidatedComponentWithoutOwnerOrContext();
    return renderedElement;
  }), _defineProperty(_ReactCompositeCompon, "_renderValidatedComponentWithoutOwnerOrContext", function _renderValidatedComponentWithoutOwnerOrContext() {
    var inst = this._instance;
    var renderedElement;
    renderedElement = inst.render();
    return renderedElement;
  }), _defineProperty(_ReactCompositeCompon, "_instantiateReactComponent", null), _ReactCompositeCompon);

  var ReactCompositeComponentWrapper = function ReactCompositeComponentWrapper(element) {
    _classCallCheck(this, ReactCompositeComponentWrapper);

    this.construct(element);
  };

  Object.assign(ReactCompositeComponentWrapper.prototype, ReactCompositeComponent, {
    _instantiateReactComponent: instantiateReactComponent
  });

  function isInternalComponentType(type) {
    return typeof type === 'function' && _typeof(type.prototype) !== undefined && typeof type.prototype.mountComponent === 'function' && typeof type.prototype.receiveComponent === 'function';
  }

  function instantiateReactComponent(element) {
    /*
      according to element.type to render ReactComponent, use ReactHostComponent
      var element = {
        'div',
        {
          style: {color: 'red'}
        }
      };
      or
      var element = 'hello world'
    */
    var instance;

    if (_typeof(element) == 'object') {
      var type = element.type;

      if (typeof type === 'string') {
        // create internal component like div, span
        instance = ReactHostComponent.createInternalComponent(element);
      } else if (isInternalComponentType(type)) {
        // is ReactComponent
        instance = new element.type(element);
      } else {
        instance = new ReactCompositeComponentWrapper(element);
      }
    } else if (typeof element === 'string' || typeof element === 'number') {
      instance = ReactHostComponent.createInstanceForText(element);
    } else {
      instance = null;
    }

    return instance;
  }

  function instantiateChild(childInstances, child, name) {
    if (child != null) {
      childInstances[name] = instantiateReactComponent(child);
    }
  }

  var ReactChildReconciler = {
    instantiateChildren: function instantiateChildren(nestedChildNodes) {
      if (nestedChildNodes == null) return null;
      var childInstances = {};
      traverseAllChildren(nestedChildNodes, instantiateChild, childInstances);
      return childInstances;
    },
    updateChildren: function updateChildren(prevChildren, nextChildren, mountImages, removedNodes, transaction, hostParent, hostContainerInfo, context) {
      if (!nextChildren && !prevChildren) {
        return;
      }

      var name;
      var prevChild;

      for (name in nextChildren) {
        if (!nextChildren.hasOwnProperty(name)) {
          continue;
        }

        prevChild = prevChildren && prevChildren[name];
        var prevElement = prevChild && prevChild._currentElement;
        var nextElement = nextChildren[name];

        if (prevChild != null && shouldUpdateReactComponent(prevElement, nextElement)) {
          ReactReconciler.receiveComponent(prevChild, nextElement, transaction, context);
          nextChildren[name] = prevChild;
        } else {
          if (prevChild) {
            removedNodes[name] = ReactReconciler.getHostNode(prevChild);
            ReactReconciler.unmountComponent(prevChild, false);
          }

          var nextChildInstance = instantiateReactComponent(nextElement);
          nextChildren[name] = nextChildInstance;
          var nextChildMountImage = ReactReconciler.mountComponent(nextChildInstance, transaction, hostParent, hostContainerInfo, context);
          mountImages.push(nextChildMountImage);
        }
      }

      for (name in prevChildren) {
        if (prevChildren.hasOwnProperty(name) && !(nextChildren && nextChildren.hasOwnProperty(name))) {
          prevChild = prevChildren[name];
          removedNodes[name] = ReactReconciler.getHostNode(prevChild);
          ReactReconciler.unmountComponent(prevChild, false);
        }
      }
    },
    unmountChildren: function unmountChildren(renderedChildren, safely) {
      for (var name in renderedChildren) {
        if (renderedChildren.hasOwnProperty(name)) {
          var renderedChild = renderedChildren[name];
          ReactReconciler.unmountComponent(renderedChild, safely);
        }
      }
    }
  };

  function flattenSingleChildIntoContext(traverseContext, child, name) {
    if (traverseContext && _typeof(traverseContext) === 'object') {
      var result = traverseContext;
      var keyUnique = result[name] === undefined;

      if (keyUnique && child != null) {
        result[name] = child;
      }
    }
  }

  function flattenChildren(children) {
    var result = {};
    traverseAllChildren(children, flattenSingleChildIntoContext, result);
    return result;
  }

  function enqueue(queue, update) {
    if (update) {
      queue = queue || [];
      queue.push(update);
    }

    return queue;
  }

  function makeMove(child, afterNode, toIndex) {
    return {
      type: 'MOVE_EXISTING',
      content: null,
      fromIndex: child._mountIndex,
      fromNode: ReactReconciler.getHostNode(child),
      toIndex: toIndex,
      afterNod: afterNod
    };
  }

  function makeRemove(child, node) {
    return {
      type: 'REMOVE_NODE',
      content: null,
      fromIndex: child._mountIndex,
      fromNode: node,
      toIndex: null,
      afterNode: null
    };
  }

  function processQueue(inst, updateQueue) {
    ReactComponentEnvironment.processChildrenUpdates(inst, updateQueue);
  }

  function makeInsertMarkup(markup, afterNode, toIndex) {
    return {
      type: 'INSERT_MARKUP',
      content: markup,
      fromIndex: null,
      fromNode: null,
      toIndex: toIndex,
      afterNode: afterNode
    };
  }

  var ReactMultiChild = {
    Mixin: {
      mountChildren: function mountChildren(nestedChildren, transaction, context) {
        var children = this._reconcilerInstantiateChildren(nestedChildren);

        this._renderedChildren = children;
        var mountImages = [];

        for (var name in children) {
          if (children.hasOwnProperty(name)) {
            var child = children[name];
            var mountImage = ReactReconciler.mountComponent(child, transaction, this, this._hostContainerInfo, context);
            mountImages.push(mountImage);
          }
        }

        return mountImages;
      },
      updateChildren: function updateChildren(nextNestedChildrenElements, transaction, context) {
        this._updateChildren(nextNestedChildrenElements, transaction, context);
      },
      unmountChildren: function unmountChildren(safely) {
        var _renderedChildren = this._renderedChildren;
        ReactChildReconciler.unmountChildren(_renderedChildren, safely);
        this._renderedChildren = null;
      },
      moveChild: function moveChild(child, afterNode, toIndex, lastIndex) {
        if (child._mountIndex < lastIndex) {
          return makeMove(child, afterNode, toIndex);
        }
      },
      removeChild: function removeChild(child, node) {
        return makeRemove(child, node);
      },
      _updateChildren: function _updateChildren(nextNestedChildrenElements, transaction, context) {
        var prevChildren = this._renderedChildren;
        var removedNodes = {};
        var mountImages = [];

        var nextChildren = this._reconcilerUpdateChildren(prevChildren, nextNestedChildrenElements, mountImages, removedNodes, transaction, context);

        if (!nextChildren && !prevChildren) {
          return;
        }

        var updates = null;
        var name;
        var nextIndex = 0;
        var lastIndex = 0;
        var nextMountIndex = 0;
        var lastPlacedNode = null;

        for (name in nextChildren) {
          if (!nextChildren.hasOwnProperty(name)) {
            continue;
          }

          var prevChild = prevChildren && prevChildren[name];
          var nextChild = nextChildren[name];

          if (prevChild === nextChild) {
            updates = enqueue(updates, this.moveChild(prevChild, lastPlacedNode, nextIndex, lastIndex));
            lastIndex = Math.max(prevChild._mountIndex, lastIndex);
            prevChild._mountIndex = nextIndex;
          } else {
            if (prevChild) {
              lastIndex = Math.max(prevChild._mountIndex, lastIndex);
            }

            updates = enqueue(updates, this._mountChildAtIndex(nextChild, mountImages[nextMountIndex], lastPlacedNode, nextIndex, transaction, context));
            nextMountIndex++;
          }

          nextIndex++;
          lastPlacedNode = ReactReconciler.getHostNode(nextChild);
        }

        for (name in removedNodes) {
          if (removedNodes.hasOwnProperty(name)) {
            updates = enqueue(updates, this._unmountChild(prevChildren[name], removedNodes[name]));
          }
        }

        if (updates) {
          processQueue(this, updates);
        }

        this._renderedChildren = nextChildren;
      },
      _reconcilerUpdateChildren: function _reconcilerUpdateChildren(prevChildren, nextNestedChildrenElements, mountImages, removedNodes, transaction, context) {
        var nextChildren;
        nextChildren = flattenChildren(nextNestedChildrenElements);
        ReactChildReconciler.updateChildren(prevChildren, nextChildren, mountImages, removedNodes, transaction, this, this._hostContainerInfo, context);
        return nextChildren;
      },
      _reconcilerInstantiateChildren: function _reconcilerInstantiateChildren(nestedChildren) {
        return ReactChildReconciler.instantiateChildren(nestedChildren);
      },
      _mountChildAtIndex: function _mountChildAtIndex(child, mountImage, afterNode, index, transaction, context) {
        child._mountIndex = index;
        return this.createChild(child, afterNode, mountImage);
      },
      createChild: function createChild(child, afterNode, mountImage) {
        return makeInsertMarkup(mountImage, afterNode, child._mountIndex);
      },
      _unmountChild: function _unmountChild(child, node) {
        var update = this.removeChild(child, node);
        child._mountIndex = null;
        return update;
      }
    }
  };

  var internalInstanceKey = '__reactInternalInstance$' + Math.random().toString(36).slice(2);
  var ATTR_NAME = DOMProperty.ID_ATTRIBUTE_NAME;

  function shouldPrecacheNode(node, nodeID) {
    return node.nodeType === 1 && node.getAttribute(ATTR_NAME) === String(nodeID) || node.nodeType === 8 && node.nodeValue === ' react-text: ' + nodeID + ' ' || node.nodeType === 8 && node.nodeValue === ' react-empty: ' + nodeID + ' ';
  }

  function precacheChildNode(inst, node) {
    var children = inst._renderedChildren;
    var childNode = node.firstChild;

    outer: for (var name in children) {
      if (!children.hasOwnProperty(name)) {
        continue;
      }

      var childInst = children[name];

      var childID = getRenderedHostOrTextFromComponent(childInst)._domID;

      for (; childNode !== null; childNode = childNode.nextSibling) {
        if (shouldPrecacheNode(childNode, childID)) {
          precacheNode(childInst, childNode);
          continue outer;
        }
      }
    }
  }

  function getNodeFromInstance(inst) {
    if (inst._hostNode) {
      return inst._hostNode;
    }

    var parents = [];

    while (!inst._hostNode) {
      parents.push(inst);
      inst = inst._hostParent;
    }

    for (; parents.length; inst = parents.pop()) {
      precacheChildNode(inst, inst._hostNode);
    }

    return inst._hostNode;
  }

  function getInstanceFromNode(node) {
    var inst = getClosetInstanceFromNode(node);

    if (inst != null && inst._hostNode === node) {
      return inst;
    } else {
      return null;
    }
  }

  function precacheNode(inst, node) {
    var hostInst = getRenderedHostOrTextFromComponent(inst);
    hostInst._hostNode = node;
  }

  function uncacheNode(inst) {
    var node = inst._hostNode;

    if (node) {
      delete node[internalInstanceKey];
      inst._hostNode = null;
    }
  }

  function getRenderedHostOrTextFromComponent(component) {
    var rendered;

    while (rendered = component._renderedComponent) {
      component = rendered;
    }

    return component;
  }

  var ReactDOMComponentTree$1 = {
    getNodeFromInstance: getNodeFromInstance,
    getInstanceFromNode: getInstanceFromNode,
    precacheNode: precacheNode,
    uncacheNode: uncacheNode
  };

  var setInnerHTML = function setInnerHTML(node, html) {
    node.innerHTML = html;
  };

  var setTextContent = function setTextContent(node, text) {
    if (text) {
      var firstChild = node.firstChild;

      if (firstChild && firstChild === node.lastChild && firstChild.nodeType === 3) {
        firstChild.nodeValue = text;
        return;
      }
    }

    node.textContent = text;
  };

  function toString() {
    return this.node.nodeName;
  }

  function insertTreeChildren(tree) {
    if (!enableLazy) {
      return;
    }

    var node = tree.node;
    var children = tree.children;

    if (children.length) {
      for (var i = 0; i < children.length; i++) {
        insertTreeBefore(node, children[i], null);
      }
    } else if (tree.html != null) {
      setInnerHTML(node, tree.html);
    } else if (tree.text != null) {
      setTextContent(node, tree.text);
    }
  }

  var insertTreeBefore = function insertTreeBefore(parentNode, tree, referenceNode) {
    parentNode.insertBefore(tree.node, referenceNode);
    insertTreeChildren(tree);
  };

  var enableLazy = typeof document !== 'undefined' && typeof document.documentMode === 'number' || typeof navigator !== 'undefined' && typeof navigator.userAgent === 'string' && /\bEdge\/\d/.test(navigator.userAgent);

  function queueChild(parentTree, childTree) {
    if (enableLazy) {
      parentTree.childTree.push(childTree);
    } else {
      parentTree.node.appendChild(childTree.node);
    }
  }

  function queueHTML(tree, html) {
    if (enableLazy) {
      tree.html = html;
    } else {
      setInnerHTML(tree.node, html);
    }
  }

  function queueText(tree, text) {
    if (enableLazy) {
      tree.text = text;
    } else {
      setTextContent(tree.node, text);
    }
  }

  function DOMLazyTree(node) {
    return {
      node: node,
      children: [],
      html: null,
      text: null,
      toString: toString
    };
  }
  DOMLazyTree.queueChild = queueChild;
  DOMLazyTree.queueHTML = queueHTML;
  DOMLazyTree.queueText = queueText;
  DOMLazyTree.insertTreeBefore = insertTreeBefore;

  var globalIdCounter = 1;
  var registrationNameModules = EventPluginRegistry.registrationNameModules;
  var getNode = ReactDOMComponentTree$1.getNodeFromInstance;
  var CONTENT_TYPES = {
    string: true,
    number: true
  };
  var RESERVED_PROPS$1 = {
    children: null,
    dangerouslySetInnerHTML: null,
    suppressContentEditableWarning: null
  };
  var deleteListener = EventPluginHub.deleteListener;

  function enqueuePutListener(inst, registrationName, listener) {
    EventPluginHub.putListener(inst, registrationName, listener);
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
    mountComponent: function mountComponent(transaction, hostParent, hostContainerInfo, context) {
      var props = this._currentElement.props;
      var mountImage;
      this._rootNodeID = globalIdCounter++;
      this._hostParent = hostParent;
      this._hostContainerInfo = hostContainerInfo;

      {
        var ownerDocument = hostContainerInfo._ownerDocument;
        var el;
        el = ownerDocument.createElement(this._currentElement.type);
        ReactDOMComponentTree$1.precacheNode(this, el);

        this._updateDOMProperties(null, props, transaction);

        var lazyTree = DOMLazyTree(el);

        this._createInitialChildren(transaction, props, context, lazyTree);

        mountImage = lazyTree;
      }

      return mountImage;
    },
    receiveComponent: function receiveComponent(nextElement, transaction, context) {
      var prevElement = this._currentElement;
      this._currentElement = nextElement;
      this.updateComponent(transaction, prevElement, nextElement, context);
    },
    updateComponent: function updateComponent(transaction, prevElement, nextElement, context) {
      var lastProps = prevElement;
      var nextProps = this._currentElement.props;

      this._updateDOMProperties(lastProps, nextProps, transaction);

      this._updateDOMChildren(lastProps, nextProps, transaction, context);
    },
    unmountComponent: function unmountComponent(safely) {
      this.unmountChildren(safely);
      ReactDOMComponentTree$1.uncacheNode(this);
      EventPluginHub.deleteAllListeners(this);
      this._domID = 0;
      this._wrapperState = null;
    },
    getHostNode: function getHostNode() {
      return getNode(this);
    },
    getPublicInstance: function getPublicInstance() {
      return getNode(this);
    },

    /**
     * @description 这步主要是创建开标签，然后将 DOM 标签的属性和相关事件句柄设置到开标签
     * @param {*} props
     */
    _createOpenTagMarkupAndPutListeners: function _createOpenTagMarkupAndPutListeners(props) {
      var ret = "<".concat(this._currentElement.type);

      for (var propKey in props) {
        if (!props.hasOwnProperty(propKey)) {
          continue;
        }

        var propValue = props[propKey];

        if (propValue == null) {
          continue;
        } // 绑定事件句柄


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
    _createContentMarkup: function _createContentMarkup(props) {
      var ret = '';
      var innerHTML = props.dangerouslySetInnerHTML;

      if (innerHTML != null) {
        if (innerHTML.__html != null) {
          ret = innerHTML.__html;
        }
      } else {
        var contentToUse = CONTENT_TYPES[_typeof(props.children)] ? props.children : null;
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
    _updateDOMProperties: function _updateDOMProperties(lastProps, nextProps, transaction) {
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
          if (!RESERVED_PROPS$1.hasOwnProperty(propKey)) {
            DOMPropertyOperations.deleteValueForAttribute(getNode(this), propKey);
          }
        } else if (DOMProperty.properties[propKey] || DOMProperty.isCustomAttribute(propKey)) {
          DOMPropertyOperations.deleteValueForProperty(getNode(this), propKey);
        }
      }

      for (propKey in nextProps) {
        var nextProp = nextProps[propKey];
        var lastProp = propKey === 'style' ? this._previousStyleCopy : lastProps != null ? lastProps[propKey] : undefined;

        if (!nextProps.hasOwnProperty(propKey) || nextProp === lastProp || nextProp == null && lastProp == null) {
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
              if (lastProp.hasOwnProperty(styleName) && (!nextProp || !nextProp.hasOwnProperty(styleName))) {
                styleUpdates = styleUpdates || {};
                styleUpdates[styleName] = '';
              }
            }

            for (styleName in nextProp) {
              if (nextProp.hasOwnProperty(styleName) && lastProp[styleName] !== nextProp[styleName]) {
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
            enqueuePutListener(this, propKey, nextProp);
          } else if (lastProp) {
            deleteListener(this, propKey);
          }
        } else if (isCustomComponent(this._tag, nextProps)) {
          // React Component
          if (!RESERVED_PROPS$1.hasOwnProperty(propKey)) {
            DOMPropertyOperations.setValueForAttribute(getNode(this), propKey, nextProp);
          }
        } else if (DOMProperty.properties[propKey] || DOMProperty.isCustomAttribute(propKey)) {
          var node = getNode(this);

          if (nextProp != null) {
            DOMPropertyOperations.setValueForProperty(node, propKey, nextProp);
          } else {
            DOMPropertyOperations.deleteValueForProperty(node, propKey);
          }
        }
      }

      if (styleUpdates) {
        CSSPropertyOperations.setValueForStyles(getNode(this), styleUpdates, this);
      }
    },
    _updateDOMChildren: function _updateDOMChildren(lastProps, nextProps, transaction, context) {
      var lastContent = CONTENT_TYPES[_typeof(lastProps.children)] ? lastProps.children : null;
      var nextContent = CONTENT_TYPES[_typeof(nextProps.children)] ? nextProps.children : null;
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
    _createInitialChildren: function _createInitialChildren(transaction, props, context, lazyTree) {
      var innerHTML = props.dangerouslySetInnerHTML;

      if (innerHTML != null) {
        if (innerHTML.__html != null) {
          DOMLazyTree.queueHTML(lazyTree, innerHTML.__html);
        }
      } else {
        var contentToUse = CONTENT_TYPES[_typeof(props.children)] ? props.children : null;
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
  Object.assign(ReactDOMComponent.prototype, ReactDOMComponent.Mixin, ReactMultiChild.Mixin);

  var ReactDOMTextComponent =
  /*#__PURE__*/
  function () {
    function ReactDOMTextComponent(text) {
      _classCallCheck(this, ReactDOMTextComponent);

      this._currentElement = text;
      this._stringText = '' + text;
      this._hostNode = null;
      this._hostParent = null;
    }

    _createClass(ReactDOMTextComponent, [{
      key: "mountComponent",
      value: function mountComponent(transaction, hostParent, hostContainerInfo, context) {
        this._hostParent = hostParent;
        var domID = hostContainerInfo._idCounter++;
        var openingValue = ' react-text: ' + domID + ' ';
        var closingValue = ' /react-text ';
        this._domID = domID;

        {
          var ownerDocument = hostContainerInfo._ownerDocument;
          var openingComment = ownerDocument.createComment(openingValue);
          var closingComment = ownerDocument.createComment(closingValue);
          var lazyTree = DOMLazyTree(ownerDocument.createDocumentFragment());
          DOMLazyTree.queueChild(lazyTree, DOMLazyTree(openingComment));

          if (this._stringText) {
            DOMLazyTree.queueChild(lazyTree, DOMLazyTree(ownerDocument.createTextNode(this._stringText)));
          }

          DOMLazyTree.queueChild(lazyTree, DOMLazyTree(closingComment));
          ReactDOMComponentTree$1.precacheNode(this, openingComment);
          this._closingComment = closingComment;
          return lazyTree;
        }
      }
    }, {
      key: "receiveComponent",
      value: function receiveComponent(nextText, transaction) {
        if (nextText !== this._currentElement) {
          this._currentElement = nextText;
          var nextStringText = '' + nextText;

          if (nextStringText !== this._stringText) {
            this._stringText = nextStringText;
            DOMChildrenOperations.replaceDelimitedText(nextStringText);
          }
        }
      }
    }, {
      key: "getHostNode",
      value: function getHostNode() {
        var hostNode = this._commentNodes;

        if (hostNode) {
          return hostNode;
        }

        if (!this._closingComment) {
          var openingComment = ReactDOMComponentTree$1.getNodeFromInstance(this);
          var node = openingComment.nextSibing;

          while (true) {
            if (node.nodeType === 8 && node.nodeValue === ' /react-text ') {
              this._closingComment = node;
              break;
            }

            node = node.nextSibing;
          }
        }

        hostNode = [this._hostNode, this._closingComment];
        this._commentNodes = hostNode;
        return hostNode;
      }
    }, {
      key: "unmountComponent",
      value: function unmountComponent() {
        this._closingComment = null;
        this._commentNodes = null;
        ReactDOMComponentTree$1.uncacheNode(this);
      }
    }]);

    return ReactDOMTextComponent;
  }();

  var FLUSH_BATCHED_UPDATES = {
    initialize: function initialize() {},
    close: ReactUpdates.flushBatchedUpdates.bind(ReactUpdates)
  };
  var RESET_BATCHED_UPDATES = {
    initialize: function initialize() {},
    close: function close() {
      ReactDefaultBatchingStrategy.isBatchingUpdates = false;
    }
  };
  var TRANSACTION_WRAPPERS$1 = [FLUSH_BATCHED_UPDATES, RESET_BATCHED_UPDATES];

  function ReactDefaultBatchingStrategyTransaction() {
    this.reinitializeTransaction();
  }

  Object.assign(ReactDefaultBatchingStrategyTransaction.prototype, Transaction, {
    getTransactionWrappers: function getTransactionWrappers() {
      return TRANSACTION_WRAPPERS$1;
    }
  });
  var transaction = new ReactDefaultBatchingStrategyTransaction();
  var ReactDefaultBatchingStrategy = {
    isBatchingUpdates: false,
    batchedUpdates: function batchedUpdates(callback, a, b, c, d, e) {
      var alreadyBatchingUpdates = ReactDefaultBatchingStrategy.isBatchingUpdates;
      ReactDefaultBatchingStrategy.isBatchingUpdates = true;

      if (alreadyBatchingUpdates) {
        return callback(a, b, c, d, e);
      } else {
        return transaction.perform(callback, null, a, b, c, d, e);
      }
    }
  };

  var EventListener = {
    listen: function listen(target, eventType, callback) {
      if (target.addEventListener) {
        target.addEventListener(eventType, callback, false);
        return {
          remove: function remove() {
            target.removeEventListener(eventType, callback, false);
          }
        };
      } else if (target.attachEvent) {
        target.attachEvent('on' + eventType, callback);
        return {
          remove: function remove() {
            target.detachEvent('on' + eventType, callback);
          }
        };
      }
    },
    capture: function capture(target, eventType, callback) {
      if (target.addEventListener) {
        target.addEventListener(eventType, callback, true);
        return {
          remove: function remove() {
            target.removeEventListener(eventType, callback, true);
          }
        };
      } else {
        return {
          remove: function remove() {}
        };
      }
    }
  };

  var eventTypes = {};
  var onClickListeners = {};
  ['abort', 'animationEnd', 'animationIteration', 'animationStart', 'blur', 'canPlay', 'canPlayThrough', 'click', 'contextMenu', 'copy', 'cut', 'doubleClick', 'drag', 'dragEnd', 'dragEnter', 'dragExit', 'dragLeave', 'dragOver', 'dragStart', 'drop', 'durationChange', 'emptied', 'encrypted', 'ended', 'error', 'focus', 'input', 'invalid', 'keyDown', 'keyPress', 'keyUp', 'load', 'loadedData', 'loadedMetadata', 'loadStart', 'mouseDown', 'mouseMove', 'mouseOut', 'mouseOver', 'mouseUp', 'paste', 'pause', 'play', 'playing', 'progress', 'rateChange', 'reset', 'scroll', 'seeked', 'seeking', 'stalled', 'submit', 'suspend', 'timeUpdate', 'touchCancel', 'touchEnd', 'touchMove', 'touchStart', 'transitionEnd', 'volumeChange', 'waiting', 'wheel'].forEach(function (event) {
    var capitalizedEvent = event[0].toUpperCase() + event.slice(1);
    var onEvent = 'on' + capitalizedEvent;
    var topEvent = 'top' + capitalizedEvent;
    var type = {
      phasedRegistrationNames: {
        bubbled: onEvent,
        captured: onEvent + 'Capture'
      },
      dependencies: [topEvent]
    };
    eventTypes[event] = type;
  });

  function getDictionaryKey$1(inst) {
    return '.' + inst._rootNodeID;
  }

  function isInteractive(tag) {
    return tag === 'button' || tag === 'input' || tag === 'select' || tag === 'textarea';
  }

  var SimpleEventPlugin = {
    eventTypes: eventTypes,
    didPutListener: function didPutListener(inst, registrationName, listener) {
      if (registrationName === 'onClick' && !isInteractive(inst._tag)) {
        var key = getDictionaryKey$1(inst);
        var node = ReactDOMComponentTree$1.getNodeFromInstance(inst);

        if (!onClickListeners[key]) {
          onClickListeners[key] = EventListener.listen(node, 'click', listener);
        }
      }
    },
    willDeleteListener: function willDeleteListener(inst, registrationName) {
      if (registrationName === 'onClick' && !isInteractive(inst._tag)) {
        var key = getDictionaryKey$1(inst);
        onClickListeners[key].remove();
        delete onClickListeners[key];
      }
    }
  };

  var EnterLeaveEventPlugin = {};

  var eventTypes$1 = {
    change: {
      phasedRegistrationNames: {
        bubbled: 'onChange',
        captured: 'onChangeCapture'
      },
      dependencies: ['topBlur', 'topChange', 'topClick', 'topFocus', 'topInput', 'topKeyDown', 'topKeyUp', 'topSelectionChange']
    }
  };
  var ChangeEventPlugin = {
    eventTypes: eventTypes$1
  };

  var SelectEventPlugin = {};

  var BeforeInputEventPlugin = {};

  var DefaultEventPluginOrder = ['ResponderEventPlugin', 'SimpleEventPlugin', 'TapEventPlugin', 'EnterLeaveEventPlugin', 'ChangeEventPlugin', 'SelectEventPlugin', 'BeforeInputEventPlugin'];

  var ARIADOMPropertyConfig = {
    Properties: {
      // Global States and Properties
      'aria-current': 0,
      // state
      'aria-details': 0,
      'aria-disabled': 0,
      // state
      'aria-hidden': 0,
      // state
      'aria-invalid': 0,
      // state
      'aria-keyshortcuts': 0,
      'aria-label': 0,
      'aria-roledescription': 0,
      // Widget Attributes
      'aria-autocomplete': 0,
      'aria-checked': 0,
      'aria-expanded': 0,
      'aria-haspopup': 0,
      'aria-level': 0,
      'aria-modal': 0,
      'aria-multiline': 0,
      'aria-multiselectable': 0,
      'aria-orientation': 0,
      'aria-placeholder': 0,
      'aria-pressed': 0,
      'aria-readonly': 0,
      'aria-required': 0,
      'aria-selected': 0,
      'aria-sort': 0,
      'aria-valuemax': 0,
      'aria-valuemin': 0,
      'aria-valuenow': 0,
      'aria-valuetext': 0,
      // Live Region Attributes
      'aria-atomic': 0,
      'aria-busy': 0,
      'aria-live': 0,
      'aria-relevant': 0,
      // Drag-and-Drop Attributes
      'aria-dropeffect': 0,
      'aria-grabbed': 0,
      // Relationship Attributes
      'aria-activedescendant': 0,
      'aria-colcount': 0,
      'aria-colindex': 0,
      'aria-colspan': 0,
      'aria-controls': 0,
      'aria-describedby': 0,
      'aria-errormessage': 0,
      'aria-flowto': 0,
      'aria-labelledby': 0,
      'aria-owns': 0,
      'aria-posinset': 0,
      'aria-rowcount': 0,
      'aria-rowindex': 0,
      'aria-rowspan': 0,
      'aria-setsize': 0
    },
    DOMAttributeNames: {},
    DOMPropertyNames: {}
  };

  var MUST_USE_PROPERTY = DOMProperty.injection.MUST_USE_PROPERTY;
  var HAS_BOOLEAN_VALUE = DOMProperty.injection.HAS_BOOLEAN_VALUE;
  var HTMLDOMPropertyConfig = {
    isCustomAttribute: RegExp.prototype.test.bind(new RegExp("^(data|aria)-[".concat(DOMProperty.ATTRIBUTE_NAME_CHAR, "]*\n    $"))),
    Properties: {
      accept: 0,
      // input
      acceptCharset: 0,
      // form
      accessKey: 0,
      action: 0,
      allowFullScreen: HAS_BOOLEAN_VALUE,
      alt: 0,
      as: 0,
      async: HAS_BOOLEAN_VALUE,
      autoComplete: 0,
      autoPlay: HAS_BOOLEAN_VALUE,
      capture: HAS_BOOLEAN_VALUE,
      cellPadding: 0,
      cellSpacing: 0,
      charSet: 0,
      challenge: 0,
      checked: MUST_USE_PROPERTY | HAS_BOOLEAN_VALUE,
      cite: 0,
      classID: 0,
      className: 0,
      cols: 0,
      colSpan: 0,
      content: 0,
      contentEditable: 0,
      contextMenu: 0,
      controls: HAS_BOOLEAN_VALUE,
      coords: 0,
      // @toview
      crossOrigin: 0,
      data: 0,
      dataTime: 0,
      "default": HAS_BOOLEAN_VALUE,
      defer: HAS_BOOLEAN_VALUE,
      dir: 0,
      disabled: HAS_BOOLEAN_VALUE,
      download: 0,
      draggable: 0,
      encType: 0,
      form: 0,
      formAction: 0,
      formEncType: 0,
      formMethod: 0,
      formNoValidate: HAS_BOOLEAN_VALUE,
      formTarget: 0,
      frameBorder: 0,
      headers: 0,
      height: 0,
      hidden: HAS_BOOLEAN_VALUE,
      high: 0,
      href: 0,
      hrefLang: 0,
      htmlFor: 0,
      httpEquiv: 0,
      icon: 0,
      id: 0,
      keyParams: 0,
      keyType: 0,
      kind: 0,
      label: 0,
      lang: 0,
      list: 0,
      loop: HAS_BOOLEAN_VALUE,
      low: 0,
      manifest: 0,
      marginHeight: 0,
      marginWidth: 0,
      max: 0,
      maxLength: 0,
      media: 0,
      mediaGroup: 0,
      method: 0,
      min: 0,
      minLength: 0,
      multiple: MUST_USE_PROPERTY | HAS_BOOLEAN_VALUE,
      muted: MUST_USE_PROPERTY | HAS_BOOLEAN_VALUE,
      name: 0,
      nonce: 0,
      noValidate: HAS_BOOLEAN_VALUE,
      open: HAS_BOOLEAN_VALUE,
      optimum: 0,
      pattern: 0,
      placeholder: 0,
      playsInline: HAS_BOOLEAN_VALUE,
      poster: 0,
      preload: 0,
      profile: 0,
      radioGroup: 0,
      readOnly: HAS_BOOLEAN_VALUE,
      referrerPolicy: 0,
      rel: 0,
      required: HAS_BOOLEAN_VALUE,
      reversed: HAS_BOOLEAN_VALUE,
      role: 0,
      rows: 0,
      rowSpan: 0,
      sanbox: 0,
      scope: 0,
      soped: HAS_BOOLEAN_VALUE,
      scrolling: 0,
      seamless: HAS_BOOLEAN_VALUE,
      selected: MUST_USE_PROPERTY | HAS_BOOLEAN_VALUE,
      shape: 0,
      size: 0,
      sizes: 0,
      span: 0,
      spellCheck: 0,
      src: 0,
      srcDoc: 0,
      srcLang: 0,
      srcSet: 0,
      start: 0,
      step: 0,
      style: 0,
      summary: 0,
      tabIndex: 0,
      target: 0,
      title: 0,
      type: 0,
      useMap: 0,
      value: 0,
      width: 0,
      wmode: 0,
      wrap: 0,
      about: 0,
      datatype: 0,
      inlist: 0,
      prefix: 0,
      property: 0,
      resource: 0,
      "typeof": 0,
      vocab: 0,
      autoCapitalize: 0,
      autoCorrect: 0,
      autoSave: 0,
      color: 0,
      itemProp: 0,
      itemScope: HAS_BOOLEAN_VALUE,
      itemType: 0,
      itemID: 0,
      itemRef: 0,
      results: 0,
      security: 0,
      unselectable: 0
    },
    DOMAttributeNames: {
      acceptCharse: 'accept-charset',
      className: 'class',
      htmlFor: 'for',
      httpEquiv: 'http-equiv'
    },
    DOMPropertyNames: {}
  };

  var NS = {
    xlink: 'http://www.w3.org/1999/xlink',
    xml: 'http://www.w3.org/XML/1998/namespace'
  };
  var ATTRS = {
    accentHeight: 'accent-height',
    accumulate: 0,
    additive: 0,
    alignmentBaseline: 'alignment-baseline',
    allowReorder: 'allowReorder',
    alphabetic: 0,
    amplitude: 0,
    arabicForm: 'arabic-form',
    ascent: 0,
    attributeName: 'attributeName',
    attributeType: 'attributeType',
    autoReverse: 'autoReverse',
    azimuth: 0,
    baseFrequency: 'baseFrequency',
    baseProfile: 'baseProfile',
    baselineShift: 'baseline-shift',
    bbox: 0,
    begin: 0,
    bias: 0,
    by: 0,
    calcMode: 'calcMode',
    capHeight: 'cap-height',
    clip: 0,
    clipPath: 'clip-path',
    clipRule: 'clip-rule',
    clipPathUnits: 'clipPathUnits',
    colorInterpolation: 'color-interpolation',
    colorInterpolationFilters: 'color-interpolation-filters',
    colorProfile: 'color-profile',
    colorRendering: 'color-rendering',
    contentScriptType: 'contentScriptType',
    contentStyleType: 'contentStyleType',
    cursor: 0,
    cx: 0,
    cy: 0,
    d: 0,
    decelerate: 0,
    descent: 0,
    diffuseConstant: 'diffuseConstant',
    direction: 0,
    display: 0,
    divisor: 0,
    dominantBaseline: 'dominant-baseline',
    dur: 0,
    dx: 0,
    dy: 0,
    edgeMode: 'edgeMode',
    elevation: 0,
    enableBackground: 'enable-background',
    end: 0,
    exponent: 0,
    externalResourcesRequired: 'externalResourcesRequired',
    fill: 0,
    fillOpacity: 'fill-opacity',
    fillRule: 'fill-rule',
    filter: 0,
    filterRes: 'filterRes',
    filterUnits: 'filterUnits',
    floodColor: 'flood-color',
    floodOpacity: 'flood-opacity',
    focusable: 0,
    fontFamily: 'font-family',
    fontSize: 'font-size',
    fontSizeAdjust: 'font-size-adjust',
    fontStretch: 'font-stretch',
    fontStyle: 'font-style',
    fontVariant: 'font-variant',
    fontWeight: 'font-weight',
    format: 0,
    from: 0,
    fx: 0,
    fy: 0,
    g1: 0,
    g2: 0,
    glyphName: 'glyph-name',
    glyphOrientationHorizontal: 'glyph-orientation-horizontal',
    glyphOrientationVertical: 'glyph-orientation-vertical',
    glyphRef: 'glyphRef',
    gradientTransform: 'gradientTransform',
    gradientUnits: 'gradientUnits',
    hanging: 0,
    horizAdvX: 'horiz-adv-x',
    horizOriginX: 'horiz-origin-x',
    ideographic: 0,
    imageRendering: 'image-rendering',
    "in": 0,
    in2: 0,
    intercept: 0,
    k: 0,
    k1: 0,
    k2: 0,
    k3: 0,
    k4: 0,
    kernelMatrix: 'kernelMatrix',
    kernelUnitLength: 'kernelUnitLength',
    kerning: 0,
    keyPoints: 'keyPoints',
    keySplines: 'keySplines',
    keyTimes: 'keyTimes',
    lengthAdjust: 'lengthAdjust',
    letterSpacing: 'letter-spacing',
    lightingColor: 'lighting-color',
    limitingConeAngle: 'limitingConeAngle',
    local: 0,
    markerEnd: 'marker-end',
    markerMid: 'marker-mid',
    markerStart: 'marker-start',
    markerHeight: 'markerHeight',
    markerUnits: 'markerUnits',
    markerWidth: 'markerWidth',
    mask: 0,
    maskContentUnits: 'maskContentUnits',
    maskUnits: 'maskUnits',
    mathematical: 0,
    mode: 0,
    numOctaves: 'numOctaves',
    offset: 0,
    opacity: 0,
    operator: 0,
    order: 0,
    orient: 0,
    orientation: 0,
    origin: 0,
    overflow: 0,
    overlinePosition: 'overline-position',
    overlineThickness: 'overline-thickness',
    paintOrder: 'paint-order',
    panose1: 'panose-1',
    pathLength: 'pathLength',
    patternContentUnits: 'patternContentUnits',
    patternTransform: 'patternTransform',
    patternUnits: 'patternUnits',
    pointerEvents: 'pointer-events',
    points: 0,
    pointsAtX: 'pointsAtX',
    pointsAtY: 'pointsAtY',
    pointsAtZ: 'pointsAtZ',
    preserveAlpha: 'preserveAlpha',
    preserveAspectRatio: 'preserveAspectRatio',
    primitiveUnits: 'primitiveUnits',
    r: 0,
    radius: 0,
    refX: 'refX',
    refY: 'refY',
    renderingIntent: 'rendering-intent',
    repeatCount: 'repeatCount',
    repeatDur: 'repeatDur',
    requiredExtensions: 'requiredExtensions',
    requiredFeatures: 'requiredFeatures',
    restart: 0,
    result: 0,
    rotate: 0,
    rx: 0,
    ry: 0,
    scale: 0,
    seed: 0,
    shapeRendering: 'shape-rendering',
    slope: 0,
    spacing: 0,
    specularConstant: 'specularConstant',
    specularExponent: 'specularExponent',
    speed: 0,
    spreadMethod: 'spreadMethod',
    startOffset: 'startOffset',
    stdDeviation: 'stdDeviation',
    stemh: 0,
    stemv: 0,
    stitchTiles: 'stitchTiles',
    stopColor: 'stop-color',
    stopOpacity: 'stop-opacity',
    strikethroughPosition: 'strikethrough-position',
    strikethroughThickness: 'strikethrough-thickness',
    string: 0,
    stroke: 0,
    strokeDasharray: 'stroke-dasharray',
    strokeDashoffset: 'stroke-dashoffset',
    strokeLinecap: 'stroke-linecap',
    strokeLinejoin: 'stroke-linejoin',
    strokeMiterlimit: 'stroke-miterlimit',
    strokeOpacity: 'stroke-opacity',
    strokeWidth: 'stroke-width',
    surfaceScale: 'surfaceScale',
    systemLanguage: 'systemLanguage',
    tableValues: 'tableValues',
    targetX: 'targetX',
    targetY: 'targetY',
    textAnchor: 'text-anchor',
    textDecoration: 'text-decoration',
    textRendering: 'text-rendering',
    textLength: 'textLength',
    to: 0,
    transform: 0,
    u1: 0,
    u2: 0,
    underlinePosition: 'underline-position',
    underlineThickness: 'underline-thickness',
    unicode: 0,
    unicodeBidi: 'unicode-bidi',
    unicodeRange: 'unicode-range',
    unitsPerEm: 'units-per-em',
    vAlphabetic: 'v-alphabetic',
    vHanging: 'v-hanging',
    vIdeographic: 'v-ideographic',
    vMathematical: 'v-mathematical',
    values: 0,
    vectorEffect: 'vector-effect',
    version: 0,
    vertAdvY: 'vert-adv-y',
    vertOriginX: 'vert-origin-x',
    vertOriginY: 'vert-origin-y',
    viewBox: 'viewBox',
    viewTarget: 'viewTarget',
    visibility: 0,
    widths: 0,
    wordSpacing: 'word-spacing',
    writingMode: 'writing-mode',
    x: 0,
    xHeight: 'x-height',
    x1: 0,
    x2: 0,
    xChannelSelector: 'xChannelSelector',
    xlinkActuate: 'xlink:actuate',
    xlinkArcrole: 'xlink:arcrole',
    xlinkHref: 'xlink:href',
    xlinkRole: 'xlink:role',
    xlinkShow: 'xlink:show',
    xlinkTitle: 'xlink:title',
    xlinkType: 'xlink:type',
    xmlBase: 'xml:base',
    xmlns: 0,
    xmlnsXlink: 'xmlns:xlink',
    xmlLang: 'xml:lang',
    xmlSpace: 'xml:space',
    y: 0,
    y1: 0,
    y2: 0,
    yChannelSelector: 'yChannelSelector',
    z: 0,
    zoomAndPan: 'zoomAndPan'
  };
  var SVGDOMPropertyConfig = {
    Properties: {},
    DOMAttributeNamespaces: {
      xlinkActuate: NS.xlink,
      xlinkArcrole: NS.xlink,
      xlinkHref: NS.xlink,
      xlinkRole: NS.xlink,
      xlinkShow: NS.xlink,
      xlinkTitle: NS.xlink,
      xlinkType: NS.xlink,
      xmlBase: NS.xml,
      xmlLang: NS.xml,
      xmlSpace: NS.xml
    },
    DOMAttributeNames: {}
  };
  Object.keys(ATTRS).forEach(function (key) {
    SVGDOMPropertyConfig.Properties[key] = 0;

    if (ATTRS[key]) {
      SVGDOMPropertyConfig.DOMAttributeNames[key] = ATTRS[key];
    }
  });

  function getInternalInstanceReadyForUpdate(publicInstance, callerName) {
    var internalInstance = ReactInstanceMap.get(publicInstance);

    if (!internalInstance) {
      return null;
    }

    return internalInstance;
  }

  function enqueueUpdate$1(internalInstance) {
    ReactUpdates.enqueueUpdate(internalInstance);
  }

  var ReactUpdateQueue = {
    enqueueSetState: function enqueueSetState(publicInstance, partialState) {
      var internalInstance = getInternalInstanceReadyForUpdate(publicInstance);

      if (!internalInstance) {
        return;
      }

      var queue = internalInstance._pendingStateQueue || (internalInstance._pendingStateQueue = []);
      queue.push(partialState);
      enqueueUpdate$1(internalInstance);
    },
    enqueueElementInternal: function enqueueElementInternal(internalInstance, nextElement, nextContext) {
      internalInstance._pendingElement = nextElement;
      internalInstance._context = nextContext;
      enqueueUpdate$1(internalInstance);
    },
    enqueueCallbackInternal: function enqueueCallbackInternal(internalInstance, callback) {
      if (internalInstancer._pendingCallbacks) {
        internalInstance._pendingCallbacks.push(callback);
      } else {
        internalInstance._pendingCallbacks = [callback];
      }

      enqueueUpdate$1(internalInstance);
    }
  };

  var TRANSACTION_WRAPPERS$2 = [];

  function ReactReconcileTransaction(useCreateElement) {
    this.reinitializeTransaction();
    this.reactMountReady = CallbackQueue$1.getPooled(null);
    this.useCreateElement = useCreateElement;
  }

  var Mixin = {
    getTransactionWrappers: function getTransactionWrappers() {
      return TRANSACTION_WRAPPERS$2;
    },
    getReactMountReady: function getReactMountReady() {
      return this.reactMountReady;
    },
    getUpdateQueue: function getUpdateQueue() {
      return ReactUpdateQueue;
    },
    destructor: function destructor() {
      CallbackQueue$1.release(this.reactMountReady);
      this.reactMountReady = null;
    }
  };
  Object.assign(ReactReconcileTransaction.prototype, Transaction, Mixin);
  PooledClass.addPoolingTo(ReactReconcileTransaction);

  var insertChildAt = function insertChildAt(parentNode, childNode, referenceNode) {
    parentNode.insertBefore(childNode, referenceNode);
  };

  function getNodeAfter(parentNode, node) {
    if (Array.isArray(node)) {
      node = node[1];
    }

    return node ? node.nextSibling : parentNode.firstChild;
  }

  function insertLazyTreeChildAt(parentNode, childTree, referenceNode) {
    DOMLazyTree.insertTreeBefore(parentNode, childTree, referenceNode);
  }

  function moveChild(parentNode, childNode, referenceNode) {
    if (Array.isArray(childNode)) {
      moveDelimitedText(parentNode, childNode[0], childNode[1], referenceNode);
    } else {
      insertChildAt(parentNode, childNode, referenceNode);
    }
  }

  function removeChild(parentNode, childNode) {
    if (Array.isArray(childNode)) {
      var closingComment = childNode[1];
      childNode = childNode[0];
      removeDelimitedText(parentNode, childNode, closingComment);
      parentNode.removeChild(closingComment);
    }

    parentNode.removeChild(childNode);
  }

  function removeDelimitedText(parentNode, startNode, closingComment) {
    while (true) {
      var node = startNode.nextSibling;

      if (node === closingComment) {
        break;
      } else {
        parentNode.removeChild(node);
      }
    }
  }

  function replaceDelimitedText(openingComment, closingComment, stringText) {
    var parentNode = openingComment.parentNode;
    var nodeAfterComment = openingComment.nextSibling;

    if (nodeAfterComment === closingComment) {
      if (stringText) {
        insertChildAt(parentNode, document.createTextNode(stringText), nodeAfterComment);
      }
    } else {
      if (stringText) {
        setTextContent(nodeAfterComment, stringText);
        removeDelimitedText(parentNode, nodeAfterComment, closingComment);
      } else {
        removeDelimitedText(parentNode, openingComment, closingComment);
      }
    }
  }

  var DOMChildrenOperations$1 = {
    replaceDelimitedText: replaceDelimitedText,
    processUpdates: function processUpdates(parentNode, updates) {
      for (var k = 0; k < updates.length; k++) {
        var update = updates[k];

        switch (update.type) {
          case 'INSERT_MARKUP':
            insertLazyTreeChildAt(parentNode, update.content, getNodeAfter(parentNode, update.afterNode));
            break;

          case 'MOVE_EXISTING':
            moveChild(parentNode, update.fromNode, getNodeAfter(parentNode, update.afterNode));
            break;

          case 'SET_MARKUP':
            setInnerHTML(parentNode, update.content);
            break;

          case 'TEXT_CONTENT':
            setTextContent(parentNode, update.content);
            break;

          case 'REMOVE_NODE':
            removeChild(parentNode, update.fromNode);
            break;
        }
      }
    }
  };

  var ReactDOMIDOperations = {
    dangerouslyProcessChildrenUpdates: function dangerouslyProcessChildrenUpdates(parentInst, updates) {
      var node = ReactDOMComponentTree$1.getNodeFromInstance(parentInst);
      DOMChildrenOperations$1.processUpdates(node, updates);
    }
  };

  var ReactComponentBrowserEnvironment = {
    processChildrenUpdates: ReactDOMIDOperations.dangerouslyProcessChildrenUpdates
  };

  var alreadyInjected = false;
  var ReactDefaultInjection = {
    inject: function inject() {
      if (alreadyInjected) {
        return;
      }

      alreadyInjected = true;
      ReactInjection.EventPluginHub.injectEventPluginOrder(DefaultEventPluginOrder);
      ReactInjection.EventPluginHub.injectEventPluginsByName({
        SimpleEventPlugin: SimpleEventPlugin,
        EnterLeaveEventPlugin: EnterLeaveEventPlugin,
        ChangeEventPlugin: ChangeEventPlugin,
        SelectEventPlugin: SelectEventPlugin,
        BeforeInputEventPlugin: BeforeInputEventPlugin
      });
      ReactInjection.HostComponent.injectGenericComponentClass(ReactDOMComponent);
      ReactInjection.HostComponent.injectTextComponentClass(ReactDOMTextComponent);
      ReactInjection.Updates.injectReconcileTransaction(ReactReconcileTransaction);
      ReactInjection.Updates.injectBatchingStrategy(ReactDefaultBatchingStrategy);
      ReactInjection.Component.injectEnvironment(ReactComponentBrowserEnvironment);
      ReactInjection.DOMProperty.injectDOMPropertyConfig(ARIADOMPropertyConfig);
      ReactInjection.DOMProperty.injectDOMPropertyConfig(HTMLDOMPropertyConfig);
      ReactInjection.DOMProperty.injectDOMPropertyConfig(SVGDOMPropertyConfig);
    }
  };

  var DOC_NODE_TYPE = 9;

  function ReactDOMContainerInfo(topLevelWrapper, node) {
    var info = {
      _topLevelWrapper: topLevelWrapper,
      _ownerDocument: node ? node.nodeType === DOC_NODE_TYPE ? node : node.ownerDocument : null,
      _node: node,
      _tag: node ? node.nodeName.toLowerCase() : null,
      _namespaceURI: node ? node.namespaceURI : null
    };
    return info;
  }

  var DOC_NODE_TYPE$1 = 9;

  var TopLevelWrapper = function TopLevelWrapper() {};

  TopLevelWrapper.prototype.isReactComponent = {};

  TopLevelWrapper.prototype.render = function () {
    return this.props.child;
  };

  TopLevelWrapper.isReactTopLevelWrapper = true;

  function batchedMountComponentIntoNode(componentInstance, container, shouldReuseMarkup, context) {
    var transaction = ReactUpdates.ReactReconcileTransaction.getPooled(false);
    transaction.perform(mountComponentIntoNode, null, componentInstance, container, transaction, shouldReuseMarkup, context);
    ReactUpdates.ReactReconcileTransaction.release(transaction);
  }

  function getTopLevelWrapperInContainer(container) {
    var root = getHostRootInstanceInContainer(container);
    return root ? root._hostContainerInfo._topLevelWrapper : null;
  }

  function getHostRootInstanceInContainer(container) {
    var rootEl = getReactRootElementInContainer(container);
    var prevHostInstance = rootEl && ReactDOMComponentTree.getInstanceFromNode(rootEl);
    return prevHostInstance && !prevHostInstance._hostParent ? prevHostInstance : null;
  }

  function getReactRootElementInContainer(container) {
    if (!container) {
      return null;
    }

    if (container.nodeType === DOC_NODE_TYPE$1) {
      return container.documentElement;
    } else {
      return container.firstChild;
    }
  }

  function mountComponentIntoNode(wrapperInstance, container, transaction, shouldReuseMarkup, context) {
    var markup = ReactReconciler.mountComponent(wrapperInstance, transaction, null, ReactDOMContainerInfo(wrapperInstance, container), context, 0);
    wrapperInstance._renderedComponent = wrapperInstance;

    ReactMount._mountImageIntoNode(markup, container, wrapperInstance);
  }

  var ReactMount = {
    render: function render(nextElement, container, callback) {
      // 返回根组件实例
      return ReactMount._renderSubtreeIntoContainer(null, nextElement, container, callback);
    },
    _renderSubtreeIntoContainer: function _renderSubtreeIntoContainer(parentComponent, nextElement, container, callback) {
      // 将根 ReactElement 包裹在 TopLevelWrapper 组件
      var nextWrappedElement = React.createElement(TopLevelWrapper, {
        child: nextElement
      });
      var nextContext;

      if (parentComponent) {
        var parentInst = ReactInstanceMap.get(parentComponent);
        nextContext = parentInst._processChildContext(parentInst._context);
      } else {
        nextContext = {};
      }

      console.log('toplevel');
      var prevComponent = getTopLevelWrapperInContainer(container);

      if (prevComponent) {
        var prevWrappedElement = prevComponent._currentElement;
        var prevElement = prevWrappedElement.props.child;

        if (shouldUpdateReactComponent(prevElement, nextElement)) {
          var publicInst = prevComponent._renderedComponent.getPublicInstance();

          var updatedCallback = callback && function () {
            callback.call(publicInst);
          };

          ReactMount._updateRootComponent(prevComponent, nextWrappedElement, nextContext, container, updatedCallback);

          return publicInst;
        } else {
          ReactMount.unmountComponentAtNode(container);
        }
      }

      var component = ReactMount._renderNewRootComponent(nextWrappedElement, container);

      return component;
    },
    _updateRootComponent: function _updateRootComponent(prevComponent, nextElement, nextContext, container, callback) {
      ReactUpdateQueue.enqueueElementInternal(prevComponent, nextElement, nextContext);

      if (callback) {
        ReactUpdateQueue.enqueueCallbackInternal(prevComponent, callback);
      }

      return prevComponent;
    },
    _renderNewRootComponent: function _renderNewRootComponent(nextElement, container) {
      var componentInstance = instantiateReactComponent(nextElement); // batchedMountComponentIntoNode(componentInstance, container)

      ReactUpdates.batchedUpdates(batchedMountComponentIntoNode, componentInstance, container);
      return componentInstance;
    },
    _mountImageIntoNode: function _mountImageIntoNode(markup, container, instance) {
      {
        while (container.lastChild) {
          container.removeChild(container.lastChild);
        }

        DOMLazyTree.insertTreeBefore(container, markup, null);
      }
    }
  };

  ReactDefaultInjection.inject();
  var ReactDOM = {
    render: ReactMount.render
  };

  var Chord = {
    React: React,
    ReactDOM: ReactDOM
  };
  window.Chord = Chord;
  window.React = React;
  window.ReactDOM = ReactDOM;

  return Chord;

}));
