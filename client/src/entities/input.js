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
  }

  handleKeydown(event) {
    // console.log(event.key);
    switch (event.key) {
      case " ":
        this.entity.move([0, 10, 0])
        break;
      case "w":
        this.entity.move([10, 0, 0])
        break;
      case "s":
        this.entity.move([-10, 0, 0])
        break;
      case "a":
        this.entity.move([0, 0, 10])
        break;
      case "d":
        this.entity.move([0, 0, -10])
        break;
      default:
        break;
    }
  }
}
