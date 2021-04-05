import { Constants } from 'quick-3d-mmo-shared';
import { Component } from "./entity";

const { DOM_IDS, EVENT_TYPES, KNOWN_ENTITIES, NAMED_COMPONENTS } = Constants;

class HealthComponent extends Component {
  stats_: {
    level: number,
    updateUI: boolean,
    health: number,
    maxHealth: number,
    strength: number,
    wisdomness: number,
    benchpress: number,
    curl: number,
    experience: number,

  };
  constructor(params) {
    super();
    this.stats_ = params;
  }

  InitComponent() {
    this._RegisterHandler(
      EVENT_TYPES.HEALTH_DAMAGE, (m) => this.OnDamage_(m));
    this._RegisterHandler(
      EVENT_TYPES.STATS_NETWORK, (m) => this.OnNetworkUpdate_(m));
    this._RegisterHandler(
      EVENT_TYPES.HEALTH_ADD_EXPERIENCE, (m) => this.OnAddExperience_(m));

    this.UpdateUI_();
  }

  IsAlive() {
    return this.stats_.health > 0;
  }

  get Health() {
    return this.stats_.health;
  }

  UpdateUI_() {
    if (!this.stats_.updateUI) {
      return;
    }

    const bar = document.getElementById(DOM_IDS.HEALTH_BAR);

    const healthAsPercentage = this.stats_.health / this.stats_.maxHealth;
    bar.style.width = Math.floor(200 * healthAsPercentage) + 'px';

    document.getElementById(DOM_IDS.STATS_STRENGTH).innerText = this.stats_.strength?.toString?.();
    document.getElementById(DOM_IDS.STATS_WISDOMNESS).innerText = this.stats_.wisdomness?.toString?.();
    document.getElementById(DOM_IDS.STATS_BENCHPRESS).innerText = this.stats_.benchpress?.toString?.();
    document.getElementById(DOM_IDS.STATS_CURL).innerText = this.stats_.curl?.toString?.();
    document.getElementById(DOM_IDS.STATS_EXPERIENCE).innerText = this.stats_.experience?.toString?.();
  }

  _ComputeLevelXPRequirement() {
    const level = this.stats_.level;
    // Blah just something easy
    const xpRequired = Math.round(2 ** (level - 1) * 100);
    return xpRequired;
  }

  OnAddExperience_(msg) {
    this.stats_.experience += msg.value;
    const requiredExperience = this._ComputeLevelXPRequirement();
    if (this.stats_.experience < requiredExperience) {
      return;
    }

    this.stats_.level += 1;
    this.stats_.strength += 1;
    this.stats_.wisdomness += 1;
    this.stats_.benchpress += 1;
    this.stats_.curl += 2;

    const spawner = this.FindEntity(
      KNOWN_ENTITIES.LEVEL_UP_SPAWNER).GetComponent(NAMED_COMPONENTS.LEVEL_UP_SPAWNER);
    spawner.Spawn(this.Parent.Position);

    this.Broadcast({
      topic: EVENT_TYPES.HEALTH_LEVEL,
      value: this.stats_.level,
    });

    this.UpdateUI_();
  }

  _OnDeath() {
    this.Broadcast({
      topic: EVENT_TYPES.HEALTH_DEATH,
    });
  }

  OnHealthChanged_() {
    if (this.stats_.health == 0) {
      this._OnDeath();
    }

    this.Broadcast({
      topic: EVENT_TYPES.HEALTH_UPDATE,
      health: this.stats_.health,
      maxHealth: this.stats_.maxHealth,
    });

    this.UpdateUI_();
  }


  OnNetworkUpdate_(msg) {
    const newStats = msg.value[1];
    for (let k in newStats) {
      this.stats_[k] = newStats[k];
    }

    this.OnHealthChanged_();
  }

  OnDamage_(msg: { value: number }) {
    this.stats_.health = Math.max(0.0, this.stats_.health - msg.value);

    this.OnHealthChanged_();
  }
};

export {
  HealthComponent
}