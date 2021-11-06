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
    // console.log(event.key);
    switch (event.key) {
      case " ":
        this.entity.move.jump = 0
        break;
      case "w":
        this.entity.move.forward = 0
        break;
      case "s":
        this.entity.move.backward = 0
        break;
      case "a":
        this.entity.move.left = 0
        break;
      case "d":
        this.entity.move.right = 0
        break;
      default:
        break;
    }
  }

  handleKeydown(event) {
    // console.log(event.key);
    if (this.entity.canMove) {
      switch (event.key) {
        case " ":
          this.entity.move.jump = 1
          break;
        case "w":
          this.entity.move.forward = 1
          break;
        case "s":
          this.entity.move.backward = 1
          break;
        case "a":
          this.entity.move.left = 1 
          break;
        case "d":
          this.entity.move.right = 1
          break;
        default:
          break;
      } 
    }
  }
}
