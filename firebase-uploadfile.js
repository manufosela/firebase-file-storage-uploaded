import {
  LitElement,
  html,
  css
} from 'lit-element';
import 'firebase/firebase-storage';
import 'firebase/firebase-database';

/**
 * `firebase-uploadfile`
 * FirebaseUploadfile
 *
 * @customElement firebase-uploadfile
 * @polymer
 * @litElement
 * @demo demo/index.html
 */

class FirebaseUploadfile extends LitElement {
  static get is() {
    return 'firebase-uploadfile';
  }

  static get properties() {
    return {
      path: {
        type: String
      },
      waitingMsg: {
        type: String,
        attribute: 'waiting-msg'
      },
      uploadErrorMsg: {
        type: String,
        attribute: 'upload-errmsg'
      },
      uploadOkMsg: {
        type: String,
        attribute: 'upload-okmsg'
      },
      name: {
        type: String
      },
      storageName: {
        type: String,
        attribute: 'storage-name'
      },
      saveFileDatabase: {
        type: String,
        attribute: 'save-file-database'
      },
      dataUser: {
        type: Object
      },
      value: {
        type: String
      }
    };
  }

  static get styles() {
    return css`
      /* CSS CUSTOM VARS
      */
      :host {
        display: flex;
        max-width: 30vw;
        padding: 0;
        margin: 30px;
        align-items: start;
        justify-content: center;
        flex-direction: column;
      }

      #uploader {
        -webkit-appearance: none;
        appearance: none;
        width: 100%;
        margin-bottom: 10px;
      }
      #msg {
        border: 3px outset gray;
        border-radius: 15px;
        width: 300px;
        height: 100px;
        position: absolute;
        background: gray;
        display:none;
        color: #FFF;
        font-weight: bold;
        justify-content: center;
        align-items: center;
        font-size: 1.2rem;
      }
      label {
        font-weight: bold;
        margin: 5px 0;
      }
      .wrapper {
        display:flex;
      }
      .bloque2 {
        margin-left:20px;
      }
    `;
  }

  constructor() {
    super();
    this.path = '/';
    this.name = 'name';
    this.storageName = 'sname';
    this.waitingMsg = 'Waiting Login...';
    this.uploadErrorMsg = 'Upload Error';
    this.uploadOkMsg = 'File Uploaded';
    this.bLog = false;
    this.loggedUser = '';
    this.dataUser = null;
    this.saveFileDatabase = false;
    this.value = '';
    this.fileIsImage = false;
  }

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener('firebase-signin', (ev) => {
      this._userLogged(ev);
    });
    document.addEventListener('firebase-signout', (ev) => {
      this._userLogout(ev);
    });
    const firebaseAreYouLoggedEvent = new Event('firebase-are-you-logged');
    document.dispatchEvent(firebaseAreYouLoggedEvent);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('firebase-signin', (ev) => {
      this._userLogged(ev);
    });
    document.removeEventListener('firebase-signout', (ev) => {
      this._userLogout(ev);
    });
  }

  updated(changedProperties) {
    changedProperties.forEach((oldValue, propName) => {
      if (propName === 'dataUser' && this.dataUser !== null) {
        this.main();
      }
    });
  }

  log(msg) {
    if (this.bLog) {
      console.log(msg);
    }
  }

  _userLogged(obj) {
    if (!this.user && obj.detail.user) {
      this.user = obj.detail.user.displayName;
      this.dataUser = obj.detail.user;
    }
  }

  _userLogout() {
    this.dataUser = null;
    this.data = null;
  }

  getFileName(file) {
    const hoy = new Date();
    const hora = `${hoy.getHours()}_${hoy.getMinutes()}_${hoy.getSeconds()}`;
    const fecha = `${hoy.getDate()}_${hoy.getMonth()}_${hoy.getFullYear()}`;
    const fileNameData = { 'FILENAME': file.name, 'PATH': this.path.replace(/\//g, '_'), 'USER': this.user.replace(/\s/g, '_'), 'DATE': fecha, 'HOUR': hora, 'NAME': this.name };
    const nameParts = this.storageName.split(',');
    let fileNameParts = [];
    nameParts.forEach((part) => {
      let name = fileNameData[part] ? fileNameData[part] : part;
      fileNameParts.push(name);
    });
    return fileNameParts.join('-');
  }

  _cleanString(str) {
    const cleanedStr= str.toLowerCase()
      .replace(/\s/g, '_')
      .replace(/[àáä]/g, 'a')
      .replace(/[èéë]/g, 'e')
      .replace(/[ìíï]/g, 'i')
      .replace(/òóö/g, 'o')
      .replace(/[ùúü]/g, 'u')
      .replace(/[ñÑ]/g, 'n')
      .replace(/[\[\]\.]/g, '');
    return cleanedStr;
  }

  closeMsg(layer) {
    setTimeout(
      () => {
        layer.style.display = 'none';
        layer.innerText = '';
        this.shadowRoot.querySelector('#uploader').value = 0;
      }, 1500);
  }

  saveDownloadURL() {
    const hoy = new Date();
    const cleanuser = this._cleanString(this.user);
    const path = `${this.path}/${cleanuser}/${this.name}`;
    const rootRef = firebase.database().ref();
    const storesRef = rootRef.child(path);
    const newStoreRef = storesRef.push();
    newStoreRef.set(this.value);
  }

  main() {
    const uploader = this.shadowRoot.querySelector('#uploader');
    const fileButton = this.shadowRoot.querySelector('#fileButton');
    const msgLayer = this.shadowRoot.querySelector('#msg');

    fileButton.addEventListener('change', (e) => {
      const file = e.target.files[0];
      const fileName = this.getFileName(file);
      const storageRef = firebase.storage().ref(this.path + '/' + fileName);
      const task = storageRef.put(file);
      task.on('state_changed',
        (snapshot) => {
          let percentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          uploader.value = percentage;
        },
        (err) => {
          msgLayer.style.display = 'flex';
          msgLayer.innerText = this.uploadErrorMsg;
          this.closeMsg(msgLayer);
        },
        () => {
          task.snapshot.ref.getDownloadURL().then((downloadURL) => {
            if (this.saveFileDatabase) {
              this.value = downloadURL;
              this.fileIsImage = (file && file.type.split('/')[0] === 'image');
              this.saveDownloadURL();
            }
            document.dispatchEvent(new CustomEvent('firebase-file-storage-uploaded', { 'detail': { downloadURL: downloadURL, name: this.name } }));
          });
          msgLayer.style.display = 'flex';
          msgLayer.innerText = this.uploadOkMsg;
          this.closeMsg(msgLayer);
        }
      );
    });
  }

  render() {
    const name = this.name.split('/').pop();
    return html`
      ${this.dataUser !== null ? html`
        <section class="wrapper">
          <div class="bloque1">
            <label>${name}</label>
            <progress value="0" max="100" id="uploader">0%</progress>
            <input type="file" value="upload" id="fileButton" />
          </div>
          <div class="bloque2">
            ${(this.value !== '' && this.fileIsImage) ? html`<img src="${this.value}" alt="${name}" width="150">` : html``}
          </div>
        </section>
        <div id="filelink"></div>
        <div id="msg"></div>
      ` : html`<div class="waiting">Waiting for login...</div>`}
    `;
  }
}

window.customElements.define(FirebaseUploadfile.is, FirebaseUploadfile);