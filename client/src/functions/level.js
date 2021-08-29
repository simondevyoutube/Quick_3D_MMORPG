import { THREE } from "../deps.js";
import { ParticleSystem } from "../entities/particle.js";

export class LevelUpComponentSpawner {
  constructor(params) {
    this._params = params;
  }

  Spawn(pos) {
    const e = new Entity();
    e.setPosition(pos);
    e.AddComponent(new LevelUpComponent(this._params));
    this.Manager.add(e);

    return e;
  }
}

export class LevelUpComponent {
  constructor(params) {
    this._params = params;

    this._particles = new ParticleSystem({
      camera: params.camera,
      parent: params.scene,
      texture: "./resources/textures/ball.png",
    });
    this._particles._alphaSpline.AddPoint(0.0, 0.0);
    this._particles._alphaSpline.AddPoint(0.1, 1.0);
    this._particles._alphaSpline.AddPoint(0.7, 1.0);
    this._particles._alphaSpline.AddPoint(1.0, 0.0);

    this._particles._colourSpline.AddPoint(0.0, new THREE.Color(0x00FF00));
    this._particles._colourSpline.AddPoint(0.5, new THREE.Color(0x40C040));
    this._particles._colourSpline.AddPoint(1.0, new THREE.Color(0xFF4040));

    this._particles._sizeSpline.AddPoint(0.0, 0.05);
    this._particles._sizeSpline.AddPoint(0.5, 0.25);
    this._particles._sizeSpline.AddPoint(1.0, 0.0);
  }

  initComponent() {
    this._particles.AddParticles(this.parent.position, 300);
  }

  update(timeElapsed) {
    this._particles.Step(timeElapsed);
    if (this._particles._particles.length == 0) {
      this.parent.SetActive(false);
    }
  }
}
