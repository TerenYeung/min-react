import ReactComponent from './ReactComponent';
import ReactElement from './ReactElement';

var React = {
  Component: ReactComponent,
  createElement: ReactElement.createElement,
  isValidElement: ReactElement.isValidElement,
};

export default React;
