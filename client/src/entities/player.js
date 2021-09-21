import { OrbitControls, cannon } from "../deps.js";
import { Input } from "./input.js";
import { create } from "./model.js";
import { Entity } from "./entity.js";


export class Player extends Entity {
  constructor (args) {
    super(args)
    args = Object.assign(args, {entity:this})
    this.input = new Input(args)
    this.camera = new OrbitControls(args.world.camera, args.world.renderer.domElement)
    this.camera.target.set(0, 0, 0)
    this.camera.update()
    this.model = create(args).then(val => {
      this.model = val.model;
      this.animator = val.animator
      this.body = val.physicsBody
      args.world.scene.add(val.model)
      if (args.world.physics) {
        args.world.physics.world.addBody(val.physicsBody)
      }
    })
  }

  update(deltaTime) {
    // this.camera.target.set(this.position)
    if (this.animator && this.model && this.body) {
      this.animator.update(deltaTime)
      const pos = this.body.position
      this.model.position.set(pos.x, pos.y, pos.z) 
    }
  }

  move(vec){
    if (this.body) {
      this.body.applyImpulse(new cannon.Vec3(vec[0], vec[1], vec[2]))
    }
  }

  destroy(){
    super.destroy()
    this.input = null
    this.camera.dispose()
    if (this.model instanceof Promise) {
      this.model.then(_ => {
        console.log(this.model);
        if (this.model.dispose) {
          this.model.dispose()
        }
      })
    } else {
      console.log("It wasn't a promise");
      // console.log(this.model);
      if (this.model.dispose) {
        this.model.dispose()
      } else {
        console.log(this.model);
        // this.model.traverse(child => {
        //   if (child.dispose) {
        //     child.dispose()
        //   }
        // })
      }
    }
  }
}
