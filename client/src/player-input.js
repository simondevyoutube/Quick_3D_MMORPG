import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.124/build/three.module.js';
import {entity} from "./entity.js";

export const player_input = (() => {

  class PickableComponent extends entity.Component {
    constructor() { super(); }
    InitComponent() {}
  };

  class BasicCharacterControllerInput extends entity.Component {
    constructor(params) {
      super();
      this._params = params;
      this._Init();
    }

    _Init() {
      this._keys = {
        forward:false, backward:false, left:false, right:false,
        space:false, shift:false, backspace:false,
      };

      this._mouse = new THREE.Vector2();
      this._windowHalf = new THREE.Vector2(window.innerWidth/2, window.innerHeight/2);
      this._raycaster = new THREE.Raycaster();

      document.addEventListener('mousemove', (e)=>this.onMouseMove(e), false);
      document.addEventListener('keydown', (e)=>this._onKeyDown(e), false);
      document.addEventListener('keyup',   (e)=>this._onKeyUp(e), false);
      document.addEventListener('mouseup', (e)=>this._onMouseUp(e), false);
    }

    InitComponent() {
      window.addEventListener('vr.controller.select',     (e)=>this._OnVRSelect(e.detail));
      window.addEventListener('vr.controller.thumbstick', (e)=>this._OnVRThumbstick(e.detail));
      window.addEventListener('vr.controller.trigger',    (e)=>this._OnVRTrigger(e.detail));
    }

    _onMouseUp(event) {
      const rect = document.getElementById('threejs').getBoundingClientRect();
      const pos = {
        x: ((event.clientX - rect.left) / rect.width) * 2  - 1,
        y: ((event.clientY - rect.top ) / rect.height) * -2 + 1,
      };
      this._raycaster.setFromCamera(pos, this._params.camera);

      const pickables = this.Manager.Filter((e) => {
        const p = e.GetComponent('PickableComponent');
        return !!p && e._mesh;
      });

      const ray = new THREE.Ray();
      ray.origin.setFromMatrixPosition(this._params.camera.matrixWorld);
      ray.direction.set(pos.x, pos.y, 0.5).unproject(this._params.camera).sub(ray.origin).normalize();

      const quest = document.getElementById('quest-ui');
      if (quest) quest.style.visibility = 'hidden';

      for (let p of pickables) {
        const box = new THREE.Box3().setFromObject(p._mesh);
        if (ray.intersectsBox(box)) { p.Broadcast({ topic:'input.picked' }); break; }
      }
    }

    _onKeyDown(event) {
      if (event.currentTarget.activeElement != document.body) return;
      switch (event.keyCode) {
        case 87: this._keys.forward = true; break; // W
        case 65: this._keys.left = true; break;    // A
        case 83: this._keys.backward = true; break;// S
        case 68: this._keys.right = true; break;   // D
        case 32: this._keys.space = true; break;   // SPACE
        case 16: this._keys.shift = true; break;   // SHIFT
        case 8:  this._keys.backspace = true; break;
      }
    }
    _onKeyUp(event) {
      if (event.currentTarget.activeElement != document.body) return;
      switch (event.keyCode) {
        case 87: this._keys.forward = false; break;
        case 65: this._keys.left = false; break;
        case 83: this._keys.backward = false; break;
        case 68: this._keys.right = false; break;
        case 32: this._keys.space = false; break;
        case 16: this._keys.shift = false; break;
        case 8:  this._keys.backspace = false; break;
      }
    }

    onMouseMove(event) {
      if (event.currentTarget.activeElement != document.body) return;
      this._mouse.x = (event.clientX - this._windowHalf.x);
      this._mouse.y = (event.clientY - this._windowHalf.y);
    }

    _isLeft(msg){ return (msg.handedness ? msg.handedness==='left' : msg.controllerIndex===0); }
    _isRight(msg){ return (msg.handedness ? msg.handedness==='right': msg.controllerIndex===1); }

    _OnVRSelect(msg) {
      // Distinguish source: 'trigger' vs 'thumbstick'
      if (msg.source === 'thumbstick') {
        // Thumbstick press toggles run (SHIFT) on the left hand
        if (this._isLeft(msg)) this._keys.shift = !!msg.selecting;
        return;
      }
      if (msg.source === 'trigger') {
        // Right trigger → interaction
        if (this._isRight(msg) && msg.selecting) {
          this._handleVRInteraction(null, msg.controllerIndex);
        }
      }
    }

    _OnVRThumbstick(msg) {
      console.log('Thumbstick input received:', msg);
      // Only left-hand thumbstick controls locomotion
      if (!this._isLeft(msg)) return;

      const threshold = 0.15;
      const x = Math.abs(msg.x) < threshold ? 0 : msg.x;
      const y = Math.abs(msg.y) < threshold ? 0 : msg.y;

      console.log('Thumbstick input processed:', { x, y });

      this._keys.forward  = y <  0;
      this._keys.backward = y >  0;
      this._keys.left     = x <  0;
      this._keys.right    = x >  0;
    }

    _OnVRTrigger(msg) {
      console.log('Trigger input received:', msg);
      // Right trigger half-press → SPACE action
      if (this._isRight(msg)) {
        this._keys.space = (msg.value > 0.5);
      }
    }

    _handleVRInteraction(_event, controllerIndex) {
      console.log('Handling VR Interaction');
      const webxr = this.FindEntity('webxr')?.GetComponent('WebXRController');
      if (!webxr) return;

      const origin = webxr.GetControllerWorldPosition(controllerIndex);
      const dir    = webxr.GetControllerWorldDirection(controllerIndex);
      if (!origin || !dir) return;

      const raycaster = new THREE.Raycaster();
      raycaster.ray.origin.copy(origin);
      raycaster.ray.direction.copy(dir);

      const pickables = this.Manager.Filter((e) => {
        const p = e.GetComponent('PickableComponent');
        return !!p && e._mesh;
      });

      const quest = document.getElementById('quest-ui');
      if (quest) quest.style.visibility = 'hidden';

      for (let p of pickables) {
        const box = new THREE.Box3().setFromObject(p._mesh);
        if (raycaster.ray.intersectsBox(box)) { p.Broadcast({ topic:'input.picked' }); break; }
      }
    }
  };

  return {
    BasicCharacterControllerInput,
    PickableComponent,
  };

})();
