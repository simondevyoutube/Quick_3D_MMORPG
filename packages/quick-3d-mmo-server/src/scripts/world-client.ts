import { quat, vec3 } from 'gl-matrix';

import type { WorldEntity } from './world-entity.js';
import { SocketWrapper } from './world-server.js';

import { Constants, EntityManager as aEntityManager } from 'quick-3d-mmo-shared';

const { _TIMEOUT, EVENT_TYPES, EntityManager, STATE_TYPES } = { ...Constants, ...aEntityManager };

class WorldClient {
  entity: WorldEntity;
  client: SocketWrapper;
  #timeout: number;
  entityCache: any = {};
  terrain_: any;
  onDeath_: any;
  fsm_: any;
  deathTimer_!: number;
  timeout_!: number;

  constructor(client: SocketWrapper, entity: WorldEntity) {
    this.entity = entity;

    // Hack
    this.entity.onEvent_ = (t: any, d?: any) => this.OnEntityEvent_(t, d);

    this.client = client;
    this.client.onMessage = (e: any, d: any) => this.OnMessage_(e, d);
    this.client.Send(EVENT_TYPES.WORLD_PLAYER, this.entity.CreatePlayerPacket_());
    this.client.Send(EVENT_TYPES.WORLD_STATS, this.entity.CreateStatsPacket_());
    // console.log("Sent world.player, world.stats")
    this.#timeout = _TIMEOUT;

    this.entityCache = {};

    // Hack
    entity.parent_ = this;
  }

  Destroy() {
    this.client.Disconnect();
    this.client = null;

    this.entity.Destroy();
    this.entity = null;
  }

  OnDeath() { }

  OnEntityEvent_(t: any, d: any) {
    if (t == EVENT_TYPES.ATTACK_DAMAGE) {
      this.OnDamageEvent_(d);
    }
  }

  OnMessage_(evt: string, data: any) {
    this.#timeout = _TIMEOUT;

    if (evt == EVENT_TYPES.WORLD_UPDATE) {
      this.entity.UpdateTransform(data);
      return true;
    }

    if (evt == EVENT_TYPES.CHAT_MSG) {
      this.OnChatMessage_(data);
      return true;
    }

    if (evt == EVENT_TYPES.ACTION_ATTACK) {
      this.entity.OnActionAttack();
      return true;
    }

    if (evt == EVENT_TYPES.WORLD_INVENTORY) {
      this.OnInventoryChanged_(data);
      return true;
    }

    return false;
  }

  OnDamageEvent_(_: any) { }

  OnInventoryChanged_(inventory: []) {
    this.entity.UpdateInventory(inventory);

    // Todo: Merge this into entityCache path.
    const nearby = this.entity.FindNear(50, true);

    for (let n of nearby) {
      n.parent_.client.Send(EVENT_TYPES.WORLD_INVENTORY, [this.entity.ID, inventory]);
    }
  }

  OnChatMessage_(message) {
    const chatMessage = {
      name: this.entity.accountInfo_.name,
      text: message,
    };

    this.BroadcastChat(chatMessage);
  }

  BroadcastChat(chatMessage) {
    const nearby = this.entity.FindNear(50, true);

    for (let i = 0; i < nearby.length; ++i) {
      const n = nearby[i];
      // This is different from chat.msg?
      n.parent_.client.Send(EVENT_TYPES.CHAT_MESSAGE, chatMessage);
    }
  }

  get IsDead() {
    return this.#timeout <= 0.0;
  }

  OnUpdate_(timeElapsed) { }

  OnUpdateClientState_() { }

  UpdateClientState_() {
    this.OnUpdateClientState_();
  }

  Update(timeElapsed) {
    this.#timeout -= timeElapsed;

    this.entity.Update(timeElapsed);

    this.OnUpdate_(timeElapsed);
  }
};


class WorldNetworkClient extends WorldClient {
  entity: any;
  entityCache: any;
  constructor(client, entity) {
    super(client, entity);
    this.entity
  }

  OnUpdate_(timeElapsed) {
  }

  OnUpdateClientState_() {
    const _Filter = (e) => {
      return e.ID != this.entity.ID;
    };

    const nearby = this.entity.FindNear(500).filter(e => _Filter(e));

    const updates = [{
      id: this.entity.ID,
      stats: this.entity.CreateStatsPacket_(),
      events: this.entity.CreateEventsPacket_(),
    }];
    const newCache_ = {};

    for (let n of nearby) {
      // We could easily trim this down based on what we know
      // this client saw last. Maybe do it later.
      const cur = {
        id: n.ID,
        transform: n.CreateTransformPacket_(),
        stats: n.CreateStatsPacket_(),
        events: n.CreateEventsPacket_(),
        desc: null,
      };

      if (!(n.ID in this.entityCache)) {
        cur.desc = n.GetDescription();
      }

      newCache_[n.ID] = cur;
      updates.push(cur);
    }

    this.entityCache = newCache_;

    this.client.Send(EVENT_TYPES.WORLD_UPDATE, updates);
  }
};


class AIStateMachine {
  currentState_: any;
  entity: any;
  terrain_: InstanceType<typeof EntityManager>;
  constructor(entity: WorldEntity, terrain: InstanceType<typeof EntityManager>) {
    this.currentState_ = null;
    this.entity = entity;
    this.terrain_ = terrain;
  }

  SetState(state: any) {
    const prevState = this.currentState_;

    if (prevState) {
      if (prevState.constructor.name == state.constructor.name) {
        return;
      }
      prevState.Exit();
    }

    this.currentState_ = state;
    this.currentState_.parent_ = this;
    this.currentState_.entity = this.entity;
    this.currentState_.terrain_ = this.terrain_;
    state.Enter(prevState);
  }

  Update(timeElapsed: number) {
    if (this.currentState_) {
      this.currentState_.Update(timeElapsed);
    }
  }
};

class AIState {
  timer_!: number;
  entity: any;
  parent_: any;
  target_: any;
  terrain_: any;
  constructor() { }
  Exit() { }
  Enter() { }
  Update(timeElapsed: number) { }
}

class AIState_JustSitThere extends AIState {
  constructor(target?: any) {
    super();

    this.timer_ = 0.0;
  }

  UpdateLogic_() {
    const _IsPlayer = (e) => {
      return !e.isAI;
    };
    const nearby = this.entity.FindNear(50.0).filter(e => e.Health > 0).filter(_IsPlayer);

    if (nearby.length > 0) {
      this.parent_.SetState(new AIState_FollowToAttack(nearby[0]));
    }
  }

  Update(timeElapsed) {
    this.timer_ += timeElapsed;
    this.entity.SetState(STATE_TYPES.IDLE);

    if (this.timer_ > 5.0) {
      this.UpdateLogic_();
      this.timer_ = 0.0;
    }
  }
};

class AIState_FollowToAttack extends AIState {
  constructor(target) {
    super();
    this.target_ = target;
  }

  UpdateMovement_(timeElapsed) {
    this.entity.state_ = STATE_TYPES.WALK;

    const direction = vec3.create();
    const forward = vec3.fromValues(0, 0, 1);

    vec3.sub(direction, this.target_.position_, this.entity.position_);
    direction[1] = 0.0;

    vec3.normalize(direction, direction);
    quat.rotationTo(this.entity.rotation_, forward, direction);

    const movement = vec3.clone(direction);
    vec3.scale(movement, movement, timeElapsed * 10.0);

    vec3.add(this.entity.position_, this.entity.position_, movement);

    this.entity.position_[1] = this.terrain_.Get(...this.entity.position_)[0];
    this.entity.UpdateGridClient_();

    const distance = vec3.distance(this.entity.position_, this.target_.position_);

    if (distance < 10.0) {
      this.entity.OnActionAttack();
      this.parent_.SetState(new AIState_WaitAttackDone(this.target_));
    } else if (distance > 100.0) {
      this.parent_.SetState(new AIState_JustSitThere());
    }
  }

  Update(timeElapsed: number) {
    if (!this.target_.Valid || this.target_.Health == 0) {
      this.parent_.SetState(new AIState_JustSitThere(this.target_));
      return;
    }

    this.UpdateMovement_(timeElapsed);
  }
};


class AIState_WaitAttackDone extends AIState {
  constructor(target: WorldEntity) {
    super();
    this.target_ = target;
  }

  Update(_) {
    this.entity.state_ = STATE_TYPES.ATTACK;
    if (this.entity.action_) {
      return;
    }

    this.parent_.SetState(new AIState_FollowToAttack(this.target_));
  }
};


class FakeClient extends SocketWrapper {
  constructor() {
    super({socket: null})
  }

  Send(msg, data) { }

  Disconnect() { }
};

class WorldAIClient extends WorldClient {
  constructor(entity: WorldEntity, terrain: any, onDeath) {
    super(new FakeClient(), entity);
    this.terrain_ = terrain;
    this.onDeath_ = onDeath;
    // Haha sorry
    this.entity.isAI = true;

    this.fsm_ = new AIStateMachine(entity, this.terrain_);
    this.fsm_.SetState(new AIState_JustSitThere());

    this.deathTimer_ = 0.0;
  }

  get IsDead() {
    return this.deathTimer_ >= 30.0;
  }

  OnDeath() {
    this.onDeath_();
  }

  OnUpdateClientState_() { }

  OnUpdate_(timeElapsed: number) {
    // Never times out
    this.timeout_ = 1000.0;

    if (this.entity.Health > 0) {
      this.fsm_.Update(timeElapsed);
    } else {
      this.deathTimer_ += timeElapsed;
    }
  }
};

export {
  WorldNetworkClient,
  WorldAIClient,
  WorldClient,
}