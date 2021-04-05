import { CLASS_TYPES_ENUM, WEAPON_TYPES_ENUM } from "./constants.js";

declare module ICharacter {

  export interface Anchors {
    rightHand: string;
  }

  export interface Attack {
    timing: number;
    cooldown: number;
    type: string;
    range: number;
  }

  export interface Inventory {
    ['inventory-1']?: string;
    ['inventory-2']?: string;
    ['inventory-equip-1']?: string;
  }

  export interface Stats {
    health: number;
    maxHealth: number;
    strength: number;
    wisdomness: number;
    benchpress: number;
    curl: number;
    experience: number;
    level: number;
  }

  export interface RootObject {
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
  [CLASS_TYPES_ENUM.PALADIN]: ICharacter.RootObject,
  [CLASS_TYPES_ENUM.SORCEROR]: ICharacter.RootObject,
  [CLASS_TYPES_ENUM.WARROK]: ICharacter.RootObject,
  [CLASS_TYPES_ENUM.ZOMBIE]: ICharacter.RootObject,
}


const CHARACTER_MODELS: ICharacterModels = {
  [CLASS_TYPES_ENUM.PALADIN]: {
    base: 'paladin.glb',
    path: './src/resources/characters/',
    anchors: {
      rightHand: 'RightHandIndex1',
    },
    nameOffset: 11,
    attack: {
      timing: 0.35,
      cooldown: 1.0,
      type: 'melee',
      range: 10,
    },
    scale: 6.0,
    inventory: {
      'inventory-1': WEAPON_TYPES_ENUM.AXE,
      'inventory-2': WEAPON_TYPES_ENUM.HAMMER,
      'inventory-equip-1': WEAPON_TYPES_ENUM.SWORD,
    },
    stats: {
      health: 200,
      maxHealth: 200,
      strength: 50,
      wisdomness: 5,
      benchpress: 20,
      curl: 100,
      experience: 0,
      level: 1,
    },
    name: 'Paladin',
  },
  [CLASS_TYPES_ENUM.SORCEROR]: {
    base: 'sorceror.glb',
    path: './src/resources/characters/',
    anchors: {
      rightHand: 'RightHandIndex1',
    },
    nameOffset: 10,
    attack: {
      timing: 1.0,
      cooldown: 1.5,
      type: 'magic',
      range: 40,
    },
    scale: 4.0,
    inventory: {},
    stats: {
      health: 100,
      maxHealth: 100,
      strength: 10,
      wisdomness: 200,
      benchpress: 3,
      curl: 17,
      experience: 0,
      level: 1,
    },
    name: 'Sorceror',
  },
  [CLASS_TYPES_ENUM.WARROK]: {
    base: 'warrok.glb',
    path: './src/resources/characters/',
    anchors: {
      rightHand: 'RightHandIndex1',
    },
    nameOffset: 16,
    attack: {
      timing: 1.5,
      cooldown: 2.6,
      type: 'melee',
      range: 15,
    },
    scale: 8.0,
    inventory: {},
    stats: {
      health: 1000,
      maxHealth: 1000,
      strength: 200,
      wisdomness: 4,
      benchpress: 3,
      curl: 200,
      experience: 0,
      level: 1,
    },
    name: 'Monster Guy',
  },
  [CLASS_TYPES_ENUM.ZOMBIE]: {
    base: 'zombie-guy.glb',
    path: './src/resources/characters/',
    anchors: {
      rightHand: 'RightHandIndex1',
    },
    nameOffset: 8,
    attack: {
      timing: 1.0,
      cooldown: 3.0,
      type: 'melee',
      range: 10,
    },
    scale: 4.0,
    inventory: {},
    stats: {
      health: 20,
      maxHealth: 50,
      strength: 25,
      wisdomness: 4,
      benchpress: 3,
      curl: 20,
      experience: 0,
      level: 1,
    },
    name: 'Zombie',
  },
};

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

const WEAPONS_DATA: IWeaponsData = {
  [WEAPON_TYPES_ENUM.AXE]:
  {
    type: 'weapon',
    damage: 3,
    renderParams: {
      name: 'Axe',
      scale: 0.125,
      icon: 'war-axe-64.png',
    },
  },
  [WEAPON_TYPES_ENUM.SWORD]:
  {
    type: 'weapon',
    damage: 3,
    renderParams: {
      name: 'Sword',
      scale: 0.125,
      icon: 'pointy-sword-64.png',
    },
  },
  [WEAPON_TYPES_ENUM.HAMMER]:
  {
    type: 'weapon',
    damage: 3,
    renderParams: {
      name: 'Hammer_Small',
      scale: 0.125,
      icon: 'hammer-64.png',
    },
  },
};

export type { ICharacter };
export { CHARACTER_MODELS, WEAPONS_DATA }