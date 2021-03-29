import {quat, vec3} from 'gl-matrix';

import {defs} from 'shared/src/defs';
import {STATE_TYPES, EVENT_TYPES, ATTACK_TYPES} from 'shared/src/constants'


export const world_entity = (() => {

  class Action_Attack {
    #onAction: any;
    #time: number;
    #cooldown: number;
    #timeElapsed: number;

    constructor(time, cooldown, onAction) {
      this.#onAction = onAction;
      this.#time = time;
      this.#cooldown = cooldown;
      this.#timeElapsed = 0.0;
    }
  
    get Finished() {
      return this.#timeElapsed > this.#cooldown;
    }
  
    Update(timeElapsed) {
      const oldTimeElapsed = this.#timeElapsed;
      this.#timeElapsed += timeElapsed;
      if (this.#timeElapsed > this.#time &&
          oldTimeElapsed <= this.#time) {
        this.#onAction();
      }
    }
  };

  class WorldEntity {
    id_: string;
    state_: string;
    position_: vec3;
    rotation_: quat;
    accountInfo_: {
      name: string;
    }
    characterDefinition_: any;
    characterInfo_: {
      class: any;
      inventory: any;
    };
    stats_: any;
    events_: any[];
    grid_: any;
    gridClient_: any;
    updateTimer_: number;
    action_: any;

    constructor(params) {
      this.id_ = params.id;
      this.state_ = STATE_TYPES.IDLE;
      this.position_ = vec3.clone(params.position);
      this.rotation_ = quat.clone(params.rotation);

      // HACK
      this.accountInfo_ = {
          name: params.account.accountName,
      };
      this.characterDefinition_ = params.character.definition;
      this.characterInfo_ = {
        class: params.character.class,
        inventory: {...this.characterDefinition_.inventory},
      };
      this.stats_ = {...this.characterDefinition_.stats};
      this.events_ = [];
      this.grid_ = params.grid;
      this.gridClient_ = this.grid_.NewClient(
          [this.position_[0], this.position_[2]], [10, 10]);
      this.gridClient_.entity = this;
  
      this.updateTimer_ = 0.0;
      this.action_ = null;
    }

    Destroy() {
      this.grid_.Remove(this.gridClient_);
      this.gridClient_ = null;
    }
  
    get ID() {
      return this.id_;
    }

    get Valid() {
      return this.gridClient_ != null;
    }
  
    get Health() {
      return this.stats_.health;
    }

    GetDescription() {
      return {
        account: this.accountInfo_,
        character: this.characterInfo_,
      };
    }
  
    CreatePlayerPacket_() {
      return {
          id: this.ID,
          desc: this.GetDescription(),
          transform: this.CreateTransformPacket_(),
      };
    }
  
    CreateStatsPacket_() {
      return [this.ID, this.stats_];
    }
  
    CreateEventsPacket_() {
      return this.events_;
    }

    CreateTransformPacket_() {
      return [
          this.state_,
          [...this.position_],
          [...this.rotation_],
      ];
    }
  
    UpdateTransform(transformData: [string, vec3, quat] ) {
      const newState = transformData[0];
      const [vecX, vecY, vecZ] = transformData[1];
      const [quatX, quatY, quatZ, quatW] = transformData[2]

      if (this.stats_.health <= 0) {
        this.SetState(STATE_TYPES.DEATH);
      }
      
      this.state_ = transformData[0]
      
      this.position_ = vec3.fromValues(vecX, vecY, vecZ);
      this.rotation_ = quat.fromValues(quatX, quatY, quatZ, quatW);

      this.UpdateGridClient_();
    }

    UpdateGridClient_() {
      this.gridClient_.position = [this.position_[0], this.position_[2]];
      this.grid_.UpdateClient(this.gridClient_);
    }
  
    UpdateInventory(inventory) {
      this.characterInfo_.inventory = inventory;
    }

    OnActionAttack() {
      if (this.action_) {
        return;
      }
  
      this.action_ = new Action_Attack(
          this.characterDefinition_.attack.timing,
          this.characterDefinition_.attack.cooldown,
          () => {
        this.OnActionAttack_Fired();
      });
    }
  
    OnActionAttack_Fired() {
      // wheee hardcoded :(
      const nearby = this.FindNear(50.0);
  
      const _Filter = (c) => {
        if (c.Health == 0) {
          return false;
        }

        const dist = vec3.distance(c.position_, this.position_);
        return dist <= this.characterDefinition_.attack.range;
      };
  
      const attackable = nearby.filter(_Filter);
      for (let a of attackable) {
        const target = a;
  
        const dirToTarget = vec3.create();
        vec3.sub(dirToTarget, target.position_, this.position_);
        vec3.normalize(dirToTarget, dirToTarget);
  
        const forward = vec3.fromValues(0, 0, 1);
        vec3.transformQuat(forward, forward, this.rotation_);
        vec3.normalize(forward, forward);
  
        const dot = vec3.dot(forward, dirToTarget);
        if (dot < 0.9 || dot > 1.1) {
          continue;
        }

        // Calculate damage, use equipped weapon + whatever, this will be bad.
        let damage = 0;
        
        console.log('attacking: ' + target.accountInfo_.name);

        if (this.characterDefinition_.attack.type == ATTACK_TYPES.MELEE) {
          damage = (this.stats_.strength / 5.0);

          const equipped = this.characterInfo_.inventory['inventory-equip-1'];
          if (equipped) {
            console.log(' equipped: ' + equipped);
            const weapon = defs.WEAPONS_DATA[equipped];
            if (weapon) {
              damage *= weapon.damage * 10;
            }
          }
        } else {
          damage = (this.stats_.wisdomness / 10.0);
        }

        console.log(' damage: ' + damage);
  
        target.OnDamage(this, damage);
        
        this.onEvent_(EVENT_TYPES.ATTACK_DAMAGE, {target: target, damage: damage});
      }
    }

    onEvent_(eventType: string, data) {
      console.error("This is the fake error Jeremy put in to see if this undefined onEvent_ function was ever called.")
    }
  
    OnDamage(attacker, damage) {
      this.stats_.health -= damage;
      this.stats_.health = Math.max(0.0, this.stats_.health);
      this.events_.push({
          type: EVENT_TYPES.ATTACK,
          target: this.ID,
          attacker: attacker.ID,
          amount: damage
      });
  
      if (this.stats_.health <= 0) {
        this.SetState(STATE_TYPES.DEATH);
      }
    }
  
    SetState(s) {
      if (this.state_ != STATE_TYPES.DEATH) {
        this.state_ = s;
      }
    }

    FindNear(radius, includeSelf?: boolean) {
      let nearby = this.grid_.FindNear(
          [this.position_[0], this.position_[2]], [radius, radius]).map(c => c.entity);
      
      if (!includeSelf) {
        const _Filter = (e) => {
            return e.ID != this.ID;
        };
        nearby = nearby.filter(_Filter);
      }
      return nearby;
    }
  
    Update(timeElapsed) {
      this.UpdateActions_(timeElapsed);
    }
  
    UpdateActions_(timeElapsed) {
      if (!this.action_) {
        // Hack, again, should move this all through events
        if (this.state_ == STATE_TYPES.ATTACK) {
          this.SetState(STATE_TYPES.IDLE);
        }
        return;
      }
  
      this.action_.Update(timeElapsed);
      if (this.action_.Finished) {
        this.action_ = null;
        this.SetState(STATE_TYPES.IDLE);
      }
    }
  };


  return {
      WorldEntity: WorldEntity,
  };
})();