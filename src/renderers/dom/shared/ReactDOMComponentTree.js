
import DOMProperty from './DOMProperty';

var internalInstanceKey = '__reactInternalInstance$' + Math.random().toString(36).slice(2);
var ATTR_NAME = DOMProperty.ID_ATTRIBUTE_NAME;

function shouldPrecacheNode(node, nodeID) {
  return (node.nodeType === 1 &&
          node.getAttribute(ATTR_NAME) === String(nodeID)) ||
         (node.nodeType === 8 &&
          node.nodeValue === ' react-text: ' + nodeID + ' ') ||
         (node.nodeType === 8 &&
          node.nodeValue === ' react-empty: ' + nodeID + ' ');
}

function precacheChildNode(inst, node) {
  var children = inst._renderedChildren;
  var childNode = node.firstChild;

  outer:for(var name in children) {
    if (!children.hasOwnProperty(name)) {
      continue;
    }

    var childInst = children[name];
    var childID = getRenderedHostOrTextFromComponent(childInst)._domID;

    for (; childNode !== null; childNode = childNode.nextSibling) {
      if (shouldPrecacheNode(childNode, childID)) {
        precacheNode(childInst, childNode);
        continue outer;
      }
    }
  }
}

function getNodeFromInstance(inst) {
  if (inst._hostNode) {
    return inst._hostNode;
  }

  var parents = [];

  while(!inst._hostNode) {
    parents.push(inst);
    inst = inst._hostParent;
  }

  for (;parents.length; inst = parents.pop()) {
    precacheChildNode(inst, inst._hostNode);
  }

  return inst._hostNode;
}

function getInstanceFromNode(node) {
  var inst = getClosetInstanceFromNode(node);

  if (inst != null && inst._hostNode === node) {
    return inst;
  } else {
    return null;
  }
}

function getClosestInstanceFromNode(node) {
  if (node[internalInstanceKey]) {
    return node[internalInstanceKey];
  }

  var parents = [];
  while (!node[internalInstanceKey]) {
    parents.push(node);

    if (node.parentNode) {
      node = node.parentNode;
    } else {
      return null;
    }
  }

  var closest;
  var inst;
  for (; node && (inst = node[internalInstanceKey]); node = parents.pop()) {
    closest = inst;
    if (parents.length) {
      precacheChildNode(inst, node);
    }
  }

  return closest;
}

function precacheNode(inst, node) {
  var hostInst = getRenderedHostOrTextFromComponent(inst);
  hostInst._hostNode = node;
};

function uncacheNode(inst) {
  var node = inst._hostNode;

  if (node) {
    delete node[internalInstanceKey];
    inst._hostNode = null;
  }
}

function getRenderedHostOrTextFromComponent(component) {
  var rendered;
  while((
    rendered = component._renderedComponent
  )) {
    component = rendered;
  }

  return component;
}

var ReactDOMComponentTree = {
  getNodeFromInstance,
  getInstanceFromNode,
  precacheNode,
  uncacheNode,
};

export default ReactDOMComponentTree;
