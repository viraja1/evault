import React, {Component} from 'react';
import {Image} from 'react-bootstrap';

export default class Signin extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {handleSignIn} = this.props;
    return (
      <div className="panel-landing  h-100 d-flex" id="section-1">
        <nav>
          <Image src="/icon.png" width="150" height="150"/>
          <div className="nav-wrapper Container" style={{"float": "right"}}>
              <button className="login" onClick={handleSignIn.bind(this)}>
                Log in
              </button>
          </div>
        </nav>
        <div className="container row" style={{marginTop: "100px"}}>
        <div className="col l8 m12">
          <p className="h3">
            Simple secure encrypted Vault for all your files
          </p>
          <p>
            10 GB free storage
          </p>
          <Image src="https://cdn.pixabay.com/photo/2017/10/26/21/35/equipment-2892575__480.jpg" style={{height: "320px"}} fluid/>
        </div>
        </div>
      </div>
    )
  }
}
