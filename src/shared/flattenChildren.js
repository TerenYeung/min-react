import traverseAllChildren from './traverseAllChildren';

function flattenSingleChildIntoContext(
  traverseContext,
  child,
  name
) {
  if (traverseContext && typeof traverseContext === 'object') {
    const result = traverseContext;
    const keyUnique = (result[name] === undefined);

    if (keyUnique && child != null) {
      result[name] = child;
    }
  }
}

function flattenChildren(
  children,
) {
  var result = {};

  traverseAllChildren(children, flattenSingleChildIntoContext, result);

  return result;
}

export default flattenChildren;
