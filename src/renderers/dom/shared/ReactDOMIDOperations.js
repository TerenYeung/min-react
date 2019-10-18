import DOMChildrenOperations from "./DOMChildrenOperations";
import ReactDOMComponentTree from './ReactDOMComponentTree';

var ReactDOMIDOperations = {
  dangerouslyProcessChildrenUpdates(parentInst, updates) {
    var node = ReactDOMComponentTree.getNodeFromInstance(parentInst);
    DOMChildrenOperations.processUpdates(node, updates);
  }
};

export default ReactDOMIDOperations;
