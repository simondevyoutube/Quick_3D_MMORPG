import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.124/build/three.module.js';
import {entity} from "./entity.js";

export const webxr_component = (() => {

  class WebXRController extends entity.Component {
    constructor(params) {
      super();
      this._params = params;

      // ---- CONFIG ----
      // How many WORLD UNITS equal 1 real meter? (Scale XR space to your world.)
      this._unitsPerMeter   = (params && params.unitsPerMeter != null) ? params.unitsPerMeter : 1.0;
      // Additional eye height in METERS to add on top of the platform’s local-floor eye height.
      this._eyeOffsetMeters = (params && params.eyeOffsetMeters != null) ? params.eyeOffsetMeters : 0.0;
      // If your device reports stick-forward as +Y, flip it. Default false matches your player-input.
      this._invertStickY    = (params && params.invertStickY != null) ? params.invertStickY : false;

      this._isVRActive = false; 

      // Rig hierarchy: RIG -> HEAD -> (camera)
      this._rig  = null;
      this._head = null;
      this._origCameraParent = null;

      // Height handling
      this._xrHasFloor  = false; // true if 'local-floor' succeeded
      this._headHeight  = 1.7;   // fallback eye height if no floor (meters)

      // Controllers
      this._vrControllers = [];
      this._handToIndex = {};

      // Temps
      this._tmpQ = new THREE.Quaternion();
      this._tmpE = new THREE.Euler(0,0,0,'YXZ');

      // Terrain follow
      this._yLerp       = 0.18; // smoothing for small undulations
      this._snapMeters  = 0.9;  // snap on big steps
      this._terrainYOffset = 0; // if your player origin isn't at feet
    }

    InitComponent() {
      this._setupWebXR();
    }

    _emit(topic, detail) {
      try { this.Broadcast?.({ topic, ...detail }); } catch (_) {}
      window.dispatchEvent(new CustomEvent(topic, { detail }));
    }

    _setupWebXR() {
      const { renderer, scene, camera } = this._params;
      if (!renderer || !renderer.xr) {
        console.warn('WebXR not available on this renderer');
        return;
      }

      // Use platform floor when available
      if (renderer.xr.setReferenceSpaceType) {
        renderer.xr.setReferenceSpaceType('local-floor');
      }

      // Build rig
      this._rig = new THREE.Group();
      this._rig.name = 'XR_Rig';
      scene.add(this._rig);

      // Scale the entire XR space to match your world units-per-meter
      this._rig.scale.setScalar(this._unitsPerMeter);

      this._head = new THREE.Group();
      this._head.name = 'XR_Head';
      this._rig.add(this._head);

      // Controllers under rig
      for (let i = 0; i < 2; i++) this._setupController(i, renderer, this._rig);

      // --- Session lifecycle ---
      renderer.xr.addEventListener('sessionstart', async () => {
        // Detect floor ref space
        this._xrHasFloor = false;
        const session = renderer.xr.getSession?.();
        if (session && session.requestReferenceSpace) {
          try {
            await session.requestReferenceSpace('local-floor');
            this._xrHasFloor = true;
          } catch (_) {
            this._xrHasFloor = false;
          }
        }

        // Parent your SCENE camera under head (we avoid reparenting the internal XR camera)
        if (camera) {
          this._origCameraParent = camera.parent || scene;
          this._head.add(camera);

          // local-floor: runtime supplies eye height; we can add an *extra bias* in METERS.
          // Convert meters to local units: because the rig is scaled by unitsPerMeter,
          // setting head.y in METERS is correct (it will be multiplied by the rig scale).
          const headMeters = this._xrHasFloor ? this._eyeOffsetMeters : this._headHeight + this._eyeOffsetMeters;
          this._head.position.y = headMeters;

          // small forward nudge (forward is +Z)
          this._head.position.z = 0.4;

          // XR camera near far
          this._applyXRCameraClips(0.01, 800);

          // point head in the right direction
          this._head.rotation.set(0, Math.PI, 0);

          // Zero local pose; XR will drive it
          camera.position.set(0, 0, 0);
          camera.rotation.set(0, 0, 0);
          camera.updateMatrixWorld(true);
        }

        // Make sure we start at terrain height so we don't spawn below ground
        this._snapRigToTerrainOnce();

        this._isVRActive = true;
        this._onVRSessionStart();
      });

      renderer.xr.addEventListener('sessionend', () => {
        // Restore camera parent
        const { camera, scene } = this._params;
        if (camera) {
          (this._origCameraParent || scene).add(camera);
        }
        // Reset head local offset (for non-VR usage)
        this._head.position.set(0,0,0);

        this._isVRActive = false;
        this._onVRSessionEnd();
      });
    }

    _setupController(index, renderer, parentGroup) {
      const controller = renderer.xr.getController(index);
      controller.addEventListener('selectstart', (e)=>this._onSelectStart(e, index));
      controller.addEventListener('selectend',   (e)=>this._onSelectEnd(e, index));
      controller.addEventListener('connected',   (e)=>this._onControllerConnected(e, index));
      controller.addEventListener('disconnected',(e)=>this._onControllerDisconnected(e, index));
      parentGroup.add(controller);

      const geom = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0,0,0), new THREE.Vector3(0,0,-1)
      ]);
      const mat  = new THREE.LineBasicMaterial({ color: 0x00ff00 });
      const line = new THREE.Line(geom, mat);
      controller.add(line);

      const grip = renderer.xr.getControllerGrip(index);
      parentGroup.add(grip);

      this._vrControllers[index] = {
        controller, grip, line,
        isSelecting: false,
        gamepad: null,
        thumbstickPressed: false,
        handedness: 'unknown',
      };
    }

    _onSelectStart(_e, idx) {
      const c = this._vrControllers[idx]; if (!c) return;
      c.isSelecting = true;
      c.line.material.color.setHex(0xff0000);
      this._emit('vr.controller.select', {
        controllerIndex: idx, handedness: c.handedness,
        selecting: true, source: 'trigger'
      });
    }

    _onSelectEnd(_e, idx) {
      const c = this._vrControllers[idx]; if (!c) return;
      c.isSelecting = false;
      c.line.material.color.setHex(0x00ff00);
      this._emit('vr.controller.select', {
        controllerIndex: idx, handedness: c.handedness,
        selecting: false, source: 'trigger'
      });
    }

    _onControllerConnected(event, idx) {
      const c = this._vrControllers[idx]; if (!c) return;
      const hand = event.data?.handedness || (idx === 0 ? 'left' : 'right');
      c.handedness = hand;
      c.gamepad = event.data?.gamepad || null;
      this._handToIndex[hand] = idx;

      console.log(`VR Controller ${idx} (${hand}) connected`, {
        axes: c.gamepad?.axes?.length, buttons: c.gamepad?.buttons?.length
      });

      this._emit('vr.controller.connected', { controllerIndex: idx, handedness: hand, gamepad: c.gamepad });
    }

    _onControllerDisconnected(_event, idx) {
      const c = this._vrControllers[idx];
      if (c && this._handToIndex[c.handedness] === idx) delete this._handToIndex[c.handedness];
      this._emit('vr.controller.disconnected', { controllerIndex: idx });
    }

    _onVRSessionStart() {
      console.log('VR Session started');
      this._updateVRCameraPosition();

      const desktopUI = document.getElementById('game-ui');
      if (desktopUI) desktopUI.style.display = 'none';

      const tpc = this.FindEntity('player')?.GetComponent('ThirdPersonCamera');
      if (tpc) tpc._vrModeActive = true;

      this._emit('vr.session.start', {});
    }

    _onVRSessionEnd() {
      console.log('VR Session ended');

      const desktopUI = document.getElementById('game-ui');
      if (desktopUI) desktopUI.style.display = 'block';

      const tpc = this.FindEntity('player')?.GetComponent('ThirdPersonCamera');
      if (tpc) tpc._vrModeActive = false;

      this._emit('vr.session.end', {});
    }

    Update() {
      if (!this._isVRActive) return;

      // keep rig aligned to player & terrain
      this._updateVRCameraPosition();

      // poll gamepads
      const session = this._params.renderer.xr.getSession?.();
      for (let i = 0; i < this._vrControllers.length; i++) {
        const c = this._vrControllers[i]; if (!c) continue;

        if (session && session.inputSources) {
          for (const src of session.inputSources) {
            if (!src.gamepad) continue;
            if (src.handedness && src.handedness === c.handedness) {
              c.gamepad = src.gamepad; break;
            }
          }
        }
        if (c.gamepad) this._updateControllerInput(i, c);
      }
    }

    _snapRigToTerrainOnce() {
      const player = this.FindEntity('player');
      if (!player || !player._position || !this._rig) return;
      const p = player._position.clone();
      const terrain = this.FindEntity('terrain')?.GetComponent('TerrainChunkManager');
      let y = this._rig.position.y;
      if (terrain) {
        const h = terrain.GetHeight(p)[0];
        y = h + this._terrainYOffset;
      } else {
        y = p.y;
      }
      this._rig.position.set(p.x, y, p.z);
    }

    // Move RIG to follow terrain; head.y is meters (bias) that gets scaled by unitsPerMeter
    _updateVRCameraPosition() {
      const player = this.FindEntity('player');
      if (!player || !player._position || !this._rig) return;

      const p = player._position.clone();

      // target ground height at player XZ
      let targetY = this._rig.position.y;
      const terrain = this.FindEntity('terrain')?.GetComponent('TerrainChunkManager');
      if (terrain) {
        const h = terrain.GetHeight(p)[0]; // meters in your game's scale
        targetY = h + this._terrainYOffset;
      } else {
        targetY = p.y;
      }

      // smooth vs snap
      const dy = targetY - this._rig.position.y;
      if (Math.abs(dy) > this._snapMeters) {
        this._rig.position.y = targetY;
      } else {
        this._rig.position.y += dy * this._yLerp;
      }

      // follow player XZ
      this._rig.position.x = p.x;
      this._rig.position.z = p.z;

      // head Y bias: 0 if floor is active, else fallback head height; both plus extra offset
      const headMeters = (this._xrHasFloor ? 0 : this._headHeight) + this._eyeOffsetMeters;
      this._head.position.y = headMeters;   // <-- this value is in meters; rig scaling converts to world units
      this._head.position.z = 0.2;

      // align rig yaw to player's yaw
      const playerYawQ = this._getPlayerYawQuat();
      if (playerYawQ) {
        this._rig.quaternion.slerp(playerYawQ, 0.1);
      }
    }

    _getPlayerYawQuat() {
      const player = this.FindEntity('player');
      if (!player) return null;

      if (player._rotation && player._rotation.isQuaternion) {
        this._tmpQ.copy(player._rotation);
      } else if (player._quaternion && player._quaternion.isQuaternion) {
        this._tmpQ.copy(player._quaternion);
      } else if (player._mesh?.getWorldQuaternion) {
        player._mesh.getWorldQuaternion(this._tmpQ);
      } else {
        return null;
      }

      this._tmpE.setFromQuaternion(this._tmpQ, 'YXZ');
      this._tmpE.x = 0; this._tmpE.z = 0;
      this._tmpQ.setFromEuler(this._tmpE);
      return this._tmpQ;
    }

    _deadzone(v, dz = 0.15) { return Math.abs(v) < dz ? 0 : v; }
    _pickStickAxes(axes = []) {
      const x0 = axes[0] || 0, y0 = axes[1] || 0;
      const x2 = axes[2] || 0, y2 = axes[3] || 0;
      const m01 = x0*x0 + y0*y0, m23 = x2*x2 + y2*y2;
      return (m23 >= m01) ? { x: x2, y: y2 } : { x: x0, y: y0 };
    }

    _updateControllerInput(index, c) {
      const gp = c.gamepad, hand = c.handedness;

      if (gp.axes && gp.axes.length) {
        let { x, y } = this._pickStickAxes(gp.axes);
        if (this._invertStickY) y = -y; // configurable
        this._emit('vr.controller.thumbstick', {
          controllerIndex: index, handedness: hand,
          x: this._deadzone(x), y: this._deadzone(y)
        });
      }

      // Thumbstick press (common: buttons[3] or [9])
      const btnStick = gp.buttons && (gp.buttons[3] || gp.buttons[9]);
      if (btnStick) {
        const pressed = !!btnStick.pressed;
        if (pressed !== c.thumbstickPressed) {
          c.thumbstickPressed = pressed;
          this._emit('vr.controller.select', {
            controllerIndex: index, handedness: hand,
            selecting: pressed, source: 'thumbstick'
          });
        }
      }

      // Trigger analog (button 0)
      const trig = gp.buttons && gp.buttons[0];
      if (trig) {
        const val = trig.value || (trig.pressed ? 1 : 0);
        if (val > 0.05) {
          this._emit('vr.controller.trigger', {
            controllerIndex: index, handedness: hand, value: val
          });
        }
      }
    }

    // Helpers
    GetController(index) { return this._vrControllers[index]?.controller; }
    IsVRActive() { return this._isVRActive; }

    GetControllerWorldPosition(index) {
      const c = this.GetController(index); if (!c) return null;
      const v = new THREE.Vector3(); c.getWorldPosition(v); return v;
    }

    GetControllerWorldDirection(index) {
      const c = this.GetController(index); if (!c) return null;
      const dir = new THREE.Vector3(0,0,-1);
      const m = new THREE.Matrix4().extractRotation(c.matrixWorld);
      return dir.applyMatrix4(m).normalize();
    }

    // Convert meters → world units using your unitsPerMeter, then push to XR cameras
    _applyXRCameraClips(nearMeters, farMeters) {
      const { renderer, camera } = this._params;
      if (!renderer || !renderer.xr) return;

      const near = nearMeters * (this._unitsPerMeter || 1.0);
      const far  = farMeters  * (this._unitsPerMeter || 1.0);

      const xrCam = renderer.xr.getCamera(camera);
      if (!xrCam) return;

      // The wrapper camera
      xrCam.near = near;
      xrCam.far  = far;
      xrCam.updateProjectionMatrix();

      // Per-eye cameras
      if (xrCam.cameras && xrCam.cameras.length) {
        for (const c of xrCam.cameras) {
          c.near = near;
          c.far  = far;
          c.updateProjectionMatrix();
        }
      }
    }

  }

  return { WebXRController };
})();
