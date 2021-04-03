enum STATE_TYPES {
    ATTACK = 'attack',
    DANCE = 'dance',
    DEATH = 'death',
    IDLE = 'idle',
    RUN = 'run',
    WALK = 'walk',
}

enum ANIM_TYPES {
    ATTACK = 'Attack',
    DANCE = 'Dance',
    DEATH = 'Death',
    IDLE = 'Idle',
    RUN = 'Run',
    WALK = 'Walk',
}

enum EVENT_TYPES {
    ACTION_ATTACK = 'action.attack',
    ATTACK = 'attack',
    ATTACK_DAMAGE = 'attack.damage',
    CHAT_MESSAGE = 'chat.message', // Why are there two of these?
    CHAT_MSG = 'chat.msg',
    HEALTH_ADD_EXPERIENCE = 'health.add-experience',
    HEALTH_DAMAGE = 'health.damage',
    HEALTH_DEATH = 'health.death',
    HEALTH_LEVEL = 'health.level',
    HEALTH_UPDATE = 'health.update',
    INVENTORY_EQUIP = 'inventory.equip',
    INVENTORY_UPDATED = 'inventory.updated',
    LOAD_CHARACTER = 'load.character',
    LOAD_WEAPON = 'load.weapon',
    LOGIN_COMMIT = 'login.commit',
    NETWORK_INVENTORY = 'network.inventory',
    PLAYER_ACTION = 'player.action',
    STATS_NETWORK = 'stats.network',
    WORLD_INVENTORY = 'world.inventory',
    WORLD_PLAYER = 'world.player',
    WORLD_STATS = 'world.stats',
    WORLD_UPDATE = 'world.update',
    CONNECT = 'connect',
    NETWORK_UPDATE = 'network.update',
    EVENTS_NETWORK = 'events.network',
    INPUT_PICKED = 'input.picked',
}

type IEVENT_TYPES = Record<EVENT_TYPES, string>;

enum KNOWN_ENTITIES {
    DATABASE = 'database',
    INVENTORY_CONTROLLER = 'InventoryController',
    INVENTORY_DATABASE_CONTROLLER = 'InventoryDatabaseController',
    LEVEL_UP_SPAWNER = 'level-up-spawner',
    SPAWNERS = 'spawners',
    LOADER = 'loader',
    SCENERY = 'scenery',
    TERRAIN = 'terrain',
    UI = 'ui',
    NETWORK = 'network',
    PLAYER = 'player'
}

enum NAMED_COMPONENTS {
    LEVEL_UP_SPAWNER = 'LevelUpComponentSpawner',
    PLAYER_SPAWNER = 'PlayerSpawner',
    NETWORK_ENTITY_SPAWNER = 'NetworkEntitySpawner',
    UI_CONTROLLER = 'UIController',
    THREEJS_CONTROLLER = 'ThreeJSController',
    NETWORK_CONTROLLER = 'NetworkController',
}

enum INVENTORY_TYPES {
    DEFAULT_PREFIX = 'inventory-',
    EQUIP_PREFIX = 'inventory-equip-'
}

enum CLASS_TYPES_ENUM {
    PALADIN = 'paladin',
    SORCEROR = 'sorceror',
    WARROK = 'warrok',
    ZOMBIE = 'zombie',
}

enum WEAPON_TYPES_ENUM {
    AXE = 'weapon.axe1',
    HAMMER = 'weapon.hammer1',
    SWORD = 'weapon.sword1',
}

const CLASS_TYPES = [CLASS_TYPES_ENUM.SORCEROR, CLASS_TYPES_ENUM.PALADIN];

enum ATTACK_TYPES {
    MELEE = 'melee'
}

const _TIMEOUT:number = 600.0;

enum DOM_IDS {
    HEALTH_BAR = 'health-bar',
    STATS_BENCHPRESS = 'stats-benchpress',
    STATS_CURL = 'stats-curl',
    STATS_EXPERIENCE = 'stats-experience',
    STATS_STRENGTH = 'stats-strength',
    STATS_WISDOMNESS = 'stats-wisdomness',
    LOGIN_INPUT = 'login-input',
    LOGIN_UI = 'login-ui',
    LOGIN_BUTTON = 'login-button',
    THREEJS = 'threejs',
    QUEST_UI = 'quest-ui',
}

export type {
    IEVENT_TYPES
}

export {
    _TIMEOUT,
    ATTACK_TYPES,
    CLASS_TYPES_ENUM,
    CLASS_TYPES,
    DOM_IDS,
    EVENT_TYPES,
    INVENTORY_TYPES,
    KNOWN_ENTITIES,
    NAMED_COMPONENTS,
    STATE_TYPES,
    WEAPON_TYPES_ENUM,
    ANIM_TYPES,
};