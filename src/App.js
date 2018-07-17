import React, { Component } from 'react';
import { Alert } from 'watson-react-components/dist/components';
import './App.css';
import TopNav from './TopNav';
import Footer from './Footer';
const orange = require('./images/dot-orange.svg');
const purple = require('./images/dot-purple.svg');

const OPENWHISK_BACKEND = 'https://service.us.apiconnect.ibmcloud.com/gws/apigateway/api/a8a0f14d757ebc1969afaf53a369cd549b0f405fc97256b5a374cf2f38329b2c/WeatherAssistant_api/submit'

const Message = (props) => (
  <div className="segments load">
    <div className={`${props.type === 'user' ? 'from-user' : 'from-watson'} top`}>
      <div className="summary"><img className="dots" width={10} height={10} mode='fit' alt="" src={props.dots}/> {props.summary}</div>
      <div className="message-inner">
        <p>{props.message}</p>
      </div>
      <div className="time">{props.time}</div>
    </div>
  </div>
);

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      context: {},
      messages: [],
      sender: 'watson'/*,
      _id: uuidv1()*/
    };

    this.handleKeyPress = this.handleKeyPress.bind(this);
  }

  sendMessage(input, context) {
    const self = this;
    fetch(OPENWHISK_BACKEND, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-IBM-client-ID': 'a1873811-6f1a-476d-ae0b-697f2069e047:QUrVvZsweo0hejRc3qjJnoi6Wbu35lPLACT0r7nefzAM0i307DF5d2AowyTpBD6u'
      },
      body: JSON.stringify({ conversation: { input: { text: input, language: 'en' }, context: context/*, _id: self.state._id */} })
    })
      .then(response => response.json())
      .then(function(messageResponse) {
        let now = new Date();
        let hhmmss = now.toString().substr(16, 8);
        self.setState({
          context: messageResponse.conversation.context,
          messages: self.state.messages.concat({
            message: messageResponse.conversation.output.text.join('\n'),
            type: 'watson',
            time: hhmmss,
            summary: messageResponse.conversation.context.summary,
            dots: purple
          })});
      })
      .catch(error => {
        self.setState({ error });
      });
  }

  handleKeyPress(event) {
    if(event.key === 'Enter') {
      this.sendMessage(this.state.text, this.state.context);
      event.target.value = '';
      let now = new Date();
      let hhmmss = now.toString().substr(16, 8);

      this.setState({
        context: '',
        messages: this.state.messages.concat({
          message: this.state.text,
          type: 'user',
          time: hhmmss,
          summary: 'from user',
          dots: orange
        })});
    }
  }

  scrollToBottom() {
    this.messages.scrollTop = this.messages.scrollHeight;
  }

  formatMaps(){
    return "https://maps.googleapis.com/maps/api/staticmap?center="+this.state.context.city+","+this.state.context.city+"&zoom=13&scale=1&size=600x300&maptype=roadmap&key=AIzaSyD70ys4Z7Z57Pgsd9yIt4Lf70kArw0rYMs&format=png&visual_refresh=true";
  }

  componentDidMount() {
    this.sendMessage('Hello', {});
  }

  componentDidUpdate() {
    this.scrollToBottom();
  }

  render() {
    var imgsrc = "https://maps.googleapis.com/maps/api/staticmap?center=" + this.state.context.city+","+this.state.context.state + "&zoom=7&scale=1&size=600x300&maptype=roadmap&key=AIzaSyD70ys4Z7Z57Pgsd9yIt4Lf70kArw0rYMs&format=png&visual_refresh=true";
    return (

      <div className="App">
        <div className="App--main">
          <TopNav
            title="Weather Bot with OpenWhisk"
            urlGithub="https://github.com/watson-developer-cloud/text-bot-openwhisk/"
          />
          <div className="alert-container">
            <Alert type="info" color="blue">
              <p className="base--p">This system is for demonstration purposes only and is not intended to process Personal Data. No Personal Data is to be entered into this system as it may not have the necessary controls in place to meet the requirements of the General Data Protection Regulation (EU) 2016/679.</p>
            </Alert>
          </div>
          <div className="_container chat-container">
            <div id="chat-column-holder" className="responsive-column content-column">
              <div className="chat-column">
                <div id="scrollingChat" className="scrollingChat" ref={(div) => { this.messages = div;}}>
                  {!this.state.error ? JSON.stringify(this.state.error) : null}
                  {!this.state.error ? this.state.messages.map(m => <Message key={m.time} type={m.type} message={m.message} time={m.time} summary={m.summary} dots={m.dots} />) : null}
                </div>
              </div>
              <img alt="GoogleMaps Here" src={imgsrc}></img>


            </div>
            <input
              id="text-input-1"
              placeholder="Type here"
              onInput={(e) => {
                this.setState({ text: e.target.value });
              }}
              onKeyPress={this.handleKeyPress}

            />
            <div className="disclaimer-message">
              * The Weather Bot provides forecasts for <b>U.S. cities</b> at this moment.
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
}

export default App;
