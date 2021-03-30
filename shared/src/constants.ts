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
    PLAYER_ACTION = 'player.action',
    STATS_NETWORK = 'stats.network',
    WORLD_INVENTORY = 'world.inventory',
    WORLD_PLAYER = 'world.player',
    WORLD_STATS = 'world.stats',
    WORLD_UPDATE = 'world.update',
}

enum KNOWN_ENTITIES {
    INVENTORY_CONTROLLER = 'InventoryController',
    DATABASE = 'database',
    INVENTORY_DATABASE_CONTROLLER = 'InventoryDatabaseController',
    LEVEL_UP_SPAWNER = 'level-up-spawner'
}

enum NAMED_COMPONENTS {
    LEVEL_UP_SPAWNER = 'LevelUpComponentSpawner',

}

enum CLASS_TYPES_ENUM {
    SORCEROR = 'sorceror',
    PALADIN = 'paladin',
    WARROK = 'warrok',
    ZOMBIE = 'zombie'
}

enum WEAPON_TYPES_ENUM {
    AXE = 'weapon.axe1',
    SWORD = 'weapon.sword1',
    HAMMER = 'weapon.hammer1'
}

const CLASS_TYPES = [CLASS_TYPES_ENUM.SORCEROR, CLASS_TYPES_ENUM.PALADIN];

enum ATTACK_TYPES {
    MELEE = 'melee'
}

const _TIMEOUT:number = 600.0;

enum DOM_IDS {
    HEALTH_BAR = 'health-bar',
    STATS_STRENGTH = 'stats-strength',
    STATS_BENCHPRESS = 'stats-benchpress',
    STATS_CURL = 'stats-curl',
    STATS_EXPERIENCE = 'stats-experience',
    STATS_WISDOMNESS = 'stats-wisdomness'
}

export {
    _TIMEOUT,
    ATTACK_TYPES,
    CLASS_TYPES,
    CLASS_TYPES_ENUM,
    EVENT_TYPES,
    KNOWN_ENTITIES,
    STATE_TYPES,
    WEAPON_TYPES_ENUM,
    NAMED_COMPONENTS,
    DOM_IDS
}