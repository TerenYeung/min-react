var EventListener = {
  listen(target, eventType, callback) {
    if (target.addEventListener) {
      target.addEventListener(eventType, callback, false);

      return {
        remove() {
          target.removeEventListener(eventType, callback, false);
        }
      }
    } else if (target.attachEvent) {
      target.attachEvent('on' + eventType, callback);

      return {
        remove() {
          target.detachEvent('on' + eventType, callback);
        }
      }
    }
  },
  capture(target, eventType, callback) {
    if (target.addEventListener) {
      target.addEventListener(eventType, callback, true);
      return {
        remove() {
          target.removeEventListener(eventType, callback, true);
        }
      }
    } else {
      return {
        remove() {}
      }
    }
  }
}

export default EventListener;
