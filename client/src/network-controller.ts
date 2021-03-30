import { EVENT_TYPES, KNOWN_ENTITIES, NAMED_COMPONENTS } from 'shared/src/constants';
import { io } from 'socket.io-client';


import { Component } from './entity';
import { UIController } from './ui-controller';

class NetworkController extends Component {
  playerID_: any;
  socket_: any;
  constructor(params) {
    super();

    this.playerID_ = null;
    this.SetupSocket_();
  }

  GenerateRandomName_() {
    const names1 = [
      'Aspiring', 'Nameless', 'Cautionary', 'Excited',
      'Modest', 'Maniacal', 'Caffeinated', 'Sleepy',
      'Passionate', 'Medical',
    ];
    const names2 = [
      'Painter', 'Cheese Guy', 'Giraffe', 'Snowman',
      'Doberwolf', 'Cocktail', 'Fondler', 'Typist',
      'Noodler', 'Arborist', 'Peeper'
    ];
    const n1 = names1[
      Math.floor(Math.random() * names1.length)];
    const n2 = names2[
      Math.floor(Math.random() * names2.length)];
    return n1 + ' ' + n2;
  }

  SetupSocket_() {
    this.socket_ = io('ws://localhost:3000', {
      reconnection: false,
      transports: ['websocket'],
      timeout: 10000,
    });

    this.socket_.on(EVENT_TYPES.CONNECT, () => {
      console.log(this.socket_.id);
      const randomName = this.GenerateRandomName_();
      // Input validation is for losers
      this.socket_.emit(
        EVENT_TYPES.LOGIN_COMMIT, (document.getElementById('login-input') as HTMLInputElement).value);
    });

    this.socket_.on("disconnect", () => {
      console.log('DISCONNECTED: ' + this.socket_.id); // undefined
    });

    this.socket_.onAny((e, d) => {
      this.OnMessage_(e, d);
    });
  }

  SendChat(txt) {
    this.socket_.emit(EVENT_TYPES.CHAT_MSG, txt);
  }

  SendTransformUpdate(transform) {
    this.socket_.emit(EVENT_TYPES.WORLD_UPDATE, transform);
  }

  SendActionAttack_() {
    this.socket_.emit(EVENT_TYPES.ACTION_ATTACK);
  }

  SendInventoryChange_(packet) {
    this.socket_.emit(EVENT_TYPES.WORLD_INVENTORY, packet);
  }

  GetEntityID_(serverID) {
    if (serverID == this.playerID_) {
      return 'player';
    } else {
      return '__npc__' + serverID;
    }
  }

  OnMessage_(e, d) {
    if (e == EVENT_TYPES.WORLD_PLAYER) {
      const spawner = this.FindEntity(KNOWN_ENTITIES.SPAWNERS).GetComponent(
        NAMED_COMPONENTS.PLAYER_SPAWNER);

      const player = spawner.Spawn(d.desc);
      player.Broadcast({
        topic: EVENT_TYPES.NETWORK_UPDATE,
        transform: d.transform,
      });

      player.Broadcast({
        topic: EVENT_TYPES.NETWORK_INVENTORY,
        inventory: d.desc.character.inventory,
      });

      console.log('entering world: ' + d.id);
      this.playerID_ = d.id;
    } else if (e == EVENT_TYPES.WORLD_UPDATE) {
      const updates = d;

      const spawner = this.FindEntity(KNOWN_ENTITIES.SPAWNERS).GetComponent(
        NAMED_COMPONENTS.NETWORK_ENTITY_SPAWNER);

      const ui = this.FindEntity(KNOWN_ENTITIES.UI).GetComponent(NAMED_COMPONENTS.UI_CONTROLLER);

      for (let u of updates) {
        const id = this.GetEntityID_(u.id);

        let npc = null;
        if ('desc' in u) {
          npc = spawner.Spawn(id, u.desc);

          npc.Broadcast({
            topic: EVENT_TYPES.NETWORK_INVENTORY,
            inventory: u.desc.character.inventory,
          });
        } else {
          npc = this.FindEntity(id);
        }

        // Translate events, hardcoded, bad, sorry
        let events = [];
        if (u.events) {
          for (let e of u.events) {
            events.push({
              type: e.type,
              target: this.FindEntity(this.GetEntityID_(e.target)),
              attacker: this.FindEntity(this.GetEntityID_(e.attacker)),
              amount: e.amount,
            });
          }
        }

        ui.AddEventMessages(events);

        npc.Broadcast({
          topic: EVENT_TYPES.NETWORK_UPDATE,
          transform: u.transform,
          stats: u.stats,
          events: events,
        });
      }
    } else if (e == 'chat.message') {
      this.FindEntity(KNOWN_ENTITIES.UI).GetComponent(NAMED_COMPONENTS.UI_CONTROLLER).AddChatMessage(d);
    } else if (e == EVENT_TYPES.WORLD_INVENTORY) {
      const id = this.GetEntityID_(d[0]);

      const e = this.FindEntity(id);
      if (!e) {
        return;
      }

      e.Broadcast({
        topic: EVENT_TYPES.NETWORK_INVENTORY,
        inventory: d[1],
      });
    }
  }
};

export { NetworkController }