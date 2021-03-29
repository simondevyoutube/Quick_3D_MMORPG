var STATE_TYPES;
(function (STATE_TYPES) {
    STATE_TYPES["DEATH"] = "death";
    STATE_TYPES["IDLE"] = "idle";
    STATE_TYPES["ATTACK"] = "attack";
    STATE_TYPES["WALK"] = "walk";
    STATE_TYPES["RUN"] = "run";
    STATE_TYPES["DANCE"] = "dance";
})(STATE_TYPES || (STATE_TYPES = {}));
var EVENT_TYPES;
(function (EVENT_TYPES) {
    EVENT_TYPES["ACTION_ATTACK"] = "action.attack";
    EVENT_TYPES["ATTACK"] = "attack";
    EVENT_TYPES["ATTACK_DAMAGE"] = "attack.damage";
    EVENT_TYPES["CHAT_MSG"] = "chat.msg";
    EVENT_TYPES["CHAT_MESSAGE"] = "chat.message";
    EVENT_TYPES["LOGIN_COMMIT"] = "login.commit";
    EVENT_TYPES["WORLD_INVENTORY"] = "world.inventory";
    EVENT_TYPES["WORLD_UPDATE"] = "world.update";
    EVENT_TYPES["WORLD_PLAYER"] = "world.player";
    EVENT_TYPES["WORLD_STATS"] = "world.stats";
})(EVENT_TYPES || (EVENT_TYPES = {}));
var ATTACK_TYPES;
(function (ATTACK_TYPES) {
    ATTACK_TYPES["MELEE"] = "melee";
})(ATTACK_TYPES || (ATTACK_TYPES = {}));
const _TIMEOUT = 600.0;
export { STATE_TYPES, EVENT_TYPES, ATTACK_TYPES, _TIMEOUT };
//# sourceMappingURL=constants.js.map