import setInnerHTML from './setInnerHTML';
import setTextContent from './setTextContent';

function toString() {
  return this.node.nodeName;
}

function insertTreeChildren(tree) {
  if (!enableLazy) {
    return;
  }

  var node = tree.node;
  var children = tree.children;

  if (children.length) {
    for (var i = 0; i < children.length; i++) {
      insertTreeBefore(node, children[i], null);
    }
  } else if (tree.html != null) {
    setInnerHTML(node, tree.html);
  } else if (tree.text != null) {
    setTextContent(node, tree.text);
  }
}

var insertTreeBefore = function(parentNode, tree, referenceNode) {
  parentNode.insertBefore(tree.node, referenceNode);
  insertTreeChildren(tree);
}

var enableLazy = (
  typeof document !== 'undefined' &&
  typeof document.documentMode === 'number'
  ||
  typeof navigator !== 'undefined' &&
  typeof navigator.userAgent === 'string' &&
  /\bEdge\/\d/.test(navigator.userAgent)
);

function queueChild(parentTree, childTree) {
  if (enableLazy) {
    parentTree.childTree.push(childTree);
  } else {
    parentTree.node.appendChild(childTree.node);
  }
}

function queueHTML(tree, html) {
  if (enableLazy) {
    tree.html = html;
  } else {
    setInnerHTML(tree.node, html);
  }
}

function queueText(tree, text) {
  if (enableLazy) {
    tree.text = text;
  } else {
    setTextContent(tree.node, text);
  }
}

function DOMLazyTree(node) {
  return {
    node,
    children: [],
    html: null,
    text: null,
    toString,
  }
};

DOMLazyTree.queueChild = queueChild;
DOMLazyTree.queueHTML = queueHTML;
DOMLazyTree.queueText = queueText;
DOMLazyTree.insertTreeBefore = insertTreeBefore;

export default DOMLazyTree;
