import { Component } from './entity';
declare class EquipWeapon extends Component {
    params_: any;
    target_: any;
    name_: any;
    anchor_: any;
    _bones: any;
    constructor(params: any);
    InitComponent(): void;
    _OnCharacterLoaded(msg: any): void;
    _AttachTarget(): void;
    GetItemDefinition_(name: any): any;
    _OnEquip(msg: any): void;
    _UnloadModels(): void;
    _LoadModels(item: any, cb: any): void;
}
export { EquipWeapon };
