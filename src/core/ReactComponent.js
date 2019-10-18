import ReactNoopUpdateQueue from './shared/ReactNoopUpdateQueue';

function ReactComponent(props, context, updater) {
  this.props = props;
  this.context = context;
  this.updater = updater || ReactNoopUpdateQueue
}

ReactComponent.prototype.isReactComponent = {};

ReactComponent.prototype.setState = function(partialState, callback) {
  this.updater.enqueueSetState(this, partialState);

  if (callback) {
    this.updater.enqueueCallback(this, callback, "setState");
  }
}

export default ReactComponent;


