import { THREE } from "../deps.js";

import { Component } from "../utils/component.js";

export class BasicCharacterControllerInput extends Component {
  _keys = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    space: false,
    shift: false,
    backspace: false,
  };
  _raycaster = new THREE.Raycaster();
  
  constructor(params) {
    super();
    this._params = params;
    document.addEventListener("keydown", (e) => this._onKeyDown(e), false);
    document.addEventListener("keyup", (e) => this._onKeyUp(e), false);
    // document.addEventListener("mouseup", (e) => this._onMouseUp(e), false);
  }

  _onKeyDown(event) {
    // console.log(`keydown ${event.key}`);
    if (event.currentTarget.activeElement != document.body) {
      return;
    }
    switch (event.keyCode) {
      case 87: // w
        this._keys.forward = true;
        break;
      case 65: // a
        this._keys.left = true;
        break;
      case 83: // s
        this._keys.backward = true;
        break;
      case 68: // d
        this._keys.right = true;
        break;
      case 32: // SPACE
        this._keys.space = true;
        break;
      case 16: // SHIFT
        this._keys.shift = true;
        break;
      case 8: // BACKSPACE
        this._keys.backspace = true;
        break;
    }
  }

  _onKeyUp(event) {
    if (event.currentTarget.activeElement != document.body) {
      return;
    }
    switch (event.keyCode) {
      case 87: // w
        this._keys.forward = false;
        break;
      case 65: // a
        this._keys.left = false;
        break;
      case 83: // s
        this._keys.backward = false;
        break;
      case 68: // d
        this._keys.right = false;
        break;
      case 32: // SPACE
        this._keys.space = false;
        break;
      case 16: // SHIFT
        this._keys.shift = false;
        break;
      case 8: // BACKSPACE
        this._keys.backspace = false;
        break;
    }
  }
}
