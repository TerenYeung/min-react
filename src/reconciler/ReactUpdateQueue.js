import ReactUpdates from './ReactUpdates';
import ReactInstanceMap from '../shared/ReactInstanceMap';

function getInternalInstanceReadyForUpdate(publicInstance, callerName) {
  var internalInstance = ReactInstanceMap.get(publicInstance);

  if (!internalInstance) {
    return null;
  }

  return internalInstance;
}

function enqueueUpdate(internalInstance) {
  ReactUpdates.enqueueUpdate(internalInstance);
}

var ReactUpdateQueue = {
  enqueueSetState(publicInstance, partialState) {
    var internalInstance = getInternalInstanceReadyForUpdate(publicInstance, 'setState');

    if (!internalInstance) {
      return;
    }

    var queue = internalInstance._pendingStateQueue || (internalInstance._pendingStateQueue = []);
    queue.push(partialState);

    enqueueUpdate(internalInstance);
  },
  enqueueElementInternal(
    internalInstance,
    nextElement,
    nextContext,
  ) {
    internalInstance._pendingElement = nextElement;
    internalInstance._context = nextContext;
    enqueueUpdate(internalInstance);
  },
  enqueueCallbackInternal(
    internalInstance,
    callback
  ) {
    if (internalInstancer._pendingCallbacks) {
      internalInstance._pendingCallbacks.push(callback);
    } else {
      internalInstance._pendingCallbacks = [callback];
    }

    enqueueUpdate(internalInstance);
  }
};

export default ReactUpdateQueue;
