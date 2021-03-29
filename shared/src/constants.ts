enum STATE_TYPES {
    DEATH = 'death',
    IDLE = 'idle',
    ATTACK = 'attack',
    WALK = 'walk',
    RUN = 'run',
    DANCE = 'dance',
}

enum EVENT_TYPES {
    ACTION_ATTACK = 'action.attack',
    ATTACK = 'attack',
    ATTACK_DAMAGE = 'attack.damage',
    CHAT_MSG = 'chat.msg',
    CHAT_MESSAGE = 'chat.message', // Why are there two of these?
    LOGIN_COMMIT = 'login.commit',
    WORLD_INVENTORY = 'world.inventory',
    WORLD_UPDATE = 'world.update',
    WORLD_PLAYER = 'world.player',
    WORLD_STATS = 'world.stats'
}

enum ATTACK_TYPES {
    MELEE = 'melee'
}

const _TIMEOUT:number = 600.0;

export {
    STATE_TYPES,
    EVENT_TYPES,
    ATTACK_TYPES,
    _TIMEOUT
}