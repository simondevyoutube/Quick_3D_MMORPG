import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.124/build/three.module.js';

import {entity} from './entity.js';



export const network_player_controller = (() => {

  class NetworkEntityController extends entity.Component {
    constructor() {
      super();
      this.updateTimer_ = 0.0;
      this.loaded_ = false;
      this.previousHealth_ = null;
    }

    InitComponent() {
      this._RegisterHandler(
          'load.character', (m) => { this.OnLoaded_(m); });
      this._RegisterHandler(
          'inventory.equip', (m) => { this.OnEquipChanged_(m); });
      this._RegisterHandler(
          'network.update', (m) => { this.OnUpdate_(m); });
      this._RegisterHandler(
          'action.attack', (m) => { this.OnActionAttack_(m); });
    }

    InitEntity() {
      this.net_ = this.FindEntity('network').GetComponent(
          'NetworkController');
    }

    OnEquipChanged_(msg) {
      const inventory = this.GetComponent('InventoryController').CreatePacket();
      
      this.net_.SendInventoryChange_(inventory);
    }

    OnActionAttack_(msg) {
      this.net_.SendActionAttack_();
    }

    OnUpdate_(msg) {
      // Check if player is respawning (health went from 0 to positive)
      let isRespawning = false;
      if (msg.stats) {
        const currentHealth = msg.stats[1].health;
        if (this.previousHealth_ !== null && this.previousHealth_ === 0 && currentHealth > 0) {
          isRespawning = true;
        }
        this.previousHealth_ = currentHealth;
      }

      // Apply position update from server when respawning
      // This ensures the player respawns at the correct spawn location
      if (isRespawning && msg.transform) {
        this.Parent.SetPosition(new THREE.Vector3(...msg.transform[1]));
        this.Parent.SetQuaternion(new THREE.Quaternion(...msg.transform[2]));
        
        // Also update the player controller's internal position
        const controller = this.GetComponent('BasicCharacterController');
        if (controller && controller.group_) {
          controller.group_.position.copy(this.Parent.Position);
          controller.group_.quaternion.copy(this.Parent.Quaternion);
        }
      }
      
      // Don't apply transform updates for the local player in normal situations
      // Transform updates from the server are echoes of our own position and would cause jitter
      
      if (msg.stats) {
        this.Broadcast({
            topic: 'stats.network',
            value: msg.stats,
        });
      }

      if (msg.events) {
        if (msg.events.length > 0) {
          this.Broadcast({
              topic: 'events.network',
              value: msg.events,
          });
        }
      }
    }

    OnLoaded_(_) {
      this.loaded_ = true;
    }

    CreateTransformPacket() {
      const controller = this.GetComponent('BasicCharacterController');

      // HACK
      return [
          controller.stateMachine_._currentState.Name,
          this.Parent.Position.toArray(),
          this.Parent.Quaternion.toArray(),
      ];
    }

    Update(timeElapsed) {
      this.updateTimer_ -= timeElapsed;
      if (this.updateTimer_ <= 0.0 && this.loaded_) {
        this.updateTimer_ = 0.1;

        this.net_.SendTransformUpdate(this.CreateTransformPacket());
      }
    }
  };

  return {
    NetworkEntityController: NetworkEntityController,
  };
})();