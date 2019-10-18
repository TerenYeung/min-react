import escapeTextContentForBrowser from '../shared/escapeTextContentForBrowser';
import DOMLazyTree from '../shared/DOMLazyTree';
import ReactDOMComponentTree from '../shared/ReactDOMComponentTree';

class ReactDOMTextComponent {
  constructor(text) {
    this._currentElement = text;
    this._stringText = '' + text;
    this._hostNode = null;
    this._hostParent = null;
  }

  mountComponent(
    transaction,
    hostParent,
    hostContainerInfo,
    context,
  ) {
    this._hostParent = hostParent;
    var domID = hostContainerInfo._idCounter++;
    var openingValue = ' react-text: ' + domID + ' ';
    var closingValue = ' /react-text ';
    this._domID = domID;

    if (true) {
      var ownerDocument = hostContainerInfo._ownerDocument;
      var openingComment = ownerDocument.createComment(openingValue);
      var closingComment = ownerDocument.createComment(closingValue);
      var lazyTree = DOMLazyTree(ownerDocument.createDocumentFragment());
      DOMLazyTree.queueChild(lazyTree, DOMLazyTree(openingComment));

      if (this._stringText) {
        DOMLazyTree.queueChild(
          lazyTree,
          DOMLazyTree(ownerDocument.createTextNode(this._stringText))
        );
      }
      DOMLazyTree.queueChild(lazyTree, DOMLazyTree(closingComment));
      ReactDOMComponentTree.precacheNode(this, openingComment);
      this._closingComment = closingComment;
      return lazyTree;
    } else {
      var escapedText = escapeTextContentForBrowser(this._stringText);

      return (
        '<!--' + openingValue + '-->' +
        escapedText +
        '<!--' + closingValue + '-->'
      );
    }
  }

  receiveComponent(nextText, transaction) {
    if (nextText !== this._currentElement) {
      this._currentElement = nextText;
      var nextStringText = '' + nextText;

      if (nextStringText !== this._stringText) {
        this._stringText = nextStringText;
        DOMChildrenOperations.replaceDelimitedText(nextStringText);
      }
    }
  }

  getHostNode() {
    var hostNode = this._commentNodes;

    if (hostNode) {
      return hostNode;
    }

    if (!this._closingComment) {
      var openingComment = ReactDOMComponentTree.getNodeFromInstance(this);
      var node = openingComment.nextSibing;

      while (true) {
        if (node.nodeType === 8 && node.nodeValue === ' /react-text ') {
          this._closingComment = node;
          break;
        }
        node = node.nextSibing;
      }
    }

    hostNode = [this._hostNode, this._closingComment];
    this._commentNodes = hostNode;
    return hostNode;
  }
  unmountComponent() {
    this._closingComment = null;
    this._commentNodes = null;
    ReactDOMComponentTree.uncacheNode(this);
  }
}

export default ReactDOMTextComponent;
