import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.124/build/three.module.js';

import {FBXLoader} from 'https://cdn.jsdelivr.net/npm/three@0.124/examples/jsm/loaders/FBXLoader.js';
import {GLTFLoader} from 'https://cdn.jsdelivr.net/npm/three@0.124/examples/jsm/loaders/GLTFLoader.js';
import {SkeletonUtils} from 'https://cdn.jsdelivr.net/npm/three@0.124/examples/jsm/utils/SkeletonUtils.js';

import {entity} from "./entity.js";


export const load_controller = (() => {

  class LoadController extends entity.Component {
    constructor() {
      super();

      this.textures_ = {};
      this.models_ = {};
      
      // Throttled loading configuration
      this.maxConcurrentLoads_ = 5;  // Max assets loading at once
      this.currentLoads_ = 0;         // Current number of active loads
      this.loadQueue_ = [];           // Queue of pending loads
      this.retryAttempts_ = 3;        // Number of retry attempts on failure
      this.retryDelay_ = 1000;        // Delay between retries in ms
      this.retryTimers_ = [];         // Track retry timers for cleanup
    }

    Destroy() {
      // Clear all pending retry timers
      for (let timer of this.retryTimers_) {
        clearTimeout(timer);
      }
      this.retryTimers_ = [];
      this.loadQueue_ = [];
    }

    // Process the next item in the queue if capacity allows
    ProcessQueue_() {
      if (this.loadQueue_.length === 0 || this.currentLoads_ >= this.maxConcurrentLoads_) {
        return;
      }

      const loadTask = this.loadQueue_.shift();
      this.currentLoads_++;
      
      loadTask.execute();
    }

    // Called when a load completes (success or failure)
    OnLoadComplete_() {
      this.currentLoads_--;
      // Process next item in queue
      this.ProcessQueue_();
    }

    // Enqueue a load task
    EnqueueLoad_(executeFunc) {
      const task = {
        execute: () => {
          executeFunc(() => {
            this.OnLoadComplete_();
          });
        }
      };

      this.loadQueue_.push(task);
      this.ProcessQueue_();
    }

    LoadTexture(path, name) {
      if (!(name in this.textures_)) {
        const loader = new THREE.TextureLoader();
        loader.setPath(path);

        // Create a placeholder texture immediately
        const texture = new THREE.Texture();
        this.textures_[name] = {loader: loader, texture: texture, loading: true};
        
        // Queue the actual load
        this.EnqueueLoad_((onComplete) => {
          this.LoadTextureWithRetry_(loader, name, 0, (loadedTex) => {
            if (loadedTex) {
              loadedTex.encoding = THREE.sRGBEncoding;
              loadedTex.generateMipmaps = true;
              loadedTex.minFilter = THREE.LinearMipMapLinearFilter;
              loadedTex.magFilter = THREE.LinearFilter;
              loadedTex.anisotropy = 4;
              
              // Update the placeholder with actual data
              this.textures_[name].texture = loadedTex;
              this.textures_[name].loading = false;
            }
            onComplete();
          });
        });
      }

      return this.textures_[name].texture;
    }

    LoadTextureWithRetry_(loader, name, attempt, callback) {
      loader.load(
        name,
        (tex) => {
          callback(tex);
        },
        undefined,
        (error) => {
          console.error(`Failed to load texture ${name}, attempt ${attempt + 1}`, error);
          if (attempt < this.retryAttempts_) {
            const timer = setTimeout(() => {
              // Remove this timer from tracking
              const index = this.retryTimers_.indexOf(timer);
              if (index > -1) {
                this.retryTimers_.splice(index, 1);
              }
              this.LoadTextureWithRetry_(loader, name, attempt + 1, callback);
            }, this.retryDelay_);
            this.retryTimers_.push(timer);
          } else {
            console.error(`Texture ${name} failed after ${this.retryAttempts_} attempts`);
            callback(null);
          }
        }
      );
    }

    LoadFBX(path, name, onLoad) {
      if (!(name in this.models_)) {
        const loader = new FBXLoader();
        loader.setPath(path);

        this.models_[name] = {loader: loader, asset: null, queue: [onLoad]};
        
        // Queue the load
        this.EnqueueLoad_((onComplete) => {
          this.LoadFBXWithRetry_(loader, name, 0, (fbx) => {
            if (fbx) {
              this.models_[name].asset = fbx;

              const queue = this.models_[name].queue;
              this.models_[name].queue = null;
              for (let q of queue) {
                const clone = this.models_[name].asset.clone();
                q(clone);
              }
            } else {
              // Failed to load - notify all waiting callbacks with null
              const queue = this.models_[name].queue;
              this.models_[name].queue = null;
              console.error(`Failed to load FBX model: ${name}`);
              for (let q of queue) {
                q(null);
              }
            }
            onComplete();
          });
        });
      } else if (this.models_[name].asset == null) {
        this.models_[name].queue.push(onLoad);
      } else {
        const clone = this.models_[name].asset.clone();
        onLoad(clone);
      }
    }

    LoadFBXWithRetry_(loader, name, attempt, callback) {
      loader.load(
        name,
        (fbx) => {
          callback(fbx);
        },
        undefined,
        (error) => {
          console.error(`Failed to load FBX ${name}, attempt ${attempt + 1}`, error);
          if (attempt < this.retryAttempts_) {
            const timer = setTimeout(() => {
              // Remove this timer from tracking
              const index = this.retryTimers_.indexOf(timer);
              if (index > -1) {
                this.retryTimers_.splice(index, 1);
              }
              this.LoadFBXWithRetry_(loader, name, attempt + 1, callback);
            }, this.retryDelay_);
            this.retryTimers_.push(timer);
          } else {
            console.error(`FBX ${name} failed after ${this.retryAttempts_} attempts`);
            callback(null);
          }
        }
      );
    }

    LoadSkinnedGLB(path, name, onLoad) {
      if (!(name in this.models_)) {
        const loader = new GLTFLoader();
        loader.setPath(path);

        this.models_[name] = {loader: loader, asset: null, queue: [onLoad]};
        
        // Queue the load
        this.EnqueueLoad_((onComplete) => {
          this.LoadGLBWithRetry_(loader, name, 0, (glb) => {
            if (glb) {
              this.models_[name].asset = glb;

              glb.scene.traverse(c => {
                // HAHAHAH
                c.frustumCulled = false;
                // Apparently this doesn't work, so just disable frustum culling.
                // Bugs... so many bugs...

                // if (c.geometry) {
                //   // Just make our own, super crappy, super big box
                //   c.geometry.boundingBox = new THREE.Box3(
                //       new THREE.Vector3(-50, -50, -50),
                //       new THREE.Vector3(50, 50, 50));
                //   c.geometry.boundingSphere = new THREE.Sphere();
                //   c.geometry.boundingBox.getBoundingSphere(c.geometry.boundingSphere);
                // }
              });

              const queue = this.models_[name].queue;
              this.models_[name].queue = null;
              for (let q of queue) {
                const clone = {...glb};
                clone.scene = SkeletonUtils.clone(clone.scene);

                q(clone);
              }
            } else {
              // Failed to load - notify all waiting callbacks with null
              const queue = this.models_[name].queue;
              this.models_[name].queue = null;
              console.error(`Failed to load GLB model: ${name}`);
              for (let q of queue) {
                q(null);
              }
            }
            onComplete();
          });
        });
      } else if (this.models_[name].asset == null) {
        this.models_[name].queue.push(onLoad);
      } else {
        const clone = {...this.models_[name].asset};
        clone.scene = SkeletonUtils.clone(clone.scene);

        onLoad(clone);
      }
    }

    LoadGLBWithRetry_(loader, name, attempt, callback) {
      loader.load(
        name,
        (glb) => {
          callback(glb);
        },
        undefined,
        (error) => {
          console.error(`Failed to load GLB ${name}, attempt ${attempt + 1}`, error);
          if (attempt < this.retryAttempts_) {
            const timer = setTimeout(() => {
              // Remove this timer from tracking
              const index = this.retryTimers_.indexOf(timer);
              if (index > -1) {
                this.retryTimers_.splice(index, 1);
              }
              this.LoadGLBWithRetry_(loader, name, attempt + 1, callback);
            }, this.retryDelay_);
            this.retryTimers_.push(timer);
          } else {
            console.error(`GLB ${name} failed after ${this.retryAttempts_} attempts`);
            callback(null);
          }
        }
      );
    }
  }

  return {
      LoadController: LoadController,
  };
})();