import { Component } from './entity';
declare class InventoryDatabaseController extends Component {
    items_: {};
    constructor();
    AddItem(name: any, item: any): void;
    Find(name: any): any;
}
declare class UIInventoryController extends Component {
    inventory_: any;
    constructor(params: any);
    InitEntity(): void;
    OnInventoryUpdated_(): void;
    OnItemDropped_(oldElement: any, newElement: any): void;
    GetItemDefinition_(name: any): any;
    SetItemAtSlot_(slot: any, itemName: any): void;
}
declare class InventoryController extends Component {
    inventory_: {};
    constructor(params?: any);
    CreateEmpty_(): {};
    get Inventory(): {};
    InitComponent(): void;
    OnNetworkUpdate_(msg: any): void;
    CreatePacket(): {};
    GetItemDefinition_(name: any): any;
    SetItemAtSlot_(slot: any, itemName: any): void;
    GetItemByName(name: any): any;
}
declare class InventoryItem extends Component {
    _params: any;
    constructor(params: any);
    InitComponent(): void;
    get Params(): any;
    get RenderParams(): any;
}
export { InventoryDatabaseController, UIInventoryController, InventoryController, InventoryItem };
