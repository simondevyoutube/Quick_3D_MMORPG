<script>
  let show = false;
  function OnStatsClicked_(msg) {
    const visibility = this._ui.stats.style.visibility;
    this.HideUI_();
    this._ui.stats.style.visibility = visibility ? "" : "hidden";
  }
  // document.getElementById("stats-strength").innerText = this.stats_.strength;
  // document.getElementById("stats-wisdomness").innerText =
  //   this.stats_.wisdomness;
  // document.getElementById("stats-benchpress").innerText =
  //   this.stats_.benchpress;
  // document.getElementById("stats-curl").innerText = this.stats_.curl;
  // document.getElementById("stats-experience").innerText =
  //   this.stats_.experience;
</script>

{#if show}
<div class="stats" id="stats">
  <div class="stats-inner">
    <div class="stats-title">Statistics</div>
    <div class="stats-row">
      <div class="stats-tooltip">
        Strength
        <div class="stats-tooltiptext">
          How strong you are, affects how much damage you do. So blah blah if
          you're doing stuff then its stronger or whatever, the damage is up.
          This is text to show the tooltip.
        </div>
      </div>
      <div id="stats-strength">0</div>
    </div>
    <div class="stats-row">
      <div class="stats-tooltip">
        Wisdomness
        <div class="stats-tooltiptext">
          Wisdom is the guage of something to do with wisdom in the game because
          wisdom is important and wisdom is wise to wisdoming.
        </div>
      </div>
      <div id="stats-wisdomness">0</div>
    </div>
    <div class="stats-row">
      <div class="stats-tooltip">
        Benchpress
        <div class="stats-tooltiptext">
          Gotta have a good bench to be a warrior or something.
        </div>
      </div>
      <div id="stats-benchpress">0</div>
    </div>
    <div class="stats-row">
      <div class="stats-tooltip">
        Curl
        <div class="stats-tooltiptext">
          The ultimate expression of strength, this affects literally everything
          in your life.
        </div>
      </div>
      <div id="stats-curl">0</div>
    </div>
    <div class="stats-row">
      <div class="stats-tooltip">
        XP
        <div class="stats-tooltiptext">
          How much xp you've accumulated by killing things for xp. Get enough
          and you'll gain a level or something.
        </div>
      </div>
      <div id="stats-experience">0</div>
    </div>
  </div>
</div>
{/if}

<style>
  .stats-tooltip {
    position: relative;
    display: inline-block;
    z-index: 100;
  }

  .stats-tooltip .stats-tooltiptext {
    visibility: hidden;
    width: 200px;
    background-color: black;
    opacity: 0.75;
    text-align: center;
    padding: 1em;
    border-radius: 6px;
    color: white;
    font-size: medium;
    position: absolute;
    z-index: 1;
    top: -5px;
    right: 105%;
  }

  .stats-tooltip:hover .stats-tooltiptext {
    visibility: visible;
  }

  .stats-title {
    font-size: 3em;
    color: white;
    text-shadow: 4px 4px black;
  }

  .stats {
    position: absolute;
    right: 0px;
    top: 0px;
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    margin: 30px;
    z-index: 1;
  }

  .stats-inner {
    display: flex;
    flex-direction: column;
    background: rgba(1, 1, 1, 0.75);
    padding: 20px 20px;
    width: 250px;
    padding-top: 5px;
  }

  .stats-row {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    font-size: 2em;
    color: white;
    text-shadow: 4px 4px black;
  }
</style>
