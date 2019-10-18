
var injected = false;

var ReactComponentEnvironment = {
  processChildrenUpdates: null,
  injection: {
    injectEnvironment(environment) {
      ReactComponentEnvironment.processChildrenUpdates = environment.processChildrenUpdates;
      injected = true;
    }
  }
};

export default ReactComponentEnvironment;
