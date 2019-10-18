import EventPluginRegistry from "./EventPluginRegistry";

var getDictionaryKey = function(inst) {
  return '.' + inst._rootNodeID;
};

var listenerBank = {};

var EventPluginHub = {
  putListener(inst, registrationName, listener) {
    var key = getDictionaryKey(inst);
    var bankForRegistrationName = listenerBank[registrationName] || (listenerBank[registrationName] = {});
    bankForRegistrationName[key] = listener;

    var PluginModule = EventPluginRegistry.registrationNameModules[registrationName];

    if (PluginModule && PluginModule.didPutListener) {
      PluginModule.didPutListener(inst, registrationName, listener);
    }
  },
  deleteListener(inst, registrationName) {
    var PluginModule = EventPluginRegistry.registrationNameModules[registrationName];

    if (PluginModule && PluginModule.willDeleteListener) {
      PluginModule.willDeleteListener(inst, registrationName);
    }
  },
  deleteAllListeners(inst) {
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
    injectEventPluginsByName: EventPluginRegistry.injectEventPluginsByName,
  }
};

export default EventPluginHub;
