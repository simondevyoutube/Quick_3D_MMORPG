import { THREE } from "../deps.js";
import { load } from "../interfaces/assets.js";

// Taken from https://github.com/mrdoob/three.js/issues/758
function _GetImageData(image) {
  const canvas = document.createElement("canvas");
  canvas.width = image.width;
  canvas.height = image.height;

  const context = canvas.getContext("2d");
  context.drawImage(image, 0, 0);

  return context.getImageData(0, 0, image.width, image.height);
}

export class TextureAtlas {
  map = {};

  load(atlas, names) {
    this.map[atlas] = {
      textures: [],
      atlas: undefined,
    };
    for (let i = 0; i < names.length; i++) {
      this.map[atlas].textures.push(load(names[i]))
    }
  }

  onLoad(atlas){
    const data = new Uint8Array(this.map[atlas].textures.length * 4 * 1024 * 1024);

    for (let t = 0; t < this.map[atlas].textures.length; t++) {
      const curTexture = this.map[atlas].textures[t];
      console.log(curTexture.image);
      const curData = _GetImageData(curTexture.image);
      const offset = t * (4 * 1024 * 1024);

      data.set(curData.data, offset);
    }

    const diffuse = new THREE.DataTexture2DArray(
      data,
      1024,
      1024,
      this.map[atlas].textures.length,
    );
    diffuse.format = THREE.RGBAFormat;
    diffuse.type = THREE.UnsignedByteType;
    diffuse.minFilter = THREE.LinearMipMapLinearFilter;
    diffuse.magFilter = THREE.LinearFilter;
    diffuse.wrapS = THREE.RepeatWrapping;
    diffuse.wrapT = THREE.RepeatWrapping;
    diffuse.generateMipmaps = true;
    diffuse.anisotropy = 4;

    this.map[atlas].atlas = diffuse;
  }
}

export class MostlyOldTextureAtlas {
  constructor() {
    this._manager = new THREE.LoadingManager();
    this._loader = new THREE.TextureLoader(this._manager);
    this.map = {};

    this._manager.onLoad = () => {
      this._OnLoad();
    };

    this.onLoad = () => {};
  }

  load(atlas, names) {
    this.map[atlas] = {
      textures: names.map(n => this._LoadTexture(n) ),
      atlas: undefined,
    };
  }

  _LoadTexture(n) {
    const t = this._loader.load(n);
    t.encoding = THREE.sRGBEncoding;
    return t;
  }

  _OnLoad() {
    for (const k in this.map) {
      const atlas = this.map[k];
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

      diffuse.anisotropy = 4;

      atlas.atlas = diffuse;
    }

    this.onLoad();
  }
}