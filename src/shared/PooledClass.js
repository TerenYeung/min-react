
var oneArgumentPooler = function(copyFieldsFrom) {
  var Klass = this;

  if (Klass.instancePool.length) {
    var instance = Klass.instancePool.pop();
    Klass.call(instance, copyFieldsFrom);
    return instance;
  } else {
    return new Klass(copyFieldsFrom);
  }
}

var standardReleaser = function(instance) {
  var Klass = this;
  instance.destructor();

  if (Klass.instancePool.length < Klass.poolSize) {
    Klass.instancePool.push(instance);
  }
}

var DEFAULT_POOLER = oneArgumentPooler;
var DEFAULT_POOL_SIZE = 10;

var addPoolingTo = function(
  CopyConstructor,
  pooler
) {
  var NewKlass = CopyConstructor;
  NewKlass.instancePool = [];
  NewKlass.getPooled = pooler || DEFAULT_POOLER;

  if (!NewKlass.poolSize) {
    NewKlass.poolSize = DEFAULT_POOL_SIZE;
  }
  NewKlass.release = standardReleaser;
  return NewKlass;
}

var PooledClass = {
  addPoolingTo,
};

export default PooledClass;
