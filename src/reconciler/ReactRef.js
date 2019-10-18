import ReactOwner from './ReactOwner';


var ReactRef = {};

function attachRef(ref, component, owner) {
  if (typeof ref === 'function') {
    ref(component.getPublicInstance());
  } else {
    ReactOwner.addComponentAsRefTo(
      component,
      ref,
      owner,
    );
  }
}

function detachRef(ref, component, owner) {
  if (typeof ref === 'function') {
    ref(null);
  } else {
    ReactOwner.removeComponentAsRefFrom(component, ref, owner);
  }
}

ReactRef.attachRefs = function(
  instance,
  element
) {
  if (element === null || typeof element !== 'object') {
    return;
  }

  var ref = element.ref;
  if (ref != null) {
    attachRef(ref, instance, element._owner);
  }
}

ReactRef.detachRefs = function(
  instance,
  element
) {
  if (element === null || typeof element !== 'object') {
    return;
  }

  var ref = element.ref;
  if (ref != null) {
    detachRef(ref, instance, element._owner);
  }
}

export default ReactRef;
