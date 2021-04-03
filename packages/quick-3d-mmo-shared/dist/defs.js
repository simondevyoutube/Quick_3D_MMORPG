"use strict";
var _a, _b;
exports.__esModule = true;
exports.WEAPONS_DATA = exports.CHARACTER_MODELS = void 0;
var constants_js_1 = require("./constants.js");
var CHARACTER_MODELS = (_a = {},
    _a[constants_js_1.CLASS_TYPES_ENUM.PALADIN] = {
        base: 'paladin.glb',
        path: './src/resources/characters/',
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
            'inventory-1': constants_js_1.WEAPON_TYPES_ENUM.AXE,
            'inventory-2': constants_js_1.WEAPON_TYPES_ENUM.HAMMER,
            'inventory-equip-1': constants_js_1.WEAPON_TYPES_ENUM.SWORD
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
    _a[constants_js_1.CLASS_TYPES_ENUM.SORCEROR] = {
        base: 'sorceror.glb',
        path: './src/resources/characters/',
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
    _a[constants_js_1.CLASS_TYPES_ENUM.WARROK] = {
        base: 'warrok.glb',
        path: './src/resources/characters/',
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
    _a[constants_js_1.CLASS_TYPES_ENUM.ZOMBIE] = {
        base: 'zombie-guy.glb',
        path: './src/resources/characters/',
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
    },
    _a);
exports.CHARACTER_MODELS = CHARACTER_MODELS;
var WEAPONS_DATA = (_b = {},
    _b[constants_js_1.WEAPON_TYPES_ENUM.AXE] = {
        type: 'weapon',
        damage: 3,
        renderParams: {
            name: 'Axe',
            scale: 0.125,
            icon: 'war-axe-64.png'
        }
    },
    _b[constants_js_1.WEAPON_TYPES_ENUM.SWORD] = {
        type: 'weapon',
        damage: 3,
        renderParams: {
            name: 'Sword',
            scale: 0.125,
            icon: 'pointy-sword-64.png'
        }
    },
    _b[constants_js_1.WEAPON_TYPES_ENUM.HAMMER] = {
        type: 'weapon',
        damage: 3,
        renderParams: {
            name: 'Hammer_Small',
            scale: 0.125,
            icon: 'hammer-64.png'
        }
    },
    _b);
exports.WEAPONS_DATA = WEAPONS_DATA;
//# sourceMappingURL=defs.js.map