/* eslint-disable no-param-reassign */
import { LitElement, html } from 'lit-element';
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from 'firebase/storage';
import { firebaseUploadfileStyles } from './firebase-uploadfile-styles.js';

/**
 * `firebase-uploadfile`
 * FirebaseUploadfile
 *
 * @customElement firebase-uploadfile
 * @polymer
 * @litElement
 * @demo demo/index.html
 */

export class FirebaseUploadfile extends LitElement {
  static get is() {
    return 'firebase-uploadfile';
  }

  static get properties() {
    return {
      path: {
        type: String,
      },
      waitingMsg: {
        type: String,
        attribute: 'waiting-msg',
      },
      uploadErrorMsg: {
        type: String,
        attribute: 'upload-errmsg',
      },
      uploadOkMsg: {
        type: String,
        attribute: 'upload-okmsg',
      },
      label: {
        type: String,
      },
      storageName: {
        type: String,
        attribute: 'storage-name',
      },
      deleteBtn: {
        type: Boolean,
        attribute: 'delete-btn',
      },
      dataUser: {
        type: Object,
      },
      value: {
        type: String,
        reflect: true,
      },
      supportedFileTypes: {
        type: String,
        attribute: 'supported-file-types', // list of supported file types separated by comma
      },
      fileIsImage: {
        type: Boolean,
      },
      loginBtnId: {
        type: String,
        attribute: 'login-btn-id',
      },
      hideLabel: {
        type: Boolean,
        attribute: 'hide-label',
      },
      hideShowImageButton: {
        type: Boolean,
        attribute: 'hide-show-image-button',
      },
    };
  }

  static get styles() {
    return [firebaseUploadfileStyles];
  }

  constructor() {
    super();
    this.path = '/';
    this.label = 'label';
    this.storageName = 'sname';
    this.loginBtnId = null;
    this.waitingMsg = 'Waiting Login...';
    this.uploadErrorMsg = 'Upload Error';
    this.uploadOkMsg = 'File Uploaded';
    this.bLog = false;
    this.hideLabel = false;
    this.hideShowImageButton = false;
    this.loggedUser = '';
    this.dataUser = null;
    this.deleteBtn = false;
    this.value = '';
    this.supportedFileTypes = '';
    this.fileIsImage = false;

    this._fileValueChange = this._fileValueChange.bind(this);
    this._deleteValue = this._deleteValue.bind(this);
    this._showImage = this._showImage.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener('firebase-signin', ev => {
      this._userLogged(ev);
    });
    document.addEventListener('firebase-signout', ev => {
      this._userLogout(ev);
    });
    const firebaseAreYouLoggedEvent = new CustomEvent(
      'are-it-logged-into-firebase',
      { detail: { id: this.loginBtnId } }
    );
    document.dispatchEvent(firebaseAreYouLoggedEvent);
    const firebaseAreYouLoggedEvent2 = new CustomEvent(
      'firebase-are-you-logged',
      { detail: { id: this.loginBtnId } }
    );
    document.dispatchEvent(firebaseAreYouLoggedEvent2);

    this.id =
      this.id ||
      `firebase-uploadfile-${Math.random().toString(36).substring(2, 15)}`;
    // console.log(this.path);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('firebase-signin', ev => {
      this._userLogged(ev);
    });
    document.removeEventListener('firebase-signout', ev => {
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
        this.fileIsImage = this.value.search(/jpg|png|gif|tif|svg/) !== -1;
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
      const slash = this.path.substr(-1) !== '/' ? '/' : '';
      this.path = `${this.path}${slash}${this.user.replace(/\s+/g, '_')}`;
    }
  }

  _userLogout() {
    this.user = null;
    this.dataUser = null;
    this.data = null;
  }

  getFileName(file) {
    const hoy = new Date();
    const hora = `${hoy.getHours()}_${hoy.getMinutes()}_${hoy.getSeconds()}`;
    const fecha = `${hoy.getDate()}_${hoy.getMonth()}_${hoy.getFullYear()}`;
    const fileNameData = {
      FILENAME: file.name,
      USER: this.user.replace(/\s/g, '_'),
      DATE: fecha,
      HOUR: hora,
      NAME: this.name,
    };
    const nameParts = this.storageName.split(',');
    const fileNameParts = [];
    nameParts.forEach(part => {
      const name = fileNameData[part] ? fileNameData[part] : part;
      fileNameParts.push(name);
    });
    return fileNameParts.join('-');
  }

  closeMsg(layer) {
    setTimeout(() => {
      layer.style.display = 'none';
      layer.innerText = '';
      this.shadowRoot.querySelector('#uploader').value = 0;
    }, 1500);
  }

  _deleteValue() {
    this.value = '';
    this.shadowRoot.querySelector('#deleteFile').classList.add('invisible');
    this.shadowRoot.querySelector('#fileButton').value = '';
  }

  _showImage() {
    const bloque2 = this.shadowRoot.querySelector('.bloque2');
    if (bloque2.classList.contains('invisible')) {
      this.shadowRoot.querySelector('.bloque2').classList.remove('invisible');
    } else {
      this.shadowRoot.querySelector('.bloque2').classList.add('invisible');
    }
  }

  // Firebase 8: para ver el progreso de la carga de archivos
  _progressBar(task, file) {
    const uploader = this.shadowRoot.querySelector('#uploader');
    this.shadowRoot
      .querySelector('#progressLayer')
      .classList.remove('invisible');
    task.on(
      'state_changed',
      snapshot => {
        const percentage =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        uploader.value = percentage;
      },
      err => {
        this._showMessage(err);
        this.shadowRoot
          .querySelector('#progressLayer')
          .classList.add('invisible');
      },
      () => {
        getDownloadURL(task.snapshot.ref).then(downloadURL => {
          this.value = downloadURL;
          this.fileIsImage = file && file.type.split('/')[0] === 'image';
          this.shadowRoot
            .querySelector('#progressLayer')
            .classList.add('invisible');
          setTimeout(() => {
            if (this.deleteBtn) {
              this.shadowRoot
                .querySelector('#deleteFile')
                .classList.remove('invisible');
              this.shadowRoot
                .querySelector('#deleteFile')
                .removeEventListener('click', this._deleteValue);
              this.shadowRoot
                .querySelector('#deleteFile')
                .addEventListener('click', this._deleteValue);
            }
            if (
              this.shadowRoot.querySelector('#showFile') &&
              !this.hideShowImageButton
            ) {
              this.shadowRoot
                .querySelector('#showFile')
                .removeEventListener('click', this._showImage);
              this.shadowRoot
                .querySelector('#showFile')
                .addEventListener('click', this._showImage);
            }
          }, 0);
          document.dispatchEvent(
            new CustomEvent('firebase-file-storage-uploaded', {
              detail: {
                downloadURL: this.value,
                name: this.label,
                id: this.id,
              },
            })
          );
        });
        // this._showMessage(this.uploadOkMsg)
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

  _checkSupportedFileTypes(file) {
    if (this.supportedFileTypes.length > 0) {
      const fileType = file.type.split('/')[1];
      console.log(fileType);
      if (!this.supportedFileTypes.includes(fileType)) {
        throw new Error(
          `File type ${fileType} not supported. Supported types are: ${this.supportedFileTypes.join(
            ', '
          )}`
        );
      }
    }
  }

  async _saveFile(file, fileName) {
    try {
      console.log(file);
      this._checkSupportedFileTypes(file);
      const storage = await getStorage(this.app);
      const storageRef = ref(storage, `${this.path}/${fileName}`);
      const uploadTask = uploadBytesResumable(storageRef, file);
      this._progressBar(uploadTask, file);
    } catch (err) {
      this._showMessage(err);
    }
  }

  async _fileValueChange(e) {
    const file = e.target.files[0];
    const fileName = this.getFileName(file);
    await this._saveFile(file, fileName);
  }

  _getButton() {
    if (this.value !== '') {
      return html`<button id="deleteFile">Delete</button>`;
    }
    return html`<button id="deleteFile" class="invisible">Delete</button>`;
  }

  _getImage(label) {
    if (this.fileIsImage) {
      return html`<img
        id="imageLoaded"
        src="${this.value}"
        alt="${label || 'image'}"
        width="150"
      />`;
    }
    return html`<div class="fakefile"><div></div></div>`;
  }

  _getShowImageButton() {
    if (!this.hideShowImageButton) {
      return html`<button id="showFile">show file</button>`;
    }
    return html``;
  }

  _getImageName() {
    return this.value.split('/').pop().split('?')[0].split('-').pop();
  }

  main() {
    const fileButton = this.shadowRoot.querySelector('#fileButton');

    if (this.deleteBtn) {
      this.shadowRoot
        .querySelector('.bloque1 button')
        .addEventListener('click', this._deleteValue);
    }

    if (
      this.shadowRoot.querySelector('#showFile') &&
      !this.hideShowImageButton
    ) {
      this.shadowRoot
        .querySelector('#showFile')
        .addEventListener('click', this._showImage);
    }

    fileButton.addEventListener('change', this._fileValueChange);
  }

  render() {
    const label = this.label.split('/').pop();
    return html`
      ${this.dataUser !== null
        ? html`
            <section class="wrapper">
              <div class="bloque1">
                ${this.hideLabel ? '' : html`<label>${label}</label>`}
                <div class="progressLayer invisible" id="progressLayer">
                  <progress value="0" max="100" id="uploader">0%</progress>
                </div>
                <div class="buttonsLayer" style="display:flex">
                  <label for="fileButton">
                    Selecciona un fichero
                    <input type="file" value="upload" id="fileButton" />
                  </label>
                  ${this.deleteBtn ? this._getButton() : html``}
                  ${this.value !== ''
                    ? html`
                        ${this._getShowImageButton()}
                        <a class="imgLink" href="${this.value}" target="_blank"
                          >${this._getImageName()}</a
                        >
                      `
                    : html``}
                </div>
              </div>
            </section>
            <div class="bloque2 invisible">
              ${this.value !== '' ? this._getImage(label) : html``}
            </div>
            <div id="msg"></div>
          `
        : html`<div class="waiting">Waiting for loginbutton event...</div>`}
    `;
  }
}
