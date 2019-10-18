var ReactInstanceMap = {
  get(key) {
    return key._reactInternalInstance;
  },
  remove(key) {
    key._reactInternalInstance = undefined;
  },
  has(key) {
    return key._reactInternalInstance !== undefined;
  },
  set(key, value) {
    key._reactInternalInstance = value;
  }
};

export default ReactInstanceMap;
