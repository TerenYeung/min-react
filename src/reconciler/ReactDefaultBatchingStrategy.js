import Transaction from '../shared/Transaction';
import ReactUpdates from '../reconciler/ReactUpdates';

var FLUSH_BATCHED_UPDATES = {
  initialize() {},
  close: ReactUpdates.flushBatchedUpdates.bind(ReactUpdates),
};

var RESET_BATCHED_UPDATES = {
  initialize() {},
  close() {
    ReactDefaultBatchingStrategy.isBatchingUpdates = false;
  }
}

var TRANSACTION_WRAPPERS = [
  FLUSH_BATCHED_UPDATES,
  RESET_BATCHED_UPDATES,
];

function ReactDefaultBatchingStrategyTransaction() {
  this.reinitializeTransaction();
}

Object.assign(
  ReactDefaultBatchingStrategyTransaction.prototype,
  Transaction,
  {
    getTransactionWrappers() {
      return TRANSACTION_WRAPPERS;
    }
  }
)


var transaction = new ReactDefaultBatchingStrategyTransaction();

var ReactDefaultBatchingStrategy = {
  isBatchingUpdates: false,
  batchedUpdates(callback, a, b, c, d, e) {
    var alreadyBatchingUpdates = ReactDefaultBatchingStrategy.isBatchingUpdates;

    ReactDefaultBatchingStrategy.isBatchingUpdates = true;

    if (alreadyBatchingUpdates) {
      return callback(a, b, c, d, e);
    } else {
      return transaction.perform(callback, null, a, b, c, d, e);
    }
  }
}

export default ReactDefaultBatchingStrategy;
