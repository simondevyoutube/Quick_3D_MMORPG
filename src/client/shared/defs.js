export const defs = (() => {
  const _CHARACTER_MODELS = {
    paladin: {
      base: 'paladin.glb',
      path: './resources/characters/',
      anchors: {
        rightHand: 'RightHandIndex1'
      },
      nameOffset: 11,
      attack: {
        timing: 0.35,
        cooldown: 1.0,
        type: 'melee',
        range: 10
      },
      scale: 6.0,
      inventory: {
        'inventory-1': 'weapon.axe1',
        'inventory-2': 'weapon.hammer1',
        'inventory-equip-1': 'weapon.sword1'
      },
      stats: {
        health: 200,
        maxHealth: 200,
        strength: 50,
        wisdomness: 5,
        benchpress: 20,
        curl: 100,
        experience: 0,
        level: 1
      },
      name: 'Paladin'
    },
    sorceror: {
      base: 'sorceror.glb',
      path: './resources/characters/',
      anchors: {
        rightHand: 'RightHandIndex1'
      },
      nameOffset: 10,
      attack: {
        timing: 1.0,
        cooldown: 1.5,
        type: 'magic',
        range: 40
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
        level: 1
      },
      name: 'Sorceror'
    },
    warrok: {
      base: 'warrok.glb',
      path: './resources/characters/',
      anchors: {
        rightHand: 'RightHandIndex1'
      },
      nameOffset: 16,
      attack: {
        timing: 1.5,
        cooldown: 2.6,
        type: 'melee',
        range: 15
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
        level: 1
      },
      name: 'Monster Guy'
    },
    zombie: {
      base: 'zombie-guy.glb',
      path: './resources/characters/',
      anchors: {
        rightHand: 'RightHandIndex1'
      },
      nameOffset: 8,
      attack: {
        timing: 1.0,
        cooldown: 3.0,
        type: 'melee',
        range: 10
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
        level: 1
      },
      name: 'Zombie'
    }
  }

  const _WEAPONS_DATA = {
    'weapon.axe1': {
      type: 'weapon',
      damage: 3,
      renderParams: {
        name: 'Axe',
        scale: 0.125,
        icon: 'war-axe-64.png'
      }
    },
    'weapon.sword1': {
      type: 'weapon',
      damage: 3,
      renderParams: {
        name: 'Sword',
        scale: 0.125,
        icon: 'pointy-sword-64.png'
      }
    },
    'weapon.hammer1': {
      type: 'weapon',
      damage: 3,
      renderParams: {
        name: 'Hammer_Small',
        scale: 0.125,
        icon: 'hammer-64.png'
      }
    }
  }

  return {
    CHARACTER_MODELS: _CHARACTER_MODELS,
    WEAPONS_DATA: _WEAPONS_DATA
  }
})()
