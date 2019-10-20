import React, {Component} from 'react';

import {AppConfig, UserSession} from "blockstack";

import Main from './Main.jsx';
import Signin from './Signin.jsx';

const appConfig = new AppConfig(['store_write']);
const userSession = new UserSession({appConfig: appConfig});


export default class App extends Component {

  constructor(props) {
    super(props)
  }

  handleSignIn(e) {
    e.preventDefault();
    userSession.redirectToSignIn();
  }

  handleSignOut(e) {
    e.preventDefault();
    userSession.signUserOut(window.location.origin);
  }


  render() {
    return (
      <div className="site-wrapper">
        {!userSession.isUserSignedIn() ?
          <Signin userSession={userSession} handleSignIn={this.handleSignIn}/>
          : <Main userSession={userSession} handleSignOut={this.handleSignOut}/>
        }
      </div>
    );
  }

  componentWillMount() {
    if (userSession.isSignInPending()) {
      userSession.handlePendingSignIn().then((userData) => {
        window.location = window.location.origin;
      });
    }
  }

}
