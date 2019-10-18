var Transaction = {
  reinitializeTransaction() {
    this.transactionWrappers = this.getTransactionWrappers();
    if (this.wrapperInitData) {
      this.wrapperInitData.length = 0;
    } else {
      this.wrapperInitData = [];
    }

    this._isInTransaction = false;
  },
  _isInTransaction: false,
  getTransactionWrappers: null,
  isInTransaction() {
    return !!this._isInTransaction;
  },
  perform(method, scope, a, b, c, d, e, f) {
    var ret;

    try {
      this._isInTransaction = true;
      this.initializeAll(0);
      ret = method.call(scope, a, b, c, d, e, f);
    } finally {
      this.closeAll(0);
      this._isInTransaction = false;
    }

    return ret;
  },
  initializeAll(startIndex) {
    var transactionWrappers = this.transactionWrappers;

    for (var i = startIndex; i < transactionWrappers.length; i++) {
      var wrapper = transactionWrappers[i];

      try {
        this.wrapperInitData[i] = {};
        this.wrapperInitData[i] = wrapper.initialize ? wrapper.initialize.call(this) : null;
      } finally {
        if (this.wrapperInitData[i] === {}) {
          this.initializeAll(i + 1);
        }
      }
    }
  },
  closeAll(startIndex) {
    var transactionWrappers = this.transactionWrappers;

    for (var i = startIndex; i < transactionWrappers.length; i++) {
      var wrapper = transactionWrappers[i];
      var initData = this.wrapperInitData[i];

      if (initData !== {} && wrapper.close) {
        wrapper.close.call(this, initData);
      }
    }

    this.wrapperInitData.length = 0;
  }
}

export default Transaction;
