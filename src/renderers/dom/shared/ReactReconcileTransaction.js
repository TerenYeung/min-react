import ReactUpdateQueue from '../../../reconciler/ReactUpdateQueue';
import Transaction from '../../../shared/Transaction';
import PooledClass from '../../../shared/PooledClass';
import CallbackQueue from '../../../shared/CallbackQueue';

var TRANSACTION_WRAPPERS = [

];

function ReactReconcileTransaction(useCreateElement) {
  this.reinitializeTransaction();
  this.reactMountReady = CallbackQueue.getPooled(null);
  this.useCreateElement = useCreateElement;
}

var Mixin = {
  getTransactionWrappers() {
    return TRANSACTION_WRAPPERS;
  },
  getReactMountReady() {
    return this.reactMountReady;
  },
  getUpdateQueue() {
    return ReactUpdateQueue;
  },
  destructor() {
    CallbackQueue.release(this.reactMountReady);
    this.reactMountReady = null;
  }
};

Object.assign(ReactReconcileTransaction.prototype, Transaction, Mixin);

PooledClass.addPoolingTo(ReactReconcileTransaction);

export default ReactReconcileTransaction;
