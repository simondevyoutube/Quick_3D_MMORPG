import { Constants } from 'shared';
import { Component } from './entity';
const { EVENT_TYPES, INVENTORY_TYPES, KNOWN_ENTITIES } = Constants;
class InventoryDatabaseController extends Component {
    constructor() {
        super();
        this.items_ = {};
    }
    AddItem(name, item) {
        this.items_[name] = item;
    }
    Find(name) {
        return this.items_[name];
    }
}
;
class UIInventoryController extends Component {
    constructor(params) {
        super(params);
    }
    InitEntity() {
        this._RegisterHandler(EVENT_TYPES.INVENTORY_UPDATED, () => this.OnInventoryUpdated_());
        this.inventory_ = this.GetComponent(KNOWN_ENTITIES.INVENTORY_CONTROLLER);
        const _SetupElement = (n) => {
            const element = document.getElementById(n);
            element.ondragstart = (ev) => {
                ev.dataTransfer.setData('text/plain', n);
            };
            element.ondragover = (ev) => {
                ev.preventDefault();
            };
            element.ondrop = (ev) => {
                ev.preventDefault();
                const data = ev.dataTransfer.getData('text/plain');
                const other = document.getElementById(data);
                this.OnItemDropped_(other, element);
            };
        };
        for (let k in this.inventory_.Inventory) {
            _SetupElement(k);
        }
    }
    OnInventoryUpdated_() {
        const items = this.inventory_.Inventory;
        for (let k in items) {
            this.SetItemAtSlot_(k, items[k].value);
        }
    }
    OnItemDropped_(oldElement, newElement) {
        const oldItem = this.inventory_.Inventory[oldElement.id];
        const newItem = this.inventory_.Inventory[newElement.id];
        const oldValue = oldItem.value;
        const newValue = newItem.value;
        this.SetItemAtSlot_(oldElement.id, newValue);
        this.SetItemAtSlot_(newElement.id, oldValue);
        this.inventory_.SetItemAtSlot_(oldElement.id, newValue);
        this.inventory_.SetItemAtSlot_(newElement.id, oldValue);
    }
    GetItemDefinition_(name) {
        const database = this.FindEntity(KNOWN_ENTITIES.DATABASE).GetComponent(KNOWN_ENTITIES.INVENTORY_DATABASE_CONTROLLER);
        return database.Find(name);
    }
    SetItemAtSlot_(slot, itemName) {
        var _a;
        const div = document.getElementById(slot);
        const item = this.GetItemDefinition_(itemName);
        if ((_a = item === null || item === void 0 ? void 0 : item.renderParams) === null || _a === void 0 ? void 0 : _a.icon) {
            const path = './resources/icons/weapons/' + item.renderParams.icon;
            div.style.backgroundImage = "url('" + path + "')";
        }
        else {
            div.style.backgroundImage = '';
        }
    }
}
;
class InventoryController extends Component {
    constructor(params) {
        super();
        this.inventory_ = this.CreateEmpty_();
    }
    CreateEmpty_() {
        const inventory = {};
        for (let i = 1; i <= 24; ++i) {
            inventory[INVENTORY_TYPES.DEFAULT_PREFIX + i] = {
                type: 'inventory',
                value: null,
            };
        }
        for (let i = 1; i <= 8; ++i) {
            inventory[INVENTORY_TYPES.EQUIP_PREFIX + i] = {
                type: 'equip',
                value: null,
            };
        }
        return inventory;
    }
    get Inventory() {
        return this.inventory_;
    }
    InitComponent() {
        // Hack
        this._RegisterHandler(EVENT_TYPES.NETWORK_INVENTORY, (m) => this.OnNetworkUpdate_(m));
    }
    OnNetworkUpdate_(msg) {
        const inventory = this.CreateEmpty_();
        for (let k in msg.inventory) {
            inventory[k].value = msg.inventory[k];
        }
        let changed = false;
        for (let k in inventory) {
            if (inventory[k].value != this.inventory_[k].value) {
                this.SetItemAtSlot_(k, inventory[k].value);
            }
        }
        if (inventory) {
            this.Broadcast({
                topic: EVENT_TYPES.INVENTORY_UPDATED
            });
        }
    }
    CreatePacket() {
        // Meh
        const packet = {};
        for (let k in this.inventory_) {
            if (this.inventory_[k].value) {
                packet[k] = this.inventory_[k].value;
            }
        }
        return packet;
    }
    GetItemDefinition_(name) {
        const database = this.FindEntity(KNOWN_ENTITIES.DATABASE).GetComponent(KNOWN_ENTITIES.INVENTORY_DATABASE_CONTROLLER);
        return database.Find(name);
    }
    SetItemAtSlot_(slot, itemName) {
        const oldValue = this.inventory_[slot].value;
        this.inventory_[slot].value = itemName;
        // @TODO: Figure out all the inventory slot types. Is there only equip?
        if (this.inventory_[slot].type == 'equip' && oldValue != itemName) {
            this.Broadcast({
                topic: EVENT_TYPES.INVENTORY_EQUIP,
                value: itemName,
            });
        }
    }
    GetItemByName(name) {
        for (let k in this.inventory_) {
            if (this.inventory_[k].value == name) {
                return this.FindEntity(name);
            }
        }
        return null;
    }
}
;
class InventoryItem extends Component {
    constructor(params) {
        super();
        this._params = params;
    }
    InitComponent() { }
    get Params() {
        return this._params;
    }
    get RenderParams() {
        return this._params.renderParams;
    }
}
;
export { InventoryDatabaseController, UIInventoryController, InventoryController, InventoryItem };
