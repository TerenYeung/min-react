import ReactInjection from './ReactInjection';
import ReactDOMComponent from './ReactDOMComponent';
import ReactDOMTextComponent from './ReactDOMTextComponent';
import ReactDefaultBatchingStrategy from '../../../reconciler/ReactDefaultBatchingStrategy';
import SimpleEventPlugin from '../../../events/eventPlugins/SimpleEventPlugin';
import EnterLeaveEventPlugin from '../../../events/eventPlugins/EnterLeaveEventPlugin';
import ChangeEventPlugin from '../../../events/eventPlugins/ChangeEventPlugin';
import SelectEventPlugin from '../../../events/eventPlugins/SelectEventPlugin';
import BeforeInputEventPlugin from '../../../events/eventPlugins/BeforeInputEventPlugin';
import DefaultEventPluginOrder from '../../../events/DefaultEventPluginOrder';
import ARIADOMPropertyConfig from './ARIADOMPropertyConfig';
import HTMLDOMPropertyConfig from './HTMLDOMPropertyConfig';
import SVGDOMPropertyConfig from './SVGDOMPropertyConfig';
import ReactReconcileTransaction from './ReactReconcileTransaction';
import ReactComponentBrowserEnvironment from './ReactComponentBrowserEnvironment';

var alreadyInjected = false;

var ReactDefaultInjection = {
  inject() {
    if (alreadyInjected) {
      return;
    }
    alreadyInjected = true;

    ReactInjection.EventPluginHub.injectEventPluginOrder(DefaultEventPluginOrder);

    ReactInjection.EventPluginHub.injectEventPluginsByName({
      SimpleEventPlugin,
      EnterLeaveEventPlugin,
      ChangeEventPlugin,
      SelectEventPlugin,
      BeforeInputEventPlugin,
    });

    ReactInjection.HostComponent.injectGenericComponentClass(ReactDOMComponent);
    ReactInjection.HostComponent.injectTextComponentClass(ReactDOMTextComponent);

    ReactInjection.Updates.injectReconcileTransaction(ReactReconcileTransaction);
    ReactInjection.Updates.injectBatchingStrategy(ReactDefaultBatchingStrategy);

    ReactInjection.Component.injectEnvironment(ReactComponentBrowserEnvironment);

    ReactInjection.DOMProperty.injectDOMPropertyConfig(ARIADOMPropertyConfig);
    ReactInjection.DOMProperty.injectDOMPropertyConfig(HTMLDOMPropertyConfig);
    ReactInjection.DOMProperty.injectDOMPropertyConfig(SVGDOMPropertyConfig);
  }
};

export default ReactDefaultInjection;
