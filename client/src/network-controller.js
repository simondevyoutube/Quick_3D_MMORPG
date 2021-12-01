import 'https://cdn.jsdelivr.net/npm/socket.io-client@3.1.0/dist/socket.io.js';
import {Component} from './entity.js';

export class NetworkController extends Component {
  constructor(params) {
    super();

    this.playerID_ = null;
    this.SetupSocket();
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

  SetupSocket() {
    this.socket = io('ws://localhost:3030', {
        reconnection: false,
        transports: ['websocket'],
        timeout: 10000,
    });

    this.socket.on("connect", () => {
      console.log(this.socket.id);
      const randomName = this.GenerateRandomName_();
      // Input validation is for losers
      this.socket.emit(
          'login.commit', document.getElementById('login-input').value);
    });

    this.socket.on("disconnect", () => {
      console.log('DISCONNECTED: ' + this.socket.id); // undefined
    });

    this.socket.onAny((e, d) => {
      this.OnMessage_(e, d);
    });
  }

  SendChat(txt) {
    this.socket.emit('chat.msg', txt);
  }

  SendTransformUpdate(transform) {
    this.socket.emit('world.update', transform);
  }

  SendActionAttack_() {
    this.socket.emit('action.attack');
  }

  SendInventoryChange_(packet) {
    this.socket.emit('world.inventory', packet);
  }

  GetEntityID_(serverID) {
    if (serverID == this.playerID_) {
      return 'player';
    } else {
      return '__npc__' + serverID;
    }
  }
  
  OnMessage_(e, d) {
    if (e == 'world.player') {
      const spawner = this.FindEntity('spawners').GetComponent(
          'PlayerSpawner');

      const player = spawner.Spawn(d.desc);
      player.Broadcast({
          topic: 'network.update',
          transform: d.transform,
      });

      player.Broadcast({
          topic: 'network.inventory',
          inventory: d.desc.character.inventory,
      });

      console.log('entering world: ' + d.id);
      this.playerID_ = d.id;
    } else if (e == 'world.update') {
      const updates = d;

      const spawner = this.FindEntity('spawners').GetComponent(
          'NetworkEntitySpawner');

      const ui = this.FindEntity('ui').GetComponent('UIController');

      for (let u of updates) {
        const id = this.GetEntityID_(u.id);

        let npc = null;
        if ('desc' in u) {
          npc = spawner.Spawn(id, u.desc);

          npc.Broadcast({
              topic: 'network.inventory',
              inventory: u.desc.character.inventory,
          });
        } else {
          npc = this.FindEntity(id);
        }

        if (!npc) {
          throw new Error('npc is required here')
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
            topic: 'network.update',
            transform: u.transform,
            stats: u.stats,
            events: events,
        });
      }
    } else if (e == 'chat.message') {
      this.FindEntity('ui').GetComponent('UIController').AddChatMessage(d);
    } else if (e == 'world.inventory') {
      const id = this.GetEntityID_(d[0]);

      const e = this.FindEntity(id);
      if (!e) {
        return;
      }

      e.Broadcast({
          topic: 'network.inventory',
          inventory: d[1],
      });
    }
  }
};
