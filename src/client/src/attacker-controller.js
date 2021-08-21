import { entity } from './entity.js'

export const attack_controller = (() => {
  class AttackController extends entity.Component {
    constructor() {
      super()
      this.action_ = null
    }

    InitComponent() {
      this._RegisterHandler('player.action', (m) => {
        this._OnAnimAction(m)
      })
    }

    _OnAnimAction(m) {
      if (m.action != 'attack') {
        this.action_ = m.action
        return
      } else if (m.action != this.action_) {
        this.action_ = m.action
        this.Broadcast({
          topic: 'action.attack'
        })
      }
    }
  }

  return {
    AttackController: AttackController
  }
})()
