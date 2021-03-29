enum STATE_TYPES {
    DEATH = 'death',
    IDLE = 'idle',
    ATTACK = 'attack',
    WALK = 'walk',
    RUN = 'run',
    DANCE = 'dance',
}

enum EVENT_TYPES {
    ATTACK_DAMAGE = 'attack.damage',
    ATTACK = 'attack'
}

enum ATTACK_TYPES {
    MELEE = 'melee'
}

export {
    STATE_TYPES,
    EVENT_TYPES,
    ATTACK_TYPES
}