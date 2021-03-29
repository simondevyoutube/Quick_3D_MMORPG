declare enum STATE_TYPES {
    DEATH = "death",
    IDLE = "idle",
    ATTACK = "attack",
    WALK = "walk",
    RUN = "run",
    DANCE = "dance"
}
declare enum EVENT_TYPES {
    ACTION_ATTACK = "action.attack",
    ATTACK = "attack",
    ATTACK_DAMAGE = "attack.damage",
    CHAT_MSG = "chat.msg",
    CHAT_MESSAGE = "chat.message",
    LOGIN_COMMIT = "login.commit",
    WORLD_INVENTORY = "world.inventory",
    WORLD_UPDATE = "world.update",
    WORLD_PLAYER = "world.player",
    WORLD_STATS = "world.stats"
}
declare enum ATTACK_TYPES {
    MELEE = "melee"
}
declare const _TIMEOUT: number;
export { STATE_TYPES, EVENT_TYPES, ATTACK_TYPES, _TIMEOUT };
//# sourceMappingURL=constants.d.ts.map