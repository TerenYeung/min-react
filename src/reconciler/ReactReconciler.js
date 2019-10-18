import ReactRef from './ReactRef';

var ReactReconciler = {
  mountComponent(
    internalInstance,
    transaction,
    hostParent,
    hostContainerInfo,
    context,
  ) {
    var markup = internalInstance.mountComponent(
      transaction,
      hostParent,
      hostContainerInfo,
      context,
    );

    return markup;
  },
  receiveComponent(
    internalInstance,
    nextElement,
    transaction,
    context
  ) {
    var prevElement = internalInstance._currentElement;

    if (nextElement === prevElement && context === internalInstance._context) {
      return;
    }

    internalInstance.receiveComponent(
      nextElement,
      transaction,
      context
    );
  },
  performUpdateIfNecessary(
    internalInstance,
    transaction,
    updateBatchNumber
  ) {
    if (internalInstance._updateBatchNumber !== updateBatchNumber) {
      return;
    }

    internalInstance.performUpdateIfNecessary(transaction);
  },
  getHostNode(internalInstance) {
    return internalInstance.getHostNode();
  },
  unmountComponent(internalInstance, safely) {
    ReactRef.detachRefs(internalInstance, internalInstance._currentElement);
    internalInstance.unmountComponent(safely);
  }
}

export default ReactReconciler;
