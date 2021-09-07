import { cannon } from "../deps";

export class Input {
  constructor(args) {
    // not needed yet but we'll see
    this.entity = args.entity
  }

  handlePointerup(event){
    // console.log(event);
  }

  handlePointerdown(event){
    // console.log(event);
  }

  handleKeyup(event) {
    console.log(event.key);
    switch (event.key) {
      case " ":
        this.entity.model.collisionBody.applyImpulse(new cannon.Vec3(0, 10, 0))
        break;
      default:
        break;
    }
  }

  handleKeydown(event) {
    // console.log(event.key);
  }
}
