import { quat, vec3 } from "gl-matrix";
import { defs } from "../client/shared/defs";

export const world_entity = (() => {
  class Action_Attack {
    constructor(time, cooldown, onAction) {
      this.onAction_ = onAction;
      this.time_ = time;
      this.cooldown_ = cooldown;
      this.timeElapsed_ = 0.0;
    }

    get Finished() {
      return this.timeElapsed_ > this.cooldown_;
    }

    Update(timeElapsed) {
      const oldTimeElapsed = this.timeElapsed_;
      this.timeElapsed_ += timeElapsed;
      if (this.timeElapsed_ > this.time_ && oldTimeElapsed <= this.time_) {
        this.onAction_();
      }
    }
  }

  class WorldEntity {
    constructor(params) {
      this.id_ = params.id;
      this.state_ = "idle";
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
        [this.position_[0], this.position_[2]],
        [10, 10]
      );
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
      return [this.state_, [...this.position_], [...this.rotation_]];
    }

    UpdateTransform(transformData) {
      if (this.stats_.health <= 0) {
        this.SetState("death");
      }
      this.state_ = transformData[0];
      this.position_ = vec3.fromValues(...transformData[1]);
      this.rotation_ = quat.fromValues(...transformData[2]);

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
        }
      );
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

        console.log("attacking: " + target.accountInfo_.name);

        if (this.characterDefinition_.attack.type == "melee") {
          damage = this.stats_.strength / 5.0;

          const equipped = this.characterInfo_.inventory["inventory-equip-1"];
          if (equipped) {
            console.log(" equipped: " + equipped);
            const weapon = defs.WEAPONS_DATA[equipped];
            if (weapon) {
              damage *= weapon.damage * 10;
            }
          }
        } else {
          damage = this.stats_.wisdomness / 10.0;
        }

        console.log(" damage: " + damage);

        target.OnDamage(this, damage);

        this.onEvent_("attack.damage", { target: target, damage: damage });
      }
    }

    OnDamage(attacker, damage) {
      this.stats_.health -= damage;
      this.stats_.health = Math.max(0.0, this.stats_.health);
      this.events_.push({
        type: "attack",
        target: this.ID,
        attacker: attacker.ID,
        amount: damage,
      });

      if (this.stats_.health <= 0) {
        this.SetState("death");
      }
    }

    SetState(s) {
      if (this.state_ != "death") {
        this.state_ = s;
      }
    }

    FindNear(radius, includeSelf) {
      let nearby = this.grid_
        .FindNear([this.position_[0], this.position_[2]], [radius, radius])
        .map((c) => c.entity);

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
        if (this.state_ == "attack") {
          this.SetState("idle");
        }
        return;
      }

      this.action_.Update(timeElapsed);
      if (this.action_.Finished) {
        this.action_ = null;
        this.SetState("idle");
      }
    }
  }

  return {
    WorldEntity: WorldEntity,
  };
})();
