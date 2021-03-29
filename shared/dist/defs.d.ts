declare const CHARACTER_MODELS: {
    paladin: {
        base: string;
        path: string;
        anchors: {
            rightHand: string;
        };
        nameOffset: number;
        attack: {
            timing: number;
            cooldown: number;
            type: string;
            range: number;
        };
        scale: number;
        inventory: {
            'inventory-1': string;
            'inventory-2': string;
            'inventory-equip-1': string;
        };
        stats: {
            health: number;
            maxHealth: number;
            strength: number;
            wisdomness: number;
            benchpress: number;
            curl: number;
            experience: number;
            level: number;
        };
        name: string;
    };
    sorceror: {
        base: string;
        path: string;
        anchors: {
            rightHand: string;
        };
        nameOffset: number;
        attack: {
            timing: number;
            cooldown: number;
            type: string;
            range: number;
        };
        scale: number;
        inventory: {};
        stats: {
            health: number;
            maxHealth: number;
            strength: number;
            wisdomness: number;
            benchpress: number;
            curl: number;
            experience: number;
            level: number;
        };
        name: string;
    };
    warrok: {
        base: string;
        path: string;
        anchors: {
            rightHand: string;
        };
        nameOffset: number;
        attack: {
            timing: number;
            cooldown: number;
            type: string;
            range: number;
        };
        scale: number;
        inventory: {};
        stats: {
            health: number;
            maxHealth: number;
            strength: number;
            wisdomness: number;
            benchpress: number;
            curl: number;
            experience: number;
            level: number;
        };
        name: string;
    };
    zombie: {
        base: string;
        path: string;
        anchors: {
            rightHand: string;
        };
        nameOffset: number;
        attack: {
            timing: number;
            cooldown: number;
            type: string;
            range: number;
        };
        scale: number;
        inventory: {};
        stats: {
            health: number;
            maxHealth: number;
            strength: number;
            wisdomness: number;
            benchpress: number;
            curl: number;
            experience: number;
            level: number;
        };
        name: string;
    };
};
declare const WEAPONS_DATA: {
    'weapon.axe1': {
        type: string;
        damage: number;
        renderParams: {
            name: string;
            scale: number;
            icon: string;
        };
    };
    'weapon.sword1': {
        type: string;
        damage: number;
        renderParams: {
            name: string;
            scale: number;
            icon: string;
        };
    };
    'weapon.hammer1': {
        type: string;
        damage: number;
        renderParams: {
            name: string;
            scale: number;
            icon: string;
        };
    };
};
export { CHARACTER_MODELS, WEAPONS_DATA };
//# sourceMappingURL=defs.d.ts.map