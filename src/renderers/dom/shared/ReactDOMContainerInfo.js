var DOC_NODE_TYPE = 9;

function ReactDOMContainerInfo(
  topLevelWrapper,
  node,
) {
  var info = {
    _topLevelWrapper: topLevelWrapper,
    _ownerDocument: node ? node.nodeType === DOC_NODE_TYPE ? node : node.ownerDocument : null,
    _node: node,
    _tag: node ? node.nodeName.toLowerCase() : null,
    _namespaceURI : node ? node.namespaceURI : null,
  };

  return info;
};

export default ReactDOMContainerInfo;
