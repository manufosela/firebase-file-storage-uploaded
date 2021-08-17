import { LitElement, html, css } from 'lit-element';

import { getStorage, ref, uploadBytes } from 'firebase/storage';
import { getDatabase } from 'firebase/database';

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
        type: Boolean,
        attribute: 'save-file-database'
      },
      deleteBtn: {
        type: Boolean,
        attribute: 'delete-btn'
      },
      dataUser: {
        type: Object
      },
      value: {
        type: String
      },
      fileIsImage: {
        type: Boolean
      }
    };
  }

  static get styles() {
    return css`
      /* CSS CUSTOM VARS
        --progress-bg-color, #eee;
        --progress-color1: #09c;
        --progress-color2: #f44;
        --progress-width: 500px
        --bgcolor-button: #106BA0;
        --color-button: #FFF;
        --progress-width: 500px
      */
      :host {
        display: flex;
        padding: 0;
        margin: 30px 0;
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
      .bloque1 {
        width: var(--progress-width, 500px);
      }
      .bloque2 {
        margin-left:20px;
      }
      .bloque2 a {
        display: block;
      }
      .fakefile {
        width:80px;
        height: 80px;
        border:2px solid black;
      }
      .fakefile > div::before {
        transform: rotate(-45deg);
        content: "FILE";
      }
      .invisible {
        visibility: hidden;
      }
      progress[value]::-webkit-progress-bar {
        background-color: var(--progress-bg-color, #eee);
        border-radius: 2px;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.25) inset;
      }
      progress[value]::-webkit-progress-value {
        background-image:
          -webkit-linear-gradient(-45deg, transparent 33%, rgba(0, 0, 0, .1) 33%, rgba(0,0, 0, .1) 66%, transparent 66%),
          -webkit-linear-gradient(top, rgba(255, 255, 255, .25), rgba(0, 0, 0, .25)), 
          -webkit-linear-gradient(left, var(--progress-color1, #09c), var(--progress-color2, #f44));
        border-radius: 2px; 
        background-size: 35px 20px, 100% 100%, 100% 100%;
        -webkit-animation: animate-stripes 5s linear infinite;
        animation: animate-stripes 5s linear infinite;
      }
      progress[value]::-moz-progress-bar { 
        background-image:
          -moz-linear-gradient(135deg, transparent 33%, rgba(0, 0, 0, 0.1) 33%, rgba(0, 0, 0, 0.1) 66%, transparent 66%),
          -moz-linear-gradient(top, rgba(255, 255, 255, 0.25), rgba(0, 0, 0, 0.25)),
          -moz-linear-gradient(left, var(--progress-color1, #09c), var(--progress-color2, #f44));
        border-radius: 2px; 
        background-size: 35px 20px, 100% 100%, 100% 100%;
        animation: animate-stripes 5s linear infinite;
      }
      input[type="file"] {
        width: 0.1px;
        height: 0.1px;
        opacity: 0;
        overflow: hidden;
        position: absolute;
        z-index: -1;
      }
      label[for="fileButton"] {
        padding: 0.5rem;
      }
      label[for="fileButton"], button {
        font-size: 14px;
        font-weight: 600;
        color: var(--color-button, #FFF);
        background-color: var(--bgcolor-button, #106BA0);
        display: inline-block;
        transition: all .5s;
        cursor: pointer;
        text-transform: uppercase;
        width: fit-content;
        text-align: center;
        border: 2px outset var(--bgcolor-button, #106BA0);
        border-radius: 10px;
        font-family: Verdana, Geneva, Tahoma, sans-serif;
      }
      .bloque1 button {
        margin:0.3rem;
        padding: 0.5rem;
      }
      .lds-dual-ring {
        display: inline-block;
        width: 80px;
        height: 80px;
      }
      .lds-dual-ring:after {
        content: " ";
        display: block;
        width: 64px;
        height: 64px;
        margin: 8px;
        border-radius: 50%;
        border: 6px solid #fff;
        border-color: #fff transparent #fff transparent;
        animation: lds-dual-ring 1.2s linear infinite;
      }
      @keyframes lds-dual-ring {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }

      @-webkit-keyframes animate-stripes {
        100% { background-position: -100px 0px; }
      }
      @keyframes animate-stripes {
        100% { background-position: -100px 0px; }
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
    this.deleteBtn = false;
    this.value = '';
    this.fileIsImage = false;

    this._fileValueChange = this._fileValueChange.bind(this);
    this._deleteValue = this._deleteValue.bind(this);
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

    console.log(this.path);
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

  firstUpdated() {
    this.sdomMsgLayer = this.shadowRoot.querySelector('#msg');
  }

  updated(changedProperties) {
    changedProperties.forEach((oldValue, propName) => {
      if (propName === 'dataUser' && this.dataUser !== null) {
        this.main();
      }
      if (propName === 'value') {
        this.fileIsImage = (this.value.search(/jpg|png|gif|tif|svg/) !== -1);
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
      this.app = obj.detail.firebaseApp;
      const slash = ( this.path.substr(-1) !== '/' ) ? '/' :'';
      this.path = `${this.path}${slash}${this.user.replace(/\s+/g, '_')}`;
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
    const fileNameData = { 'FILENAME': file.name, 'USER': this.user.replace(/\s/g, '_'), 'DATE': fecha, 'HOUR': hora, 'NAME': this.name };
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

  _deleteValue() {
    this.value = '';
    this.shadowRoot.querySelector('.bloque1 button').classList.add('invisible');
    this.shadowRoot.querySelector('#fileButton').value = '';
  }

  // Firebase 8: para ver el progreso de la carga de archivos
  _progressBar(task) {
    this.shadowRoot.querySelector('progress').classList.remove('invisible');
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
          this.value = downloadURL;
          this.fileIsImage = (file && file.type.split('/')[0] === 'image');
          if (this.saveFileDatabase) {
            this.saveDownloadURL();
          }
          const id = this.id || 'id-not-defined';
          this.shadowRoot.querySelector('progress').classList.add('invisible');
          if (this.deleteBtn) {
            this.shadowRoot.querySelector('.bloque1 button').classList.remove('invisible');
          }
          document.dispatchEvent(new CustomEvent('firebase-file-storage-uploaded', { 'detail': { downloadURL: downloadURL, name: this.name, id: id } }));
        });
        this._showMessage(this.uploadOkMsg)
      }
    );
  }

  _showLoading() {
    this.sdomMsgLayer.style.display = 'flex';
    this.sdomMsgLayer.innerHTML = '<div class="lds-dual-ring"></div>';
  }

  _showMessage(message) {
    const msgLayer = this.shadowRoot.querySelector('#msg');
    msgLayer.style.display = 'flex';
    msgLayer.innerText = message;
    this.closeMsg(msgLayer);
  }

  async _fileValueChange(e) {
    const uploader = this.shadowRoot.querySelector('#uploader');
    const msgLayer = this.shadowRoot.querySelector('#msg');
    const file = e.target.files[0];
    const fileName = this.getFileName(file);
    try {
      this._showLoading();
      const storage = await getStorage(this.app);
      const storageRef = ref(storage, this.path + '/' + fileName);
      const uploadResult = await uploadBytes(storageRef, file); 
      //TODO: Investigar como obtener el progreso con firebase 9: const uploadTask = uploadBytesResumable(storageRef, file); 
      // this._progressBar(uploadTask);
      this._showMessage('File uploaded sucessusfully');
    } catch(err) {
      console.error(err);
    }
  }

  main() {
    const fileButton = this.shadowRoot.querySelector('#fileButton');

    if (this.deleteBtn) {
      this.shadowRoot.querySelector('.bloque1 button').addEventListener('click', this._deleteValue);
    }

    fileButton.addEventListener('change', this._fileValueChange);
  }

  render() {
    const name = this.name.split('/').pop();
    return html`
      ${this.dataUser !== null ? html`
        <section class="wrapper">
          <div class="bloque1">
            <label>${name}</label>
            <progress value="0" max="100" id="uploader" class="invisible">0%</progress>
            <div style="display:flex">
              <label for="fileButton">Selecciona un fichero
              <input type="file" value="upload" id="fileButton">
              </label>
              ${(this.deleteBtn) ? (this.value !== '') ? html`<button>Delete</button>`: html`<button class="invisible">Delete</button>` : html``}
            </div>
          </div>
          <div class="bloque2">
            ${(this.value !== '') ? (this.fileIsImage) ? html`<img src="${this.value}" alt="${name}" width="150">` : html`<div class='fakefile'><div></div></div>` : html``}
            ${(this.value !== '') ? html`<a href='${this.value}' target="_blank">${this.value.split('/').pop().split('?')[0].split('-').pop()}</a>` : html``}
          </div>
        </section>
        <div id="filelink"></div>
        <div id="msg"></div>
      ` : html`<div class="waiting">Waiting for login...</div>`}
    `;
  }
}

window.customElements.define(FirebaseUploadfile.is, FirebaseUploadfile);