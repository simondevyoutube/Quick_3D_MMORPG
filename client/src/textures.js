import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.124/build/three.module.js';

export const textures = (function() {

  function _getImageDataScaled(image, w, h) {
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    // better resample quality
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(image, 0, 0, w, h);
    return ctx.getImageData(0, 0, w, h);
  }

  function _isPOT(n) { return (n & (n - 1)) === 0; }

  return {
    TextureAtlas: class {
      constructor(params) {
        this._threejs = params.threejs;
        this._basePath = params.basePath || '';
        this._tileSize = params.tileSize || 1024;        // <— choose 1024 (recommended) or 2048
        if (! _isPOT(this._tileSize)) {
          console.warn('tileSize should be power-of-two; forcing to 1024.');
          this._tileSize = 1024;
        }
        this._Create();
        this.onLoad = () => {};
      }

      Load(atlas, names) { this._LoadAtlas(atlas, names); }

      _Create() {
        this._manager = new THREE.LoadingManager();
        this._manager.onLoad = () => this._OnLoad();
        this._manager.onError = (url) => console.error('Texture failed to load:', url);

        this._loader = new THREE.TextureLoader(this._manager);
        if (this._basePath) this._loader.setPath(this._basePath);
        this._textures = {};
      }

      get Info() { return this._textures; }

      _LoadTexture(url) {
        const t = this._loader.load(
          url,
          (tex) => { tex.encoding = THREE.sRGBEncoding; },
          undefined,
          (err) => console.error('Error loading', url, err)
        );
        t.encoding = THREE.sRGBEncoding;
        return t;
      }

      _OnLoad() {
        if (!this._threejs.capabilities.isWebGL2) {
          console.error('WebGL2 is required for DataTexture2DArray.');
          return;
        }

        const W = this._tileSize, H = this._tileSize;

        for (let k in this._textures) {
          const atlas = this._textures[k];
          if (!atlas.textures.length) continue;

          const layerSize = 4 * W * H; // RGBA
          const data = new Uint8Array(atlas.textures.length * layerSize);

          for (let i = 0; i < atlas.textures.length; i++) {
            const tex = atlas.textures[i];
            if (!tex.image) {
              console.error('Image not loaded or blocked (CORS/COEP).');
              return;
            }
            let imgData;
            try {
              imgData = _getImageDataScaled(tex.image, W, H).data;
            } catch (e) {
              console.error('getImageData failed (likely tainted canvas). Serve assets same-origin or with CORS/CORP.', e);
              return;
            }
            data.set(imgData, i * layerSize);
          }

          const diffuse = new THREE.DataTexture2DArray(data, W, H, atlas.textures.length);
          diffuse.format = THREE.RGBAFormat;
          diffuse.type = THREE.UnsignedByteType;
          diffuse.minFilter = THREE.LinearMipMapLinearFilter;
          diffuse.magFilter = THREE.LinearFilter;
          diffuse.wrapS = THREE.RepeatWrapping;
          diffuse.wrapT = THREE.RepeatWrapping;
          diffuse.generateMipmaps = true;
          diffuse.encoding = THREE.sRGBEncoding;
          diffuse.needsUpdate = true;

          const aniso = this._threejs.capabilities.getMaxAnisotropy();
          diffuse.anisotropy = Math.min(4, aniso || 1);

          atlas.atlas = diffuse;
        }

        this.onLoad();
      }

      _LoadAtlas(atlas, names) {
        this._textures[atlas] = {
          textures: names.map(n => this._LoadTexture(n)),
          atlas: null,
        };
      }
    }
  };
})();
