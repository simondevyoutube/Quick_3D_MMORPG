import { THREE } from "../../deps.js";
import { Animate } from "../animate.js";
import { CharacterFSM } from "../characterFSM.js";
import { paladin, sorceror, warrok, zombie } from "../../data/models/characters/mod.js";

const CHARACTER_MODELS = (arg) => {
  switch (arg) {
    case "paladin":
      return paladin
    case "sorceror":
      return sorceror
    case "warrok":
      return warrok
    case "zombie":
      return zombie
    default:
      return undefined
  } 
}

export class NPCMovement {
  animations_ = {};
  group_ = new THREE.Group();
  queuedState_ = undefined;

  constructor(world, desc) {
    this.world = world
    this.desc = desc
  }

  destroy() {
    this.group_.traverse((c) => {
      if (c.material) {
        let materials = c.material;
        if (!(c.material instanceof Array)) {
          materials = [c.material];
        }
        for (let m of materials) {
          m.dispose();
        }
      }

      if (c.geometry) {
        c.geometry.dispose();
      }
    });
    this.params_.scene.remove(this.group_);
  }

  InitEntity() {
    this._Init();
  }

  _Init() {

    this.world.scene.add(this.group_);

    this.LoadModels_();
  }

  initComponent() {
    this.registerHandler("health.death", (m) => {
      this.OnDeath_(m);
    });
    this.registerHandler("update.position", (m) => {
      this.OnPosition_(m);
    });
    this.registerHandler("update.quaternion", (m) => {
      this.OnRotation_(m);
    });
  }

  SetState(s) {
    if (!this.stateMachine_) {
      this.queuedState_ = s;
      return;
    }

    // hack: should propogate attacks through the events on server
    // Right now, they're inferred from whatever animation we're running, blech
    if (s == "attack" && this.stateMachine_._currentState.Name != "attack") {
      this.broadcast({
        topic: "action.attack",
      });
    }

    this.stateMachine_.SetState(s);
  }

  OnDeath_(msg) {
    this.SetState("death");
  }

  OnPosition_(m) {
    this.group_.position.copy(m.value);
  }

  OnRotation_(m) {
    this.group_.quaternion.copy(m.value);
  }

  LoadModels_() {
    // TODO-DefinitelyMaybe: maybe don't worry about models within the move functionality
    const classType = this.desc.character.class;
    const modelData = CHARACTER_MODELS(classType);

    const loader = this.world.assets
    /*
    import {SkeletonClone} from "../deps.js"
            // TODO-DefinitelyMaybe: Sort out the skeleton
        // glb.scene.traverse((c) => {
        //   c.frustumCulled = false;
        // });

        // const clone = { ...glb };
        // clone.scene = SkeletonClone(clone.scene);

        onload(clone);
        ^^^
        onload = anon function below
    */
    loader.LoadSkinnedGLB(modelData.path, modelData.base, (glb) => {
      this.target_ = glb.scene;
      this.target_.scale.setScalar(modelData.scale);
      this.target_.visible = false;

      this.group_.add(this.target_);

      this.bones_ = {};
      this.target_.traverse((c) => {
        if (!c.skeleton) {
          return;
        }
        for (let b of c.skeleton.bones) {
          this.bones_[b.name] = b;
        }
      });

      this.target_.traverse((c) => {
        c.castShadow = true;
        c.receiveShadow = true;
        if (c.material && c.material.map) {
          c.material.map.encoding = THREE.sRGBEncoding;
        }
      });

      this.mixer_ = new THREE.AnimationMixer(this.target_);

      const _FindAnim = (animName) => {
        for (let i = 0; i < glb.animations.length; i++) {
          if (glb.animations[i].name.includes(animName)) {
            const clip = glb.animations[i];
            const action = this.mixer_.clipAction(clip);
            return {
              clip: clip,
              action: action,
            };
          }
        }
        return undefined;
      };

      this.animations_["idle"] = _FindAnim("Idle");
      this.animations_["walk"] = _FindAnim("Walk");
      this.animations_["run"] = _FindAnim("Run");
      this.animations_["death"] = _FindAnim("Death");
      this.animations_["attack"] = _FindAnim("Attack");
      this.animations_["dance"] = _FindAnim("Dance");

      this.target_.visible = true;

      this.stateMachine_ = new CharacterFSM(
        new Animate(this.animations_),
      );

      if (this.queuedState_) {
        this.stateMachine_.SetState(this.queuedState_);
        this.queuedState_ = undefined;
      } else {
        this.stateMachine_.SetState("idle");
      }

      this.broadcast({
        topic: "load.character",
        model: this.group_,
        bones: this.bones_,
      });
    });
  }

  update(timeInSeconds) {
    if (!this.stateMachine_) {
      return;
    }
    this.stateMachine_.update(timeInSeconds, undefined);

    if (this.mixer_) {
      this.mixer_.update(timeInSeconds);
    }
  }
}