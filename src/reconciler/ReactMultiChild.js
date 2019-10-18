import ReactChildReconciler from '../reconciler/ReactChildReconciler';
import ReactReconciler from '../reconciler/ReactReconciler';
import flattenChildren from '../shared/flattenChildren';
import ReactComponentEnvironment from './ReactComponentEnvironment';


function enqueue(queue, update) {
  if (update) {
    queue = queue || [];
    queue.push(update);
  }

  return queue;
}

function makeMove(child, afterNode, toIndex) {
  return {
    type: 'MOVE_EXISTING',
    content: null,
    fromIndex: child._mountIndex,
    fromNode: ReactReconciler.getHostNode(child),
    toIndex,
    afterNod
  };
}

function makeRemove(child, node) {
  return {
    type: 'REMOVE_NODE',
    content: null,
    fromIndex: child._mountIndex,
    fromNode: node,
    toIndex: null,
    afterNode: null,
  }
}

function processQueue(inst, updateQueue) {
  ReactComponentEnvironment.processChildrenUpdates(inst, updateQueue);
}

function makeInsertMarkup(markup, afterNode, toIndex) {
  return {
    type: 'INSERT_MARKUP',
    content: markup,
    fromIndex: null,
    fromNode: null,
    toIndex,
    afterNode,
  };
}

var ReactMultiChild = {
  Mixin: {
    mountChildren(
      nestedChildren,
      transaction,
      context,
    ) {
      var children = this._reconcilerInstantiateChildren(nestedChildren);
      this._renderedChildren = children;
      var mountImages = [];
      var index = 0;

      for (var name in children) {
        if (children.hasOwnProperty(name)) {
          var child = children[name];
          var mountImage = ReactReconciler.mountComponent(
            child,
            transaction,
            this,
            this._hostContainerInfo,
            context,
          );

          mountImages.push(mountImage);
        }
      }

      return mountImages;
    },
    updateChildren(
      nextNestedChildrenElements,
      transaction,
      context
    ) {
      this._updateChildren(nextNestedChildrenElements, transaction, context);
    },
    unmountChildren(safely) {
      var _renderedChildren = this._renderedChildren;
      ReactChildReconciler.unmountChildren(_renderedChildren, safely);
      this._renderedChildren = null;
    },
    moveChild(
      child,
      afterNode,
      toIndex,
      lastIndex,
    ) {
      if (child._mountIndex < lastIndex) {
        return makeMove(child, afterNode, toIndex);
      }
    },
    removeChild(child, node) {
      return makeRemove(child, node);
    },
    _updateChildren(
      nextNestedChildrenElements,
      transaction,
      context,
    ) {
      var prevChildren = this._renderedChildren;
      var removedNodes = {};
      var mountImages = [];
      var nextChildren = this._reconcilerUpdateChildren(
        prevChildren,
        nextNestedChildrenElements,
        mountImages,
        removedNodes,
        transaction,
        context,
      );

      if (!nextChildren && !prevChildren) {
        return;
      }

      var updates = null;
      var name;
      var nextIndex = 0;
      var lastIndex = 0;
      var nextMountIndex = 0;
      var lastPlacedNode = null;

      for (name in nextChildren) {
        if (!nextChildren.hasOwnProperty(name)) {
          continue;
        }

        var prevChild = prevChildren && prevChildren[name];
        var nextChild = nextChildren[name];

        if (prevChild === nextChild) {
          updates = enqueue(
            updates,
            this.moveChild(prevChild, lastPlacedNode, nextIndex, lastIndex)
          );
          lastIndex = Math.max(prevChild._mountIndex, lastIndex);
          prevChild._mountIndex = nextIndex;
        } else {
          if (prevChild) {
            lastIndex = Math.max(prevChild._mountIndex, lastIndex);
          }

          updates = enqueue(
            updates,
            this._mountChildAtIndex(
              nextChild,
              mountImages[nextMountIndex],
              lastPlacedNode,
              nextIndex,
              transaction,
              context
            )
          );
          nextMountIndex++;
        }
        nextIndex++;
        lastPlacedNode = ReactReconciler.getHostNode(nextChild);
      }

      for (name in removedNodes) {
        if (removedNodes.hasOwnProperty(name)) {
          updates = enqueue(
            updates,
            this._unmountChild(prevChildren[name], removedNodes[name])
          );
        }
      }

      if (updates) {
        processQueue(this, updates);
      }

      this._renderedChildren = nextChildren;
    },
    _reconcilerUpdateChildren(
      prevChildren,
      nextNestedChildrenElements,
      mountImages,
      removedNodes,
      transaction,
      context
    ) {
      var nextChildren;

      nextChildren = flattenChildren(nextNestedChildrenElements);

      ReactChildReconciler.updateChildren(
        prevChildren,
        nextChildren,
        mountImages,
        removedNodes,
        transaction,
        this,
        this._hostContainerInfo,
        context,
      );

      return nextChildren;
    },
    _reconcilerInstantiateChildren(nestedChildren) {
      return ReactChildReconciler.instantiateChildren(nestedChildren);
    },
    _mountChildAtIndex(
      child,
      mountImage,
      afterNode,
      index,
      transaction,
      context
    ) {
      child._mountIndex = index;
      return this.createChild(child, afterNode, mountImage);
    },
    createChild(child, afterNode, mountImage) {
      return makeInsertMarkup(mountImage, afterNode, child._mountIndex);
    },
    _unmountChild(child, node) {
      var update = this.removeChild(child, node);
      child._mountIndex = null;
      return update;
    }
  }
};

export default ReactMultiChild;
