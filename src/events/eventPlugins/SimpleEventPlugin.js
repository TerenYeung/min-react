import ReactDOMComponentTree from '../../renderers/dom/shared/ReactDOMComponentTree';
import EventListener from '../../renderers/dom/shared/EventListener';

var eventTypes = {};
var topLevelEventsToDispatchConfig = {};
var onClickListeners = {};
[
  'abort',
  'animationEnd',
  'animationIteration',
  'animationStart',
  'blur',
  'canPlay',
  'canPlayThrough',
  'click',
  'contextMenu',
  'copy',
  'cut',
  'doubleClick',
  'drag',
  'dragEnd',
  'dragEnter',
  'dragExit',
  'dragLeave',
  'dragOver',
  'dragStart',
  'drop',
  'durationChange',
  'emptied',
  'encrypted',
  'ended',
  'error',
  'focus',
  'input',
  'invalid',
  'keyDown',
  'keyPress',
  'keyUp',
  'load',
  'loadedData',
  'loadedMetadata',
  'loadStart',
  'mouseDown',
  'mouseMove',
  'mouseOut',
  'mouseOver',
  'mouseUp',
  'paste',
  'pause',
  'play',
  'playing',
  'progress',
  'rateChange',
  'reset',
  'scroll',
  'seeked',
  'seeking',
  'stalled',
  'submit',
  'suspend',
  'timeUpdate',
  'touchCancel',
  'touchEnd',
  'touchMove',
  'touchStart',
  'transitionEnd',
  'volumeChange',
  'waiting',
  'wheel',
].forEach(event => {
  var capitalizedEvent = event[0].toUpperCase() + event.slice(1);
  var onEvent = 'on' + capitalizedEvent;
  var topEvent = 'top' + capitalizedEvent;

  var type = {
    phasedRegistrationNames: {
      bubbled: onEvent,
      captured: onEvent + 'Capture',
    },
    dependencies: [topEvent],
  };

  eventTypes[event] = type;
  topLevelEventsToDispatchConfig[topEvent] = type;
});

function getDictionaryKey(inst) {
  return '.' + inst._rootNodeID;
}

function isInteractive(tag) {
  return (
    tag === 'button' || tag === 'input' ||
    tag === 'select' || tag === 'textarea'
  );
}

var SimpleEventPlugin = {
  eventTypes,
  didPutListener(
    inst,
    registrationName,
    listener,
  ) {
    if (registrationName === 'onClick' && !isInteractive(inst._tag)) {
      var key = getDictionaryKey(inst);
      var node = ReactDOMComponentTree.getNodeFromInstance(inst);

      if (!onClickListeners[key]) {
        onClickListeners[key] = EventListener.listen(node, 'click', listener);
      }
    }
  },
  willDeleteListener(inst, registrationName) {
    if (registrationName === 'onClick' && !isInteractive(inst._tag)) {
      var key = getDictionaryKey(inst);
      onClickListeners[key].remove();
      delete onClickListeners[key];
    }
  }
};

export default SimpleEventPlugin;
