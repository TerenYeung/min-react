class App extends React.Component {
  timer = null
  state = {
    welcome: "hello world",
    time: (new Date()),
    isStart: true,
  };

  componentWillMount() {
    console.log("componentWillMount...");
  }

  componentDidMount() {
    console.log("componentDidMount...");
    this.startClock();
  }

  startClock = () => {
    this.timer = setInterval(() => {
      this.setState({ time: (new Date()) });
    }, 1000);
  }

  stopClock = () => {
    clearInterval(this.timer);
  }

  render() {
    const { welcome, time } = this.state;
    const { children } = this.props;

    return (
      <div className='box' onClick={this.stopClock}>
        <h1>{welcome}</h1>
        <p>
          <span>现在是：</span><span>{time.toString()}</span>
        </p>
        <div onClick={this.stopClock}>{children}</div>
      </div>
    )
  }
}

var Button = function () {
  return (
    <button className='r-btn'>清除</button>
  )
};


var Wrapper = function() {
  return (
    <App className='handlers' style={{color: '#EEE', border: '1px solid #333'}}>
      <Button />
    </App>
  )
}

var wrapper = <Wrapper />

ReactDOM.render(wrapper, document.getElementById("app"));
