import * as THREE from 'three';
import { Component } from './entity';
import { Constants } from 'shared';
const { EVENT_TYPES, KNOWN_ENTITIES, NAMED_COMPONENTS } = Constants;
class NetworkEntityController extends Component {
    constructor(params) {
        super();
        this.updateTimer_ = 0.0;
        this.loaded_ = false;
    }
    InitComponent() {
        this._RegisterHandler(EVENT_TYPES.LOAD_CHARACTER, (m) => { this.OnLoaded_(m); });
        this._RegisterHandler(EVENT_TYPES.INVENTORY_EQUIP, (m) => { this.OnEquipChanged_(m); });
        this._RegisterHandler(EVENT_TYPES.NETWORK_UPDATE, (m) => { this.OnUpdate_(m); });
        this._RegisterHandler(EVENT_TYPES.ACTION_ATTACK, (m) => { this.OnActionAttack_(m); });
    }
    InitEntity() {
        this.net_ = this.FindEntity(KNOWN_ENTITIES.NETWORK).GetComponent(NAMED_COMPONENTS.NETWORK_CONTROLLER);
    }
    OnEquipChanged_(msg) {
        const inventory = this.GetComponent(KNOWN_ENTITIES.INVENTORY_CONTROLLER).CreatePacket();
        this.net_.SendInventoryChange_(inventory);
    }
    OnActionAttack_(msg) {
        this.net_.SendActionAttack_();
    }
    OnUpdate_(msg) {
        if (msg.transform) {
            this.Parent.SetPosition(new THREE.Vector3(...msg.transform[1]));
            this.Parent.SetQuaternion(new THREE.Quaternion(...msg.transform[2]));
        }
        if (msg.stats) {
            this.Broadcast({
                topic: EVENT_TYPES.STATS_NETWORK,
                value: msg.stats,
            });
        }
        if (msg.events) {
            if (msg.events.length > 0) {
                this.Broadcast({
                    topic: EVENT_TYPES.EVENTS_NETWORK,
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
}
;
export { NetworkEntityController };
