<script>
  function InitComponent() {
    this.iconBar_ = {
      stats: document.getElementById("icon-bar-stats"),
      inventory: document.getElementById("icon-bar-inventory"),
      quests: document.getElementById("icon-bar-quests"),
    };
    this.iconBar_.inventory.onclick = (m) => {
      this.OnInventoryClicked_(m);
    };
    this.iconBar_.stats.onclick = (m) => {
      this.OnStatsClicked_(m);
    };
    this.iconBar_.quests.onclick = (m) => {
      this.OnQuestsClicked_(m);
    };
  }
</script>

<div class="icon-bar" id="icon-bar">
  <div
    class="icon-bar-item"
    id="icon-bar-stats"
    style="background-image: url('./resources/icons/ui/skills.png');"
  />
  <div
    class="icon-bar-item"
    id="icon-bar-inventory"
    style="background-image: url('./resources/icons/ui/backpack.png');"
  />
  <div
    class="icon-bar-item"
    id="icon-bar-quests"
    style="background-image: url('./resources/icons/ui/tied-scroll.png');"
  />
</div>

<style>
  .icon-bar {
    position: absolute;
    bottom: 0px;
    width: 100%;
    display: flex;
    justify-content: center;
    margin-bottom: 10px;
  }

  .icon-bar-item {
    background-size: cover;
    width: 75px;
    height: 75px;
    margin: 2px;
  }
</style>