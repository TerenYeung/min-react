import ReactHostComponent from '../../../reconciler/ReactHostComponent';
import ReactUpdates from '../../../reconciler/ReactUpdates';
import EventPluginHub from '../../../events/EventPluginHub';
import DOMProperty from '../../../renderers/dom/shared/DOMProperty';
import ReactComponentEnvironment from '../../../reconciler/ReactComponentEnvironment';

var ReactInjection = {
  Component: ReactComponentEnvironment.injection,
  HostComponent: ReactHostComponent.injection,
  Updates: ReactUpdates.injection,
  EventPluginHub: EventPluginHub.injection,
  DOMProperty: DOMProperty.injection,
};

export default ReactInjection;
