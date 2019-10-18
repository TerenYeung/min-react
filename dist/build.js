"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var App =
/*#__PURE__*/
function (_React$Component) {
  _inherits(App, _React$Component);

  function App() {
    var _getPrototypeOf2;

    var _this;

    _classCallCheck(this, App);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _possibleConstructorReturn(this, (_getPrototypeOf2 = _getPrototypeOf(App)).call.apply(_getPrototypeOf2, [this].concat(args)));
    _this.timer = null;
    _this.state = {
      welcome: "hello world",
      time: new Date(),
      isStart: true
    };

    _this.startClock = function () {
      _this.timer = setInterval(function () {
        _this.setState({
          time: new Date()
        });
      }, 1000);
    };

    _this.stopClock = function () {
      clearInterval(_this.timer);
    };

    return _this;
  }

  _createClass(App, [{
    key: "componentWillMount",
    value: function componentWillMount() {
      console.log("componentWillMount...");
    }
  }, {
    key: "componentDidMount",
    value: function componentDidMount() {
      console.log("componentDidMount...");
      this.startClock();
    }
  }, {
    key: "render",
    value: function render() {
      var _this$state = this.state,
          welcome = _this$state.welcome,
          time = _this$state.time;
      var children = this.props.children;
      return React.createElement("div", {
        className: "box",
        onClick: this.stopClock
      }, React.createElement("h1", null, welcome), React.createElement("p", null, React.createElement("span", null, "\u73B0\u5728\u662F\uFF1A"), React.createElement("span", null, time.toString())), React.createElement("div", {
        onClick: this.stopClock
      }, children));
    }
  }]);

  return App;
}(React.Component);

var Button = function Button() {
  return React.createElement("button", {
    className: "r-btn"
  }, "\u6E05\u9664");
};

var Wrapper = function Wrapper() {
  return React.createElement(App, {
    className: "handlers",
    style: {
      color: '#EEE',
      border: '1px solid #333'
    }
  }, React.createElement(Button, null));
};

var wrapper = React.createElement(Wrapper, null);
ReactDOM.render(wrapper, document.getElementById("app"));
