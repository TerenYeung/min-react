var genericComponentClass = null;
var textComponentClass = null;

var ReactHostComponent = {
  createInternalComponent(element) {
    return new genericComponentClass(element);
  },
  createInstanceForText(text) {
    return new textComponentClass(text)
  },
  injection: {
    injectGenericComponentClass(componentClass) {
      genericComponentClass = componentClass;
    },
    injectTextComponentClass(componentClass) {
      textComponentClass = componentClass;
    }
  }
}

export default ReactHostComponent;
