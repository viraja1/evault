import React, {Component} from 'react'
import {UserSession} from 'blockstack'

import {AppConfig} from 'blockstack'
import Dropzone from 'react-dropzone';
import {MdInsertDriveFile, MdDeleteForever, MdCloudDownload} from 'react-icons/md';
import {Image} from 'react-bootstrap';
import Alert from 'react-bootstrap/Alert';
const appConfig = new AppConfig(['store_write']);


class Main extends Component {
  constructor(props) {
    super(props);

    this.state = {
      files: [],
      message: ''
    };
  }

  componentWillMount() {
    this.loadFiles();
  }

  loadFiles(info = true) {
    let files = [];
    if(info === true) {
      this.setState({message: 'Fetching your files ....'});
    }
    this.props.userSession.listFiles((file) => {
      files.push(file);
      return true;
    }).then(() => {
      this.setState({files: files});
      if(info === true) {
        this.setState({message: ''});
      }
    }).catch(() => {
      this.setState({files: []});
      if(info === true) {
        this.setState({message: ''});
      }
    })
  }

  hideAlert(){
    this.setState({message: ''});
  }

  handleUpload(files) {
    let userSession = this.props.userSession;
    let loadFiles = this.loadFiles.bind(this);
    let hideAlert = this.hideAlert.bind(this);
    this.setState({message: 'Uploading ' + files.map(function(n){ return n.name}).join(", ") + ' ....'});
    files.forEach((file, idx, files) => {
      const options = {encrypt: true};
      let fileReader = new FileReader();
      fileReader.onload = function () {
        userSession.putFile(file.name, fileReader.result, options)
          .then(() => {
            if(idx === files.length - 1){
              hideAlert();
            }
            loadFiles(false);
          }).catch(() => {
            hideAlert();
          });
      };
      fileReader.readAsArrayBuffer(file);
    });
  };

  deleteFile(file_name) {
    this.setState({message: 'Deleting ' + file_name + " ...."});
    let userSession = this.props.userSession;
    let loadFiles = this.loadFiles.bind(this);
    userSession.deleteFile(file_name, {})
      .then(() => {
        this.setState({message: ''});
        loadFiles(false);
      }).catch(() => {
        this.setState({message: ''});
      });
  }

  downloadFile(file_name) {
    this.setState({message: 'Downloading ' + file_name + " ...."});
    let userSession = this.props.userSession;
    let createAndDownloadBlobFile = this.createAndDownloadBlobFile;
    userSession.getFile(file_name, {decrypt: true})
      .then((file) => {
        createAndDownloadBlobFile(file, file_name);
        this.setState({message: ''});
      }).catch(() => {
        this.setState({message: ''});
      });
  }

  createAndDownloadBlobFile(body, file_name) {
    const blob = new Blob([body]);
    if (navigator.msSaveBlob) {
      // IE 10+
      navigator.msSaveBlob(blob, file_name);
    } else {
      const link = document.createElement('a');
      // Browsers that support HTML5 download attribute
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', file_name);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  }

  render() {
    return (
      <div className="Dashboard">
        <nav>
          <Image src="/icon.png" width="150" height="150"/>
          <div className="nav-wrapper Container" style={{"float": "right"}}>
            <button className="login" onClick={this.props.handleSignOut.bind(this)}>
              Log Out
            </button>
          </div>
        </nav>
        <div id="box-container">
          <Dropzone onDropAccepted={this.handleUpload.bind(this)}>
            {({getRootProps, getInputProps}) => (
              <div className="upload" {...getRootProps()}>
                <input {...getInputProps()} />
                <p>Drag 'n' drop some files here, or click to select files</p>
              </div>
            )}
          </Dropzone>
          {this.state.message !== '' &&
            <div>
            <Alert variant="primary">
              {this.state.message}
            </Alert>
            </div>
          }
          <ul style={{overflowY: "scroll", height:"320px"}}>
            {this.state.files && this.state.files.map(file => (
              <li key={file}>
                <div className="fileInfo">
                  <MdInsertDriveFile size={26} color="#A5Cfff"/>
                  <strong>{file}</strong>
                </div>
                <div style={{float: "right"}}>
                  <MdCloudDownload size={26} color="#A5Cfff" onClick={e => this.downloadFile(file)}
                                   style={{cursor: "pointer"}}/>
                  <MdDeleteForever size={26} color="#A5Cfff"
                                   onClick={e => window.confirm("Are you sure you want to delete this file?") && this.deleteFile(file)}
                                   style={{cursor: "pointer"}}/>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }
}

// Made this a default prop (instead of using this.userSession) so a dummy userSession
// can be passed in for testing purposes
Main.defaultProps = {
  userSession: new UserSession(appConfig)
};
export default Main
