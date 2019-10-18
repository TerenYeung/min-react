import traverseAllChildren from '../shared/traverseAllChildren';
import instantiateReactComponent from '../reconciler/instantiateReactComponent';
import shouldUpdateReactComponent from '../shared/shouldUpdateReactComponent';
import ReactReconciler from '../reconciler/ReactReconciler';

function instantiateChild(childInstances, child, name) {
  if (child != null) {
    childInstances[name] = instantiateReactComponent(child, true);
  }
}

var ReactChildReconciler = {
  instantiateChildren(nestedChildNodes) {
    if (nestedChildNodes == null) return null;

    var childInstances = {};
    traverseAllChildren(nestedChildNodes, instantiateChild, childInstances);

    return childInstances;
  },
  updateChildren(
    prevChildren,
    nextChildren,
    mountImages,
    removedNodes,
    transaction,
    hostParent,
    hostContainerInfo,
    context,
  ) {
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

        var nextChildInstance = instantiateReactComponent(nextElement, true);
        nextChildren[name] = nextChildInstance;

        var nextChildMountImage = ReactReconciler.mountComponent(
          nextChildInstance,
          transaction,
          hostParent,
          hostContainerInfo,
          context
        );

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
  unmountChildren(
    renderedChildren,
    safely,
  ) {
    for (var name in renderedChildren) {
      if (renderedChildren.hasOwnProperty(name)) {
        var renderedChild = renderedChildren[name];
        ReactReconciler.unmountComponent(renderedChild, safely);
      }
    }
  }
};

export default ReactChildReconciler;
