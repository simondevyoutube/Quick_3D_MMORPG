<script>
  const stats_ = {};

  function InitComponent() {
    this._RegisterHandler("health.damage", (m) => this.OnDamage_(m));
    this._RegisterHandler("stats.network", (m) => this.OnNetworkUpdate_(m));
    this._RegisterHandler("health.add-experience", (m) =>
      this.OnAddExperience_(m)
    );

    this.UpdateUI_();
  }

  function IsAlive() {
    return this.stats_.health > 0;
  }

  function Health() {
    return this.stats_.health;
  }

  function UpdateUI_() {
    if (!this.stats_.updateUI) {
      return;
    }

    const bar = document.getElementById("health-bar");

    const healthAsPercentage = this.stats_.health / this.stats_.maxHealth;
    bar.style.width = Math.floor(200 * healthAsPercentage) + "px";

    document.getElementById("stats-strength").innerText = this.stats_.strength;
    document.getElementById("stats-wisdomness").innerText =
      this.stats_.wisdomness;
    document.getElementById("stats-benchpress").innerText =
      this.stats_.benchpress;
    document.getElementById("stats-curl").innerText = this.stats_.curl;
    document.getElementById("stats-experience").innerText =
      this.stats_.experience;
  }

  function _ComputeLevelXPRequirement() {
    const level = this.stats_.level;
    // Blah just something easy
    const xpRequired = Math.round(2 ** (level - 1) * 100);
    return xpRequired;
  }

  function OnAddExperience_(msg) {
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

    const spawner = this.FindEntity("level-up-spawner").GetComponent(
      "LevelUpComponentSpawner"
    );
    spawner.Spawn(this.Parent.Position);

    this.Broadcast({
      topic: "health.levelGained",
      value: this.stats_.level,
    });

    this.UpdateUI_();
  }

  function _OnDeath() {
    this.Broadcast({
      topic: "health.death",
    });
  }

  function OnHealthChanged_() {
    if (this.stats_.health == 0) {
      this._OnDeath();
    }

    this.Broadcast({
      topic: "health.update",
      health: this.stats_.health,
      maxHealth: this.stats_.maxHealth,
    });

    this.UpdateUI_();
  }

  function OnNetworkUpdate_(msg) {
    const newStats = msg.value[1];
    for (let k in newStats) {
      this.stats_[k] = newStats[k];
    }

    this.OnHealthChanged_();
  }

  function OnDamage_(msg) {
    this.stats_.health = Math.max(0.0, this.stats_.health - msg.value);

    this.OnHealthChanged_();
  }
</script>

<div class="health-bar" id="health-bar" />

<style>

  .health-bar {
    background: rgb(29, 168, 2);
    width: 200px;
    max-width: 200px;
    height: 20px;
    position: relative;
    top: 100px;
    left: 100px;
    border-style: solid;
    border-width: 2px;
    border-color: black;
    border-radius: 5px;
  }
</style>
