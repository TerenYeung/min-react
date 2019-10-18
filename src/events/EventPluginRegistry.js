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
      publishEventForPlugin(
        publishedEvents[eventName],
        pluginModule,
        eventName,
      );
    }
  }
}

function publishEventForPlugin(
  dispatchConfig,
  pluginModule,
  eventName
) {
  EventPluginRegistry.eventNameDispatchConfigs[eventName] = dispatchConfig;

  var phasedRegistrationNames = dispatchConfig.phasedRegistrationNames;

  if (phasedRegistrationNames) {
    for (var phaseName in phasedRegistrationNames) {
      if (phasedRegistrationNames.hasOwnProperty(phaseName)) {
        var phasedRegistrationName = phasedRegistrationNames[phaseName];
        publishRegistrationName(
          phasedRegistrationName, // onEvent
          pluginModule, // SimpleEventPlugin
          eventName, // input
        );
      }
    }
    return true;
  } else if (dispatchConfig.registrationName) {
    publishRegistrationName(
      dispatchConfig.registrationName,
      pluginModule,
      eventName,
    );
  }
  return false;
}

function publishRegistrationName(
  registrationName,
  pluginModule,
  eventName,
) {
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
  injectEventPluginOrder(
    injectedEventPluginOrder
  ) {
    eventPluginOrder = Array.prototype.slice.call(injectedEventPluginOrder);
    recomputePluginOrdering();
  },
  injectEventPluginsByName(injectedNamesToPlugins) {
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

export default EventPluginRegistry;
