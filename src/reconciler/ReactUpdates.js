import PooledClass from '../shared/PooledClass';
import Transaction from '../shared/Transaction';
import CallbackQueue from '../shared/CallbackQueue';
import ReactReconciler from '../reconciler/ReactReconciler';

var batchingStrategy = null;
var dirtyComponents = [];
var updateBatchNumber = 0;


var ReactUpdatesInjection = {
  injectBatchingStrategy(_batchingStrategy) {
    batchingStrategy = _batchingStrategy;
  },
  injectReconcileTransaction(ReconcileTransaction) {
    ReactUpdates.ReactReconcileTransaction = ReconcileTransaction;
  }
}

var flushBatchedUpdates = function() {
  while(dirtyComponents.length) {
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

    var markerName;

    ReactReconciler.performUpdateIfNecessary(
      component,
      transaction.reconcileTransaction,
      updateBatchNumber,
    );

    if (callbacks) {
      for (var j = 0; j < callbacks.length; j++) {
        transaction.callbackQueue.enqueue(
          callbacks[j],
          component.getPublicInstance()
        );
      }
    }
  }
}

var NESTED_UPDATES = {
  initialize() {
    this.dirtyComponentsLength = dirtyComponents.length;
  },
  close() {
    if (this.dirtyComponentsLength !== dirtyComponents.length) {
      dirtyComponents.splice(0, this.dirtyComponentsLength);
      flushBatchedUpdates();
    } else {
      dirtyComponents.length = 0;
    }
  }
}

var UPDATE_QUEUEING = {
  initialize() {
    this.callbackQueue.reset();
  },
  close() {
    this.callbackQueue.notifyAll();
  }
}

var TRANSACTION_WRAPPERS = [
  NESTED_UPDATES,
  UPDATE_QUEUEING
];

function ReactUpdatesFlushTransaction() {
  this.reinitializeTransaction();
  this.dirtyComponentsLength = null;
  this.callbackQueue = CallbackQueue.getPooled();
  this.reconcileTransaction = ReactUpdates.ReactReconcileTransaction.getPooled(true);
}

Object.assign(
  ReactUpdatesFlushTransaction.prototype,
  Transaction,
  {
    getTransactionWrappers() {
      return TRANSACTION_WRAPPERS;
    },
    destructor() {
      this.dirtyComponentsLength = null;
      CallbackQueue.release(this.callbackQueue);
      this.callbackQueue = null;
      ReactUpdates.ReactReconcileTransaction.release(this.reconcileTransaction);
      this.reconcileTransaction = null;
    },
    perform(method, scope, a) {
      return Transaction.perform.call(
        this,
        this.reconcileTransaction.perform,
        this.reconcileTransaction,
        method,
        scope,
        a
      );
    }
  }
)

function enqueueUpdate(component) {
  if (!batchingStrategy.isBatchingUpdates) {
    // 如果第一次更新，则将状态锁 isBatchingUpdates = true
    batchingStrategy.batchedUpdates(enqueueUpdate, component);
    return;
  }

  // 然后将待更新的组件 push 到 dirtyComponents
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
  batchedUpdates,
  injection: ReactUpdatesInjection,
  enqueueUpdate,
  flushBatchedUpdates,
};

export default ReactUpdates;
