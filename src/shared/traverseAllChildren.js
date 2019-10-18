function traverseAllChildrenImpl(
  children,
  nameSoFar,
  callback,
  traverseContext,
) {
  var type = typeof children;

  if (type === 'undefined' || type === 'boolean') {
    children = null;
  }

  if (children === null ||
      type === 'string' ||
      type === 'number' ||
      (
        type === 'object' && children.$$typeof === Symbol.for('react.element')
      )
    ) {
      callback(traverseContext, children, '' + (Math.random() * 100 + Date.now()));
      return 1;
    }

  var child;
  var nextName;
  var subtreeCount = 0;

  if (Array.isArray(children)) {
    for (var i = 0; i < children.length; i++) {
      child = children[i];
      subtreeCount += traverseAllChildrenImpl(
        child,
        nextName,
        callback,
        traverseContext,
      );
    }
  } else {
    // var iteratorFn = getIteratorFn(children);

    // if (iteratorFn) {
    //   var iterator = iteratorFn.call(children);
    //   var step;
    //   if (iteratorFn !== children.entries) {

    //   } else {

    //   }
    // } else if (type === 'object') {

    // }
  }

  return subtreeCount;
}

function traverseAllChildren(children, callback, traverseContext) {
  if (children == null) return 0;

  return traverseAllChildrenImpl(children, '', callback, traverseContext);
}

export default traverseAllChildren;
