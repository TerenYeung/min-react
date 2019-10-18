import ReactHostComponent from '../reconciler/ReactHostComponent';
import ReactCompositeComponent from '../reconciler/ReactCompositeComponent';

class ReactCompositeComponentWrapper {
  constructor(element) {
    this.construct(element);
  }
}

Object.assign(
  ReactCompositeComponentWrapper.prototype,
  ReactCompositeComponent,
  {
    _instantiateReactComponent: instantiateReactComponent
  }
);

function isInternalComponentType(type) {
  return (
    typeof type === 'function' &&
    typeof type.prototype !== undefined &&
    typeof type.prototype.mountComponent === 'function' &&
    typeof type.prototype.receiveComponent === 'function'
  );
}

export default function instantiateReactComponent(element) {
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

  if (typeof element == 'object') {
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
