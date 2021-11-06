export class Input {
  constructor(arg) {
    // not needed yet but we'll see
    this.world = arg
    this.worldFocused = false
    // for rotating the camera
    this.playerfocused = false
  }

  handlePointerup(event){
    if (this.playerFocused) {
      if (this.world.entities) {
        this.world.entities.player.input.handlePointerup(event)
      }
    }
    this.playerFocused = false
  }

  handlePointerdown(event){
    if (event.target.id == "game") {
      this.playerFocused = true
      this.worldFocused = true
    } else {
      this.playerFocused = false
      this.worldFocused = false
    }
    if (this.playerFocused) {
      if (this.world.entities) {
        this.world.entities.player.input.handlePointerdown(event)
      }
    }
  }

  handleKeyup(event) {
    if (this.worldFocused) {
      this.world.entities.player.input.handleKeyup(event)
    }
  }

  handleKeydown(event) {
    if (this.worldFocused) {
      this.world.entities.player.input.handleKeydown(event)
    }
  }
}
