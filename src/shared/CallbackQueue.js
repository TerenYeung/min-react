import PooledClass from './PooledClass';

class CallbackQueue {
  constructor(arg) {
    this._callbacks = null;
    this._contexts = null;
    this._arg = arg;
  }

  enqueue(callback, context) {
    this._callbacks = this._callbacks || [];
    this._callbacks.push(callback);
    this._contexts = this._contexts || [];
    this._contexts.push(context);
  }

  notifyAll() {
    var callbacks = this._callbacks;
    var contexts = this._contexts;
    var arg = this._arg;

    if (callbacks && contexts) {
      this._callbacks = null;
      this._contexts = null;

      for (var i = 0; i < callbacks.length; i++) {
        callbacks[i].call(contexts[i], arg);
      }

      callbacks.length = 0;
      contexts.length = 0;
    }
  }

  reset() {
    this._callbacks = null;
    this._contexts = null;
  }

  destructor() {
    this.reset();
  }
}

export default PooledClass.addPoolingTo(CallbackQueue);
