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

  async load(atlas, names) {
    const finished = []
    this.map[atlas] = {
      textures: [],
      atlas: undefined,
    };
    for (let i = 0; i < names.length; i++) {
      finished.push(load(names[i])
        .then(val => {
          this.map[atlas].textures.push(val)
          return val
        })
      )
    }
    // TODO-DefinitelyMaybe: aaaaah, how does one wrap up the promise correctly
    await Promise.all(finished)
    const data = new Uint8Array(this.map[atlas].textures.length * 4 * 1024 * 1024);

    for (let t = 0; t < this.map[atlas].textures.length; t++) {
      const curTexture = this.map[atlas].textures[t];
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
