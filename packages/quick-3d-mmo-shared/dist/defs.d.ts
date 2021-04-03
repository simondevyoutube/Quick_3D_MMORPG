import { CLASS_TYPES_ENUM, WEAPON_TYPES_ENUM } from "./constants.js";
declare module ICharacter {
    interface Anchors {
        rightHand: string;
    }
    interface Attack {
        timing: number;
        cooldown: number;
        type: string;
        range: number;
    }
    interface Inventory {
        ['inventory-1']?: string;
        ['inventory-2']?: string;
        ['inventory-equip-1']?: string;
    }
    interface Stats {
        health: number;
        maxHealth: number;
        strength: number;
        wisdomness: number;
        benchpress: number;
        curl: number;
        experience: number;
        level: number;
    }
    interface RootObject {
        base: string;
        path: string;
        anchors: Anchors;
        nameOffset: number;
        attack: Attack;
        scale: number;
        inventory: Inventory;
        stats: Stats;
        name: string;
    }
}
interface ICharacterModels {
    [CLASS_TYPES_ENUM.PALADIN]: ICharacter.RootObject;
    [CLASS_TYPES_ENUM.SORCEROR]: ICharacter.RootObject;
    [CLASS_TYPES_ENUM.WARROK]: ICharacter.RootObject;
    [CLASS_TYPES_ENUM.ZOMBIE]: ICharacter.RootObject;
}
declare const CHARACTER_MODELS: ICharacterModels;
interface IWeaponsData {
    [WEAPON_TYPES_ENUM.AXE]: IWeaponaxe1;
    [WEAPON_TYPES_ENUM.SWORD]: IWeaponaxe1;
    [WEAPON_TYPES_ENUM.HAMMER]: IWeaponaxe1;
}
interface IWeaponaxe1 {
    type: string;
    damage: number;
    renderParams: RenderParams;
}
interface RenderParams {
    name: string;
    scale: number;
    icon: string;
}
declare const WEAPONS_DATA: IWeaponsData;
export type { ICharacter };
export { CHARACTER_MODELS, WEAPONS_DATA };
//# sourceMappingURL=defs.d.ts.map