import { THREE } from "../deps.js";

// Taken from https://github.com/mrdoob/three.js/issues/758
function _GetImageData(image) {
  var canvas = document.createElement("canvas");
  canvas.width = image.width;
  canvas.height = image.height;

  var context = canvas.getContext("2d");
  context.drawImage(image, 0, 0);

  return context.getImageData(0, 0, image.width, image.height);
}

export class TextureAtlas {
  constructor() {
    // TODO-DefinitelyMaybe: When the THREE.Texture loader returns a Texture object, the image property is not present
    // must wait for onload to fire from manager
    this.manager = new THREE.LoadingManager();
    this.loader = new THREE.TextureLoader(this.manager);
    this.map = {};

    this.manager.onLoad = () => {
      this.onLoad();
    };
  }

  load(atlas, names) {
    this.map[atlas] = {
      textures: names.map((n) => this.loadTexture(n)),
      atlas: undefined,
    };
  }

  loadTexture(n) {
    const t = this.loader.load(n);
    t.encoding = THREE.sRGBEncoding;
    return t;
  }

  onLoad() {
    for (let k in this.map) {
      const atlas = this.map[k];
      const data = new Uint8Array(atlas.textures.length * 4 * 1024 * 1024);

      for (let t = 0; t < atlas.textures.length; t++) {
        const curTexture = atlas.textures[t];
        const curData = _GetImageData(curTexture.image);
        const offset = t * (4 * 1024 * 1024);

        data.set(curData.data, offset);
      }

      const diffuse = new THREE.DataTexture2DArray(
        data,
        1024,
        1024,
        atlas.textures.length,
      );
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
  }
}
