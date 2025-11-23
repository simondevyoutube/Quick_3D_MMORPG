import {entity} from "./entity.js";


export const health_component = (() => {

  class HealthComponent extends entity.Component {
    constructor(params) {
      super();
      this.stats_ = params;
      this.stamina_ = 100; // Current stamina
      this.maxStamina_ = 100;
      this.staminaDrainRate_ = 100 / 30; // Drain over 30 seconds
      this.staminaRegenRate_ = 100 / 60; // Regenerate over 60 seconds
      this.isRunning_ = false;
    }

    InitComponent() {
      this._RegisterHandler(
          'health.damage', (m) => this.OnDamage_(m));
      this._RegisterHandler(
          'stats.network', (m) => this.OnNetworkUpdate_(m));
      this._RegisterHandler(
          'health.add-experience', (m) => this.OnAddExperience_(m));
      this._RegisterHandler(
          'player.action', (m) => this.OnPlayerAction_(m));

      this.UpdateUI_();
    }

    IsAlive() {
      return this.stats_.health > 0;
    }

    get Health() {
      return this.stats_.health;
    }

    get Stamina() {
      return this.stamina_;
    }

    CanRun() {
      return this.stamina_ > 0;
    }

    OnPlayerAction_(msg) {
      this.isRunning_ = (msg.action === 'run');
    }

    Update(timeInSeconds) {
      // Update stamina based on running state (always update, not just for UI)
      if (this.isRunning_) {
        // Drain stamina when running
        this.stamina_ = Math.max(0, this.stamina_ - this.staminaDrainRate_ * timeInSeconds);
      } else {
        // Regenerate stamina when not running
        this.stamina_ = Math.min(this.maxStamina_, this.stamina_ + this.staminaRegenRate_ * timeInSeconds);
      }

      // Update UI if applicable
      if (this.stats_.updateUI) {
        this.UpdateUI_();
      }
    }

    UpdateUI_() {
      if (!this.stats_.updateUI) {
        return;
      }

      const healthBar = document.getElementById('health-bar');
      const staminaBar = document.getElementById('stamina-bar');

      if (healthBar) {
        const healthAsPercentage = this.stats_.health / this.stats_.maxHealth;
        healthBar.style.width = Math.floor(100 * healthAsPercentage) + '%';
      }

      if (staminaBar) {
        const staminaAsPercentage = this.stamina_ / this.maxStamina_;
        staminaBar.style.width = Math.floor(100 * staminaAsPercentage) + '%';
      }

      document.getElementById('stats-strength').innerText = this.stats_.strength;
      document.getElementById('stats-wisdomness').innerText = this.stats_.wisdomness;
      document.getElementById('stats-benchpress').innerText = this.stats_.benchpress;
      document.getElementById('stats-curl').innerText = this.stats_.curl;
      document.getElementById('stats-experience').innerText = this.stats_.experience;
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
          'level-up-spawner').GetComponent('LevelUpComponentSpawner');
      spawner.Spawn(this.Parent.Position);

      this.Broadcast({
          topic: 'health.levelGained',
          value: this.stats_.level,
      });

      this.UpdateUI_();
    }

    _OnDeath() {
      this.Broadcast({
          topic: 'health.death',
      });
    }

    OnHealthChanged_() {
      if (this.stats_.health == 0) {
        this._OnDeath();
      }

      this.Broadcast({
        topic: 'health.update',
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

    OnDamage_(msg) {
      this.stats_.health = Math.max(0.0, this.stats_.health - msg.value);

      this.OnHealthChanged_();
    }

    Update(timeInSeconds) {
      if (!this.stats_.updateUI) {
        return;
      }

      // Update stamina based on running state
      if (this.isRunning_) {
        // Drain stamina when running
        this.stamina_ = Math.max(0, this.stamina_ - this.staminaDrainRate_ * timeInSeconds);
      } else {
        // Regenerate stamina when not running
        this.stamina_ = Math.min(this.maxStamina_, this.stamina_ + this.staminaRegenRate_ * timeInSeconds);
      }

      this.UpdateUI_();
    }
  };

  return {
    HealthComponent: HealthComponent,
  };

})();