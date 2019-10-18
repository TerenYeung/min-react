var eventTypes = {
  change: {
    phasedRegistrationNames: {
      bubbled: 'onChange',
      captured: 'onChangeCapture',
    },
    dependencies: [
      'topBlur',
      'topChange',
      'topClick',
      'topFocus',
      'topInput',
      'topKeyDown',
      'topKeyUp',
      'topSelectionChange',
    ],
  },
};

var ChangeEventPlugin = {
  eventTypes,
};

export default ChangeEventPlugin;
