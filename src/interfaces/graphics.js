import { THREE } from "../deps.js";

const _VS = /* glsl */`
  varying vec3 vWorldPosition;
  
  void main() {
    vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
    vWorldPosition = worldPosition.xyz;
  
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
  }`;

const _FS = /* glsl */`
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

export class ThreeInit {

  renderer = new THREE.WebGLRenderer({
    antialias: false,
    canvas: document.querySelector("canvas#game"),
    logarithmicDepthBuffer: true
  });
  scene = new THREE.Scene();
  // TODO-DefinitelyMaybe: User variable for them to set at some point
  fov = 60;
  aspect = 1920 / 1080;
  near = 0.01;
  far = 10000.0;
  camera = new THREE.PerspectiveCamera(this.fov, this.aspect, this.near, this.far);

  constructor() {
    THREE.ShaderChunk.fog_fragment = /* glsl */`
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

    THREE.ShaderChunk.fog_pars_fragment = /* glsl */`
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

    THREE.ShaderChunk.fog_vertex = /* glsl */`
      #ifdef USE_FOG
        vWorldPosition = (modelMatrix * vec4(transformed, 1.0 )).xyz;
      #endif`;

    THREE.ShaderChunk.fog_pars_vertex = /* glsl */`
      #ifdef USE_FOG
        varying vec3 vWorldPosition;
      #endif`;

    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.gammaFactor = 2.2;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.camera.position.set(1, 1, 1);
    this.camera.lookAt(0,0,0)

    this.scene.fog = new THREE.FogExp2(0x89b2eb, 0.0000025);

    const light = new THREE.DirectionalLight(0x8088b3, 0.7);
    light.position.set(-10, 500, 10);
    light.target.position.set(0, 0, 0);
    light.castShadow = true;
    light.shadow.bias = -0.001;
    light.shadow.mapSize.width = 4096;
    light.shadow.mapSize.height = 4096;
    light.shadow.camera.near = 0.1;
    light.shadow.camera.far = 1000.0;
    light.shadow.camera.left = 100;
    light.shadow.camera.right = -100;
    light.shadow.camera.top = 100;
    light.shadow.camera.bottom = -100;
    this.scene.add(light);

    this.sun = light;

    this.loadSky();
  }

  loadSky() {
    const hemiLight = new THREE.HemisphereLight(0x424a75, 0x6a88b5, 0.7);
    this.scene.add(hemiLight);

    // TODO-DefinitelyMaybe: doesn't use the world.assets just yet
    const loader = new THREE.CubeTextureLoader();
    const texture = loader.load([
      "./resources/terrain/space-posx.jpg",
      "./resources/terrain/space-negx.jpg",
      "./resources/terrain/space-posy.jpg",
      "./resources/terrain/space-negy.jpg",
      "./resources/terrain/space-posz.jpg",
      "./resources/terrain/space-negz.jpg",
    ]);
    texture.encoding = THREE.sRGBEncoding;

    const uniforms = {
      "topColor": { value: new THREE.Color(0x000000) },
      "bottomColor": { value: new THREE.Color(0x5d679e) },
      "offset": { value: -500 },
      "exponent": { value: 0.3 },
      "background": { value: texture },
    };
    uniforms["topColor"].value.copy(hemiLight.color);

    this.scene.fog.color.copy(uniforms["bottomColor"].value);

    const skyGeo = new THREE.SphereBufferGeometry(5000, 32, 15);
    const skyMat = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: _VS,
      fragmentShader: _FS,
      side: THREE.BackSide,
    });

    const sky = new THREE.Mesh(skyGeo, skyMat);
    this.scene.add(sky);
  }

  update(player) {
    if (!player) {
      return;
    }
    const pos = player.position;

    this.sun.position.copy(pos);
    this.sun.position.add(new THREE.Vector3(-50, 200, -10));
    this.sun.target.position.copy(pos);
    this.sun.updateMatrixWorld();
    this.sun.target.updateMatrixWorld();
  }
}
