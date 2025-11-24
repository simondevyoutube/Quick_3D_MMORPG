import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.124/build/three.module.js';
import { VRButton } from 'https://cdn.jsdelivr.net/npm/three@0.124/examples/jsm/webxr/VRButton.js';

import {entity} from "./entity.js";

export const threejs_component = (() => {


  const _VS = `
  varying vec3 vWorldPosition;
  
  void main() {
    vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
    vWorldPosition = worldPosition.xyz;
  
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
  }`;
  
  
  const _FS = `
  uniform vec3 topColor;
  uniform vec3 bottomColor;
  uniform float offset;
  uniform float exponent;
  uniform samplerCube background;
  
  varying vec3 vWorldPosition;
  
  void main() {
    vec3 viewDirection = normalize(vWorldPosition - cameraPosition);
    vec3 stars = textureCube(background, viewDirection).xyz;
  
    float h = normalize(vWorldPosition + offset).y;
    float t = max(pow(max(h, 0.0), exponent), 0.0);
  
    float f = exp(min(0.0, -vWorldPosition.y * 0.00125));
  
    vec3 sky = mix(stars, bottomColor, f);
    gl_FragColor = vec4(sky, 1.0);
  }`;

  class ThreeJSController extends entity.Component {
    constructor() {
      super();
    }

    InitEntity() {
      // --- your shader chunk overrides (unchanged) ---
      THREE.ShaderChunk.fog_fragment = `
      #ifdef USE_FOG
        vec3 fogOrigin = cameraPosition;
        vec3 fogDirection = normalize(vWorldPosition - fogOrigin);
        float fogDepth = distance(vWorldPosition, fogOrigin);
        fogDepth *= fogDepth;
        float heightFactor = 0.05;
        float fogFactor = heightFactor * exp(-fogOrigin.y * fogDensity) * (
            1.0 - exp(-fogDepth * fogDirection.y * fogDensity)) / fogDirection.y;
        fogFactor = saturate(fogFactor);
        gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
      #endif`;
      THREE.ShaderChunk.fog_pars_fragment = `
      #ifdef USE_FOG
        uniform float fogTime;
        uniform vec3 fogColor;
        varying vec3 vWorldPosition;
        #ifdef FOG_EXP2
          uniform float fogDensity;
        #else
          uniform float fogNear;
          uniform float fogFar;
        #endif
      #endif`;
      THREE.ShaderChunk.fog_vertex = `
      #ifdef USE_FOG
        vWorldPosition = (modelMatrix * vec4(transformed, 1.0)).xyz;
      #endif`;
      THREE.ShaderChunk.fog_pars_vertex = `
      #ifdef USE_FOG
        varying vec3 vWorldPosition;
      #endif`;

      // --- renderer ---
      this.threejs_ = new THREE.WebGLRenderer({
        antialias: true,
        powerPreference: "high-performance",
      });
      this.threejs_.outputEncoding = THREE.sRGBEncoding;
      this.threejs_.gammaFactor = 2.2;
      this.threejs_.shadowMap.enabled = true;
      this.threejs_.shadowMap.type = THREE.BasicShadowMap;
      this.threejs_.setPixelRatio(window.devicePixelRatio);
      this.threejs_.setSize(window.innerWidth, window.innerHeight);
      this.threejs_.domElement.id = 'threejs';
      this.threejs_.setClearColor(0x89b2eb, 1.0);

      // append once
      const host = document.getElementById('container');
      host.appendChild(this.threejs_.domElement);

      // --- scene FIRST ---
      this.scene_ = new THREE.Scene();
      this.scene_.fog = new THREE.FogExp2(0x89b2eb, 0.00002);

      // --- camera (desktop/mobile defaults only) ---
      let fov, far;
      if (window.innerWidth <= 768)       { fov = 50; far = 1200; }
      else if (window.innerWidth <= 1080) { fov = 50; far = 1475; }
      else                                { fov = 40; far = 7500; }

      const aspect = window.innerWidth / window.innerHeight;
      const near = 1.0;
      this.camera_ = new THREE.PerspectiveCamera(fov, aspect, near, far);
      this.camera_.position.set(25, 10, 25);
      this.scene_.add(this.camera_);

      // --- lights ---
      const light = new THREE.DirectionalLight(0x8088b3, 0.7);
      light.position.set(-10, 500, 10);
      light.target.position.set(0, 0, 0);
      light.castShadow = true;
      light.shadow.bias = -0.001;
      light.shadow.mapSize.set(4096, 4096);
      light.shadow.camera.near = 0.1;
      light.shadow.camera.far = 500.0;
      light.shadow.camera.left = 60;
      light.shadow.camera.right = -60;
      light.shadow.camera.top = 60;
      light.shadow.camera.bottom = -60;
      this.scene_.add(light);
      this.sun_ = light;

      this.LoadSky_();

      // --- XR enablement ---
      this.threejs_.xr.enabled = true;

      // Add VR button if VR is available
      const vrButton = VRButton.createButton(this.threejs_);
      document.body.appendChild(vrButton);

      // one animation loop for both XR and non-XR
      this.threejs_.setAnimationLoop(this.Update.bind(this));

      // resize (non-XR surfaces)
      window.addEventListener('resize', () => {
        const w = window.innerWidth, h = window.innerHeight;
        this.threejs_.setSize(w, h);
        this.camera_.aspect = w / h;
        this.camera_.updateProjectionMatrix();
      });
    }

    // optional: simple controller setup
    _setupControllers() {
      const controller1 = this.threejs_.xr.getController(0);
      const controller2 = this.threejs_.xr.getController(1);
      this.scene_.add(controller1, controller2);

      // Add simple rays for pointing
      const makeRay = () => {
        const geo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,0,0), new THREE.Vector3(0,0,-1)]);
        const mat = new THREE.LineBasicMaterial({ linewidth: 1 });
        const line = new THREE.Line(geo, mat);
        line.name = 'ray';
        line.scale.z = 5;
        return line;
      };
      controller1.add(makeRay());
      controller2.add(makeRay());

      // Example select events
      controller1.addEventListener('selectstart', () => {/* start action */});
      controller1.addEventListener('selectend',   () => {/* end action */});
      controller2.addEventListener('selectstart', () => {/* start action */});
      controller2.addEventListener('selectend',   () => {/* end action */});
    }


    // get the 1st, 3rd and 2nd last element of an array
    GetThreeElements(array) {
      return [array[0], array[array.length - 1], array[array.length - 2]];
    }
   

    LoadSky_() {
      const hemiLight = new THREE.HemisphereLight(0x424a75, 0x6a88b5, 0.7);
      // hemiLight.color.setHSL(0.6, 1, 0.4);
      // hemiLight.groundColor.setHSL(0.095, 1, 0.5);
      this.scene_.add(hemiLight);
  
  
      const loader = new THREE.CubeTextureLoader();
      const texture = loader.load([
          '/client/resources/terrain/space-posx.jpg',
          '/client/resources/terrain/space-negx.jpg',
          '/client/resources/terrain/space-posy.jpg',
          '/client/resources/terrain/space-negy.jpg',
          '/client/resources/terrain/space-posz.jpg',
          '/client/resources/terrain/space-negz.jpg',
      ]);
      texture.encoding = THREE.sRGBEncoding;
  
      const uniforms = {
        "topColor": { value: new THREE.Color(0x000000) },
        "bottomColor": { value: new THREE.Color(0x5d679e) },
        "offset": { value: -500 },
        "exponent": { value: 0.3 },
        "background": { value: texture },
      };
      // uniforms["topColor"].value.copy(hemiLight.color);
  
      this.scene_.fog.color.copy(uniforms["bottomColor"].value);
  
  
      const skyGeo = new THREE.SphereBufferGeometry(5000, 16, 8);
      const skyMat = new THREE.ShaderMaterial({
          uniforms: uniforms,
          vertexShader: _VS,
          fragmentShader: _FS,
          side: THREE.BackSide
      });
  
      const sky = new THREE.Mesh(skyGeo, skyMat);
      this.scene_.add(sky);
    }

    Update(_) {
      const player = this.FindEntity('player');
      if (!player) {
        return;
      }
      const pos = player._position;
  
      this.sun_.position.copy(pos);
      this.sun_.position.add(new THREE.Vector3(-50, 200, -10));
      this.sun_.target.position.copy(pos);
      this.sun_.updateMatrixWorld();
      this.sun_.target.updateMatrixWorld();
    }
  }

  return {
      ThreeJSController: ThreeJSController,
  };
})();