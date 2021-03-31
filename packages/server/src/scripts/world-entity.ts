import { quat, vec3 } from 'gl-matrix';

import { Constants, Defs } from 'shared';
// import { IWorldEntity } from 'shared/src/globaltypes';
import type { WorldClient } from "./world-client";

const { STATE_TYPES, EVENT_TYPES, ATTACK_TYPES, WEAPONS_DATA } = { ...Constants, ...Defs };

class Action_Attack {
  #onAction: any;
  #time: number;
  #cooldown: number;
  #timeElapsed: number;

  constructor(time: number, cooldown: number, onAction: () => void) {
    this.#onAction = onAction;
    this.#time = time;
    this.#cooldown = cooldown;
    this.#timeElapsed = 0.0;
  }

  get Finished() {
    return this.#timeElapsed > this.#cooldown;
  }

  Update(timeElapsed: number) {
    const oldTimeElapsed = this.#timeElapsed;
    this.#timeElapsed += timeElapsed;
    if (this.#timeElapsed > this.#time &&
      oldTimeElapsed <= this.#time) {
      this.#onAction();
    }
  }
};

// interface IWorldEntity {
//   Destroy: () => void,
//   ID: string,
//   Valid: boolean,
//   Health: number,
//   GetDescription: () => any,
//   CreatePlayerPacket_: () => any,
//   CreateStatsPacket_: () => any,
//   CreateEventsPacket_: () => any,
//   CreateTransformPacket_: () => any,
//   UpdateInventory: (inventory: []) => void,
// }

class WorldEntity {
  id_;
  state_;
  position_;
  rotation_;
  accountInfo_: any;
  characterDefinition_;
  characterInfo_: any;
  stats_: any;
  events_: any;
  grid_;
  gridClient_;
  updateTimer_;
  action_: any;
  parent_!: WorldClient;
  isAI!: boolean;

  constructor(params: any) {
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
      inventory: { ...this.characterDefinition_.inventory },
    };
    this.stats_ = { ...this.characterDefinition_.stats };
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

  UpdateTransform(transformData: [string, vec3, quat]) {
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

  UpdateInventory(inventory: []) {
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

    const _Filter = (c: { Health: number, position_: vec3 }) => {
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
        // TS hack. Should move this definition up. 
        const equipped = this.characterInfo_.inventory['inventory-equip-1'] as string;
        const weaponsData = WEAPONS_DATA as { [key: string]: any };

        if (equipped) {
          console.log(' equipped: ' + equipped);
          const weapon = weaponsData[equipped] as { damage: number };
          if (weapon) {
            damage *= weapon.damage * 10;
          }
        }
      } else {
        damage = (this.stats_.wisdomness / 10.0);
      }

      console.log(' damage: ' + damage);

      target.OnDamage(this, damage);

      this.onEvent_(EVENT_TYPES.ATTACK_DAMAGE, { target: target, damage: damage });
    }
  }

  onEvent_(eventType: string, data: any) {
    console.error("This is the fake error Jeremy put in to see if this undefined onEvent_ function was ever called.")
  }

  OnDamage(attacker: WorldEntity, damage: number) {
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

  // this seems wrong to me. TS doesn't have a typeof ENUM it seems.
  SetState(s: string) {
    if (this.state_ != STATE_TYPES.DEATH) {
      this.state_ = s;
    }
  }

  FindNear(radius: number, includeSelf?: boolean) {
    let nearby = this.grid_.FindNear(
      [this.position_[0], this.position_[2]], [radius, radius]).map((c: any) => c.entity);

    if (!includeSelf) {
      const _Filter = (e: WorldEntity) => {
        return e.ID != this.ID;
      };
      nearby = nearby.filter(_Filter);
    }
    return nearby;
  }

  Update(timeElapsed: number) {
    this.UpdateActions_(timeElapsed);
  }

  UpdateActions_(timeElapsed: number) {
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

export { WorldEntity, Action_Attack };