

var ReactOwner = {
  addComponentAsRefTo(
    component,
    ref,
    owner,
  ) {
    owner.attachRef(ref, component);
  },
  removeComponentAsRefFrom(
    component,
    ref,
    owner
  ) {
    var ownerPublicInstance = owner.getPublicInstance();

    if (ownerPublicInstance && ownerPublicInstance.refs[ref] === component.getPublicInstance()) {
      owner.detachRef(ref);
    }
  }
};

export default ReactOwner;
