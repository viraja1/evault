import React, {Component} from 'react'
import {UserSession} from 'blockstack'

import {AppConfig} from 'blockstack'
import Dropzone from 'react-dropzone';
import {MdInsertDriveFile, MdDeleteForever, MdCloudDownload} from 'react-icons/md';
import {Image} from 'react-bootstrap';

const appConfig = new AppConfig(['store_write']);


class Main extends Component {
  constructor(props) {
    super(props);

    this.state = {
      files: []
    };
  }

  componentWillMount() {
    this.loadFiles();
  }

  loadFiles() {
    let files = [];
    this.props.userSession.listFiles((file) => {
      files.push(file);
      this.setState({files: files});
      return true;
    }).then(() => {
    }).catch(
        this.setState({files: []})
    );
  }

  handleUpload(files) {
    let userSession = this.props.userSession;
    let loadFiles = this.loadFiles.bind(this);
    files.forEach(file => {
      const options = {encrypt: true};
      let fileReader = new FileReader();
      fileReader.onload = function () {
        userSession.putFile(file.name, fileReader.result, options)
          .then(() => {
            loadFiles();
          });
      };
      fileReader.readAsArrayBuffer(file);
    });
  };

  deleteFile(file_name) {
    let userSession = this.props.userSession;
    let loadFiles = this.loadFiles.bind(this);
    userSession.deleteFile(file_name, {})
      .then(() => {
        loadFiles();
      });
  }

  downloadFile(file_name) {
    let userSession = this.props.userSession;
    let createAndDownloadBlobFile = this.createAndDownloadBlobFile;
    userSession.getFile(file_name, {decrypt: true})
      .then((file) => {
        createAndDownloadBlobFile(file, file_name);
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
                <p>Upload your files here</p>
              </div>
            )}
          </Dropzone>
          <ul>
            {this.state.files && this.state.files.map(file => (
              <li key={file}>
                <div className="fileInfo">
                  <MdInsertDriveFile size={24} color="#A5Cfff"/>
                  <strong>{file}</strong>
                </div>
                <div style={{float: "right"}}>
                  <MdCloudDownload size={24} color="#A5Cfff" onClick={e => this.downloadFile(file)}
                                   style={{cursor: "pointer"}}/>
                  <MdDeleteForever size={24} color="#A5Cfff"
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
