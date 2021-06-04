import { quat, vec3 } from "./deps.ts";
import { _WEAPONS_DATA } from "../../client/shared/defs.js";
import { SpatialHashGrid } from "../../client/shared/spatial-hash-grid.js";
import { HeightGenerator } from "../../client/shared/terrain-height.js";
import { _CHARACTER_MODELS } from "../../client/shared/defs.js";

export const _TICK_RATE = 0.1;
export const _TIMEOUT = 600.0;

export class World {
  performance: Performance;
  // This is descrete maths. The world updates in a number of ticks per second.
  tick: number = 10; // possible values: 10, 16, 20, 30, 60 ...
  // try to go for numbers that divide into 1000 without any remainder
  millisecondsPerTick = 1000 / this.tick;
  minDelta = this.millisecondsPerTick / 1000;
  // higher numbers means more work for the server
  // probably better to do less work and then
  // have the clients interpolate between the values received

  running = false;
  // manager = new Manager()

  constructor() {
    // from Deno runtime API
    this.performance = performance;

    // this.loginQueue_ = new LoginQueue(
    //   (c, p) => {
    //     this.OnLogin_(c, p);
    //   },
    // );

    // this.;
    // this.SetupIO_(io);
  }

  // SetupIO_(io) {
  //   io.on("connection", (socket) => {
  //     this.loginQueue_.Add(new SocketWrapper({ socket: socket }));
  //   });
  // }

  // OnLogin_(client, params) {
  //   this.manager.Add(client, params);
  // }

  start() {
    console.log("The world has started.");
    this.running = true;
    let t1 = this.performance.now();
    this.schedule(t1);
  }

  schedule(t1: number) {
    let t2 = this.performance.now();
    // maximum because we'd like to be lazy if we can
    const delta = Math.max((t2 - t1) * 0.001, this.minDelta);
    this.update(delta);

    setTimeout(() => {
      this.schedule(t2);
    }, delta);
  }

  update(timeElapsed: number) {
    // this.manager.Update(timeElapsed);
  }

  on(event: Event) {
  }
}

export class Manager {
  ids_: number;
  entities_: never[];
  grid_: SpatialHashGrid;
  terrain_: HeightGenerator;
  spawners_: never[];
  tickTimer_: number;
  constructor() {
    this.ids_ = 0;
    this.entities_ = [];
    this.grid_ = new SpatialHashGrid(
      [[-4000, -4000], [4000, 4000]],
      [1000, 1000],
    );

    this.terrain_ = new HeightGenerator();

    this.spawners_ = [];
    this.tickTimer_ = 0.0;

    // Hack
    for (let x = -40; x <= 40; ++x) {
      for (let z = -40; z <= 40; ++z) {
        if (Math.random() < 0.1) {
          const pos = vec3.fromValues(x * 75, 0, z * 75);
          if (Math.random() < 0.1) {
            this.spawners_.push(
              new MonsterSpawner({
                parent: this,
                pos: pos,
                class: "warrok",
              }),
            );
          } else {
            this.spawners_.push(
              new MonsterSpawner({
                parent: this,
                pos: pos,
                class: "zombie",
              }),
            );
          }
        }
      }
    }
  }

  AddMonster(e: any) {
    this.entities_.push(e);
  }

  Add(client: any, params: { accountName: string }) {
    const models = ["sorceror", "paladin"];
    const randomClass = models[
      Math.floor(Math.random() * models.length)
    ];

    // Hack
    const e = new WorldEntity({
      id: this.ids_++,
      position: vec3.fromValues(
        -60 + (Math.random() * 2 - 1) * 20,
        0,
        (Math.random() * 2 - 1) * 20,
      ),
      rotation: quat.fromValues(0, 0, 0, 1),
      grid: this.grid_,
      character: {
        definition: _CHARACTER_MODELS[randomClass],
        class: randomClass,
      },
      account: params,
    });

    const wc = new WorldNetworkClient(client, e);

    this.entities_.push(wc);

    wc.BroadcastChat({
      name: "",
      server: true,
      text: "[" + params.accountName + " has entered the game]",
    });
  }

  Update(timeElapsed: any) {
    this.TickClientState_(timeElapsed);
    this.UpdateEntities_(timeElapsed);
    this.UpdateSpawners_(timeElapsed);
  }

  TickClientState_(timeElapsed: number) {
    this.tickTimer_ += timeElapsed;
    if (this.tickTimer_ < _TICK_RATE) {
      return;
    }

    this.tickTimer_ = 0.0;

    for (let i = 0; i < this.entities_.length; ++i) {
      this.entities_[i].UpdateClientState_();
    }
    for (let i = 0; i < this.entities_.length; ++i) {
      this.entities_[i].entity_.events_ = [];
    }
  }

  UpdateSpawners_(timeElapsed: any) {
    for (let i = 0; i < this.spawners_.length; ++i) {
      this.spawners_[i].Update(timeElapsed);
    }
  }

  UpdateEntities_(timeElapsed: any) {
    const dead: never[] = [];
    const alive: never[] = [];

    for (let i = 0; i < this.entities_.length; ++i) {
      const e = this.entities_[i];

      e.Update(timeElapsed);

      if (e.IsDead) {
        console.log("killed it off");
        dead.push(e);
      } else {
        alive.push(e);
      }
    }

    this.entities_ = alive;

    for (let d of dead) {
      d.OnDeath();
      d.Destroy();
    }
  }
}

export class MonsterSpawner {
  parent_: any;
  grid_: any;
  terrain_: any;
  pos_: any;
  params_: any;
  entity_: null;
  constructor(params: { parent: any; pos: any; class?: string }) {
    this.parent_ = params.parent;
    this.grid_ = this.parent_.grid_;
    this.terrain_ = this.parent_.terrain_;
    this.pos_ = params.pos;
    this.pos_[1] = this.terrain_.Get(...params.pos)[0];
    this.params_ = params;
  }

  Spawn_() {
    // Hack
    const e = new WorldEntity({
      id: this.parent_.ids_++,
      position: vec3.clone(this.pos_),
      rotation: quat.fromValues(0, 0, 0, 1),
      grid: this.grid_,
      character: {
        definition: _CHARACTER_MODELS[this.params_.class],
        class: this.params_.class,
      },
      account: { accountName: _CHARACTER_MODELS[this.params_.class].name },
    });

    const wc = new WorldAIClient(e, this.terrain_, () => {
      this.entity_ = null;
      console.log("entity gone, spawner making now one soon");
    });

    this.parent_.AddMonster(wc);

    this.entity_ = wc;
  }

  Update(timeElapsed: any) {
    if (!this.entity_) {
      this.Spawn_();
    }
  }
}

export class Action_Attack {
  onAction_: any;
  time_: any;
  cooldown_: any;
  timeElapsed_: number;
  constructor(time: any, cooldown: any, onAction: () => void) {
    this.onAction_ = onAction;
    this.time_ = time;
    this.cooldown_ = cooldown;
    this.timeElapsed_ = 0.0;
  }

  get Finished() {
    return this.timeElapsed_ > this.cooldown_;
  }

  Update(timeElapsed: number) {
    const oldTimeElapsed = this.timeElapsed_;
    this.timeElapsed_ += timeElapsed;
    if (
      this.timeElapsed_ > this.time_ &&
      oldTimeElapsed <= this.time_
    ) {
      this.onAction_();
    }
  }
}

export class WorldEntity {
  id_: any;
  state_: string;
  position_: any;
  rotation_: any;
  accountInfo_: { name: any };
  characterDefinition_: any;
  characterInfo_: { class: any; inventory: any };
  events_: never[];
  grid_: any;
  gridClient_: any;
  updateTimer_: number;
  action_: null;
  stats_: any;
  constructor(
    params: {
      id: any;
      position: any;
      rotation: any;
      grid: any;
      character: any;
      account: any;
    },
  ) {
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
    this.state_ = { ...this.characterDefinition_.stats };
    this.events_ = [];
    this.grid_ = params.grid;
    this.gridClient_ = this.grid_.NewClient(
      [this.position_[0], this.position_[2]],
      [10, 10],
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
    return [
      this.state_,
      [...this.position_],
      [...this.rotation_],
    ];
  }

  UpdateTransform(transformData: any[]) {
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

  UpdateInventory(inventory: any) {
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
      },
    );
  }

  OnActionAttack_Fired() {
    // wheee hardcoded :(
    const nearby = this.FindNear(50.0);

    const _Filter = (c: { Health: number; position_: any }) => {
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
        damage = (this.stats_.strength / 5.0);

        const equipped = this.characterInfo_.inventory["inventory-equip-1"];
        if (equipped) {
          console.log(" equipped: " + equipped);
          const weapon = _WEAPONS_DATA[equipped];
          if (weapon) {
            damage *= weapon.damage * 10;
          }
        }
      } else {
        damage = (this.stats_.wisdomness / 10.0);
      }

      console.log(" damage: " + damage);

      target.OnDamage(this, damage);

      this.onEvent_("attack.damage", { target: target, damage: damage });
    }
  }
  onEvent_(arg0: string, arg1: { target: any; damage: number }) {
    throw new Error("Method not implemented.");
  }

  OnDamage(attacker: { ID: any }, damage: number) {
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

  SetState(s: string) {
    if (this.state_ != "death") {
      this.state_ = s;
    }
  }

  FindNear(radius: number, includeSelf: undefined) {
    let nearby = this.grid_.FindNear(
      [this.position_[0], this.position_[2]],
      [radius, radius],
    ).map((c: { entity: any }) => c.entity);

    if (!includeSelf) {
      const _Filter = (e: { ID: any }) => {
        return e.ID != this.ID;
      };
      nearby = nearby.filter(_Filter);
    }
    return nearby;
  }

  Update(timeElapsed: any) {
    this.UpdateActions_(timeElapsed);
  }

  UpdateActions_(timeElapsed: any) {
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

export class WorldClient {
  entity_: any;
  client_: any;
  timeout_: number;
  entityCache_: {};
  constructor(client: any, entity) {
    this.entity_ = entity;

    // Hack
    this.entity_.onEvent_ = (t: any, d: any) => this.OnEntityEvent_(t, d);

    this.client_ = client;
    this.client_.onMessage = (e: any, d: any) => this.OnMessage_(e, d);
    this.client_.Send("world.player", this.entity_.CreatePlayerPacket_());
    this.client_.Send("world.stats", this.entity_.CreateStatsPacket_());

    this.timeout_ = _TIMEOUT;

    this.entityCache_ = {};

    // Hack
    entity.parent_ = this;
  }

  Destroy() {
    this.client_.Disconnect();
    this.client_ = null;

    this.entity_.Destroy();
    this.entity_ = null;
  }

  OnDeath() {}

  OnEntityEvent_(t: string, d: any) {
    if (t == "attack.damage") {
      this.OnDamageEvent_(d);
    }
  }

  OnMessage_(event: string, data: any) {
    this.timeout_ = _TIMEOUT;

    if (event == "world.update") {
      this.entity_.UpdateTransform(data);
      return true;
    }

    if (event == "chat.msg") {
      this.OnChatMessage_(data);
      return true;
    }

    if (event == "action.attack") {
      this.entity_.OnActionAttack();
      return true;
    }

    if (event == "world.inventory") {
      this.OnInventoryChanged_(data);
      return true;
    }

    return false;
  }

  OnDamageEvent_(_: any) {}

  OnInventoryChanged_(inventory: any) {
    this.entity_.UpdateInventory(inventory);

    // Todo: Merge this into entityCache_ path.
    const nearby = this.entity_.FindNear(50, true);

    for (let n of nearby) {
      n.parent_.client_.Send("world.inventory", [this.entity_.ID, inventory]);
    }
  }

  OnChatMessage_(message: any) {
    const chatMessage = {
      name: this.entity_.accountInfo_.name,
      text: message,
    };

    this.BroadcastChat(chatMessage);
  }

  BroadcastChat(chatMessage: { name: any; server?: boolean; text: any }) {
    const nearby = this.entity_.FindNear(50, true);

    for (let i = 0; i < nearby.length; ++i) {
      const n = nearby[i];
      n.parent_.client_.Send("chat.message", chatMessage);
    }
  }

  get IsDead() {
    return this.timeout_ <= 0.0;
  }

  OnUpdate_(timeElapsed: any) {}

  OnUpdateClientState_() {}

  UpdateClientState_() {
    this.OnUpdateClientState_();
  }

  Update(timeElapsed: number) {
    this.timeout_ -= timeElapsed;

    this.entity_.Update(timeElapsed);

    this.OnUpdate_(timeElapsed);
  }
}

export class WorldNetworkClient extends WorldClient {
  constructor(client: any, entity: WorldEntity) {
    super(client, entity);
  }

  OnUpdate_(timeElapsed: any) {
  }

  OnUpdateClientState_() {
    const _Filter = (e: { ID: any }) => {
      return e.ID != this.entity_.ID;
    };

    const nearby = this.entity_.FindNear(500).filter((e: any) => _Filter(e));

    const updates = [{
      id: this.entity_.ID,
      stats: this.entity_.CreateStatsPacket_(),
      events: this.entity_.CreateEventsPacket_(),
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
      };

      if (!(n.ID in this.entityCache_)) {
        cur.desc = n.GetDescription();
      }

      newCache_[n.ID] = cur;
      updates.push(cur);
    }

    this.entityCache_ = newCache_;

    this.client_.Send("world.update", updates);
  }
}

export class AIStateMachine {
  currentState_: null;
  entity_: any;
  terrain_: any;
  constructor(entity: any, terrain: any) {
    this.currentState_ = null;
    this.entity_ = entity;
    this.terrain_ = terrain;
  }

  SetState(state: AIState_JustSitThere | null) {
    const prevState = this.currentState_;

    if (prevState) {
      if (prevState.constructor.name == state.constructor.name) {
        return;
      }
      prevState.Exit();
    }

    this.currentState_ = state;
    this.currentState_.parent_ = this;
    this.currentState_.entity_ = this.entity_;
    this.currentState_.terrain_ = this.terrain_;
    state.Enter(prevState);
  }

  Update(timeElapsed: any) {
    if (this.currentState_) {
      this.currentState_.Update(timeElapsed);
    }
  }
}

export class AIState {
  constructor() {}
  Exit() {}
  Enter() {}
  Update(timeElapsed: any) {}
}

export class AIState_JustSitThere extends AIState {
  timer_: number;
  entity_: any;
  parent_: any;
  constructor() {
    super();

    this.timer_ = 0.0;
  }

  UpdateLogic_() {
    const _IsPlayer = (e: { isAI: any }) => {
      return !e.isAI;
    };
    const nearby = this.entity_.FindNear(50.0).filter((e: { Health: number }) =>
      e.Health > 0
    )
      .filter(_IsPlayer);

    if (nearby.length > 0) {
      this.parent_.SetState(new AIState_FollowToAttack(nearby[0]));
    }
  }

  Update(timeElapsed: number) {
    this.timer_ += timeElapsed;
    this.entity_.SetState("idle");

    if (this.timer_ > 5.0) {
      this.UpdateLogic_();
      this.timer_ = 0.0;
    }
  }
}

export class AIState_FollowToAttack extends AIState {
  target_: any;
  entity_: any;
  terrain_: any;
  parent_: any;
  constructor(target: any) {
    super();
    this.target_ = target;
  }

  UpdateMovement_(timeElapsed: number) {
    this.entity_.state_ = "walk";

    const direction = vec3.create();
    const forward = vec3.fromValues(0, 0, 1);

    vec3.sub(direction, this.target_.position_, this.entity_.position_);
    direction[1] = 0.0;

    vec3.normalize(direction, direction);
    quat.rotationTo(this.entity_.rotation_, forward, direction);

    const movement = vec3.clone(direction);
    vec3.scale(movement, movement, timeElapsed * 10.0);

    vec3.add(this.entity_.position_, this.entity_.position_, movement);

    this.entity_.position_[1] = this.terrain_.Get(...this.entity_.position_)[0];
    this.entity_.UpdateGridClient_();

    const distance = vec3.distance(
      this.entity_.position_,
      this.target_.position_,
    );

    if (distance < 10.0) {
      this.entity_.OnActionAttack();
      this.parent_.SetState(new AIState_WaitAttackDone(this.target_));
    } else if (distance > 100.0) {
      this.parent_.SetState(new AIState_JustSitThere());
    }
  }

  Update(timeElapsed: any) {
    if (!this.target_.Valid || this.target_.Health == 0) {
      this.parent_.SetState(new AIState_JustSitThere(this.target_));
      return;
    }

    this.UpdateMovement_(timeElapsed);
  }
}

export class AIState_WaitAttackDone extends AIState {
  target_: any;
  entity_: any;
  parent_: any;
  constructor(target: any) {
    super();
    this.target_ = target;
  }

  Update(_: any) {
    this.entity_.state_ = "attack";
    if (this.entity_.action_) {
      return;
    }

    this.parent_.SetState(new AIState_FollowToAttack(this.target_));
  }
}

export class FakeClient {
  constructor() {}

  Send(msg: any, data: any) {}

  Disconnect() {}
}

export class WorldAIClient extends WorldClient {
  terrain_: any;
  onDeath_: any;
  fsm_: AIStateMachine;
  deathTimer_: number;
  constructor(entity: WorldEntity, terrain: any, onDeath: () => void) {
    super(new FakeClient(), entity);
    this.terrain_ = terrain;
    this.onDeath_ = onDeath;
    // Haha sorry
    this.entity_.isAI = true;

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

  OnUpdateClientState_() {}

  OnUpdate_(timeElapsed: number) {
    // Never times out
    this.timeout_ = 1000.0;

    if (this.entity_.Health > 0) {
      this.fsm_.Update(timeElapsed);
    } else {
      this.deathTimer_ += timeElapsed;
    }
  }
}

// import { LoginQueue } from "../login-queue.ts";

// export class SocketWrapper {
//   constructor(params) {
//     this.socket_ = params.socket;
//     this.onMessage = null;
//     this.dead_ = false;
//     this.SetupSocket_();
//   }

//   get ID() {
//     return this.socket_.id;
//   }

//   get IsAlive() {
//     return !this.dead_;
//   }

//   SetupSocket_() {
//     this.socket_.on("user-connected", () => {
//       console.log("socket.id: " + socket.id);
//     });
//     this.socket_.on("disconnect", () => {
//       console.log("Client disconnected.");
//       this.dead_ = true;
//     });
//     this.socket_.onAny((e, d) => {
//       try {
//         if (!this.onMessage(e, d)) {
//           console.log("Unknown command (" + e + "), disconnected.");
//           this.Disconnect();
//         }
//       } catch (err) {
//         console.error(err);
//         this.Disconnect();
//       }
//     });
//   }

//   Disconnect() {
//     this.socket_.disconnect(true);
//   }

//   Send(msg, data) {
//     this.socket_.emit(msg, data);
//   }
// }
