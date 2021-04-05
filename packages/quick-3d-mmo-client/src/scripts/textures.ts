import * as THREE from 'three';


// Taken from https://github.com/mrdoob/three.js/issues/758
function _GetImageData(image) {
  var canvas = document.createElement('canvas');
  canvas.width = image?.width ?? 600;
  canvas.height = image?.height ?? 600;

  var context = canvas.getContext('2d');
  context.drawImage(image, 0, 0);

  return context.getImageData(0, 0, image.width, image.height);
}

class TextureAtlas {
  onLoad: () => void;
  _threejs: any;
  _manager: THREE.LoadingManager;
  _loader: THREE.TextureLoader;
  _textures: {};
  constructor(params) {
    this._threejs = params.threejs;
    this._Create();
    this.onLoad = () => { };
  }

  Load(atlas, names) {
    this._LoadAtlas(atlas, names);
  }

  _Create() {
    this._manager = new THREE.LoadingManager();
    this._loader = new THREE.TextureLoader(this._manager);
    this._textures = {};

    this._manager.onLoad = () => {
      this._OnLoad();
    };
  }

  get Info() {
    return this._textures;
  }

  async _LoadTexture(n) {
    return new Promise((res, rej) => {
      this._loader.load(n, (response) => {
        let t = response;
        t.encoding = THREE.sRGBEncoding;
        res(t);
        // console.log("load cb called: ", res)
      }, null, (err) => {
        console.error("loader.load error: ", err)
        rej(err)
      });

    })
  }

  _OnLoad() {
    for (let k in this._textures) {
      const atlas = this._textures[k];
      const data = new Uint8Array(atlas.textures.length * 4 * 1024 * 1024);

      for (let t = 0; t < atlas.textures.length; t++) {
        const curTexture = atlas.textures[t];
        const curData = _GetImageData(curTexture.image);
        const offset = t * (4 * 1024 * 1024);

        data.set(curData.data, offset);
      }

      const diffuse = new THREE.DataTexture2DArray(data, 1024, 1024, atlas.textures.length);
      diffuse.format = THREE.RGBAFormat;
      diffuse.type = THREE.UnsignedByteType;
      diffuse.minFilter = THREE.LinearMipMapLinearFilter;
      diffuse.magFilter = THREE.LinearFilter;
      diffuse.wrapS = THREE.RepeatWrapping;
      diffuse.wrapT = THREE.RepeatWrapping;
      diffuse.generateMipmaps = true;

      const caps = this._threejs.capabilities;
      const aniso = caps.getMaxAnisotropy();

      diffuse.anisotropy = 4;

      atlas.atlas = diffuse;
    }

    this.onLoad();
  }

  async _LoadAtlas(atlas, names) {
    this._textures[atlas] = {
      textures: await Promise.allSettled(names.map( n => this._LoadTexture(n))),
      atlas: null,
    };
  }
}

export {
  TextureAtlas
}