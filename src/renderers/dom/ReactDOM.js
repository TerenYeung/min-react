import ReactDefaultInjection from '../../renderers/dom/shared/ReactDefaultInjection';
import ReactMount from './ReactMount';

ReactDefaultInjection.inject();

var ReactDOM = {
  render: ReactMount.render,
}

export default ReactDOM;
