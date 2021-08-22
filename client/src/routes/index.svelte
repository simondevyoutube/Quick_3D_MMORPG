<script>
  import "../main.js";
</script>

<svelte:head>
  <title>SimonDev Crappy MMO</title>
</svelte:head>

  <div class="container" id="container">
    <div class="ui" id="login-ui" style="visibility: visible;">
      <div class="login-screen">
        <div class="login-screen-layout">
          <div class="login-screen-layout window">
            <div class="login-text">Account Name</div>
            <input class="login-input" id="login-input" maxlength="64" type="text">
            <button class="login-button" id="login-button">Login</button>
          </div>
        </div>
      </div>
    </div>
    <div class="ui" id="game-ui">
      <div class="icon-bar" id="icon-bar">
        <div class="icon-bar-item" id="icon-bar-stats"
          style="background-image: url('./resources/icons/ui/skills.png');"></div>
        <div class="icon-bar-item" id="icon-bar-inventory"
          style="background-image: url('./resources/icons/ui/backpack.png');"></div>
        <div class="icon-bar-item" id="icon-bar-quests"
          style="background-image: url('./resources/icons/ui/tied-scroll.png');"></div>
      </div>
      <div class="health-ui">
        <div class="health-bar" id="health-bar"></div>
      </div>
      <div class="quest-journal" id="quest-journal"></div>
      <div class="quest-ui-layout" id="quest-ui">
        <div class="quest-ui">
          <div class="quest-text-title" id="quest-text-title"></div>
          <div class="quest-text" id="quest-text"></div>
        </div>
      </div>

      <div class="stats" id="stats">
        <div class="stats-inner">
          <div class="stats-title">Statistics</div>
          <div class="stats-row">
            <div class="stats-tooltip">Strength
              <div class="stats-tooltiptext">How strong you are, affects how much damage you do. So blah blah if you're
                doing stuff then its stronger or whatever, the damage is up. This is text to show the tooltip.</div>
            </div>
            <div id="stats-strength">0</div>
          </div>
          <div class="stats-row">
            <div class="stats-tooltip">Wisdomness
              <div class="stats-tooltiptext">Wisdom is the guage of something to do with wisdom in the game because
                wisdom is important and wisdom is wise to wisdoming.</div>
            </div>
            <div id="stats-wisdomness">0</div>
          </div>
          <div class="stats-row">
            <div class="stats-tooltip">Benchpress
              <div class="stats-tooltiptext">Gotta have a good bench to be a warrior or something.</div>
            </div>
            <div id="stats-benchpress">0</div>
          </div>
          <div class="stats-row">
            <div class="stats-tooltip">Curl
              <div class="stats-tooltiptext">The ultimate expression of strength, this affects literally everything in
                your life.</div>
            </div>
            <div id="stats-curl">0</div>
          </div>
          <div class="stats-row">
            <div class="stats-tooltip">XP
              <div class="stats-tooltiptext">How much xp you've accumulated by killing things for xp. Get enough and
                you'll gain a level or something.</div>
            </div>
            <div id="stats-experience">0</div>
          </div>
        </div>
      </div>

      <div class="inventory" id="inventory">
        <div class="inventory-inner">
          <div class="inventory-title">Inventory</div>
          <div class="inventory-row">
            <div class="inventory-column">
              <div class="inventory-item" id="inventory-equip-1" draggable="true"></div>
              <div class="inventory-item" id="inventory-equip-2" draggable="true"></div>
              <div class="inventory-item" id="inventory-equip-3" draggable="true"></div>
              <div class="inventory-item" id="inventory-equip-4" draggable="true"></div>
            </div>
            <div class="inventory-character"></div>
            <div class="inventory-column">
              <div class="inventory-item" id="inventory-equip-5" draggable="true"></div>
              <div class="inventory-item" id="inventory-equip-6" draggable="true"></div>
              <div class="inventory-item" id="inventory-equip-7" draggable="true"></div>
              <div class="inventory-item" id="inventory-equip-8" draggable="true"></div>
            </div>
          </div>
          <div class="inventory-row">
            <div class="inventory-item" id="inventory-1" draggable="true"></div>
            <div class="inventory-item" id="inventory-2" draggable="true"></div>
            <div class="inventory-item" id="inventory-3" draggable="true"></div>
            <div class="inventory-item" id="inventory-4" draggable="true"></div>
            <div class="inventory-item" id="inventory-5" draggable="true"></div>
            <div class="inventory-item" id="inventory-6" draggable="true"></div>
            <div class="inventory-item" id="inventory-7" draggable="true"></div>
            <div class="inventory-item" id="inventory-8" draggable="true"></div>
          </div>
          <div class="inventory-row">
            <div class="inventory-item" id="inventory-9" draggable="true"></div>
            <div class="inventory-item" id="inventory-10" draggable="true"></div>
            <div class="inventory-item" id="inventory-11" draggable="true"></div>
            <div class="inventory-item" id="inventory-12" draggable="true"></div>
            <div class="inventory-item" id="inventory-13" draggable="true"></div>
            <div class="inventory-item" id="inventory-14" draggable="true"></div>
            <div class="inventory-item" id="inventory-15" draggable="true"></div>
            <div class="inventory-item" id="inventory-16" draggable="true"></div>
          </div>
          <div class="inventory-row">
            <div class="inventory-item" id="inventory-17" draggable="true"></div>
            <div class="inventory-item" id="inventory-18" draggable="true"></div>
            <div class="inventory-item" id="inventory-19" draggable="true"></div>
            <div class="inventory-item" id="inventory-20" draggable="true"></div>
            <div class="inventory-item" id="inventory-21" draggable="true"></div>
            <div class="inventory-item" id="inventory-22" draggable="true"></div>
            <div class="inventory-item" id="inventory-23" draggable="true"></div>
            <div class="inventory-item" id="inventory-24" draggable="true"></div>
          </div>
        </div>
      </div>

      <div class="chat-ui">
        <div class="chat-ui-text-area" id="chat-ui-text-area">
          <input class="chat-text chat-input" id="chat-input" maxLength="64" type="text">
        </div>
      </div>
    </div>
  </div>

  <style>
    :global(body) {
  width: 100%;
  height: 100%;
  position: absolute;
  background: #000000;
  margin: 0;
  padding: 0;
  overscroll-behavior: none;
}

.container {
  width: 100%;
  height: 100%;
  position: relative;
}

.ui {
  width: 100%;
  height: 100%;            
  position: absolute;
  top: 0;
  left: 0;
  font-family: 'IM Fell French Canon', serif;
}

#game-ui {
  visibility: hidden;
}

#login-ui {
  visibility: hidden;
}

.login-screen {
  position: absolute;
  width: 100%;
  height: 100%;            
  top: 0;
  left: 0;
  font-family: 'IM Fell French Canon', serif;
  background-image: url('./resources/background-3.png');
  background-size: cover;
}

.ui.fadeOut {
  opacity: 1.0;
  animation: fadeOut 1s ease-in-out forwards;
}



@keyframes fadeOut {
  from {
    opacity: 1.0;
    visibility: visible;
  }
  to {
    opacity: 0.0;
    visibility: hidden;
  }
}

.login-screen-layout {
  display: flex;
  height: 100%;
  width: 100%;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.login-screen-layout.window {
  height: 400px;
  width: 500px;
  border-radius: 5px;
  border-color: black;
  border-style: solid;
  background: rgba(0, 0, 0, 0.75);
}

.login-button {
  height: 50px;
  width: 200px;
  border-radius: 5px;
  box-sizing: border-box;
  text-align: center;
  background-color: rgba(130, 130, 130, 0.5);
  display: inline-block;
  font-size: 1.5em;
  text-shadow: 2px 2px 5px black;
  color: white;
  margin: 15px;
  transition: all 0.2s;
}

.login-button:hover {
  color: #000000;
  background-color: rgba(255, 255, 255, 0.5);
}

.login-input {
  background: rgba(0, 0, 0, 0);
  width: 300px;
  font-size: 1.5em;
  text-shadow: 2px 2px 5px black;
  color: white;
  margin: 15px;
}

.login-text {
  font-size: 2.0em;
  text-shadow: 2px 2px 5px black;
  color: white;
}


.chat-ui {
  position: absolute;
  left: 10px;
  bottom: 10px; 
  background: rgba(1.0, 1.0, 1.0, 0.0);
  width: 400px;
  height: 200px;
  padding: 10px 10px;
  border-radius: 10px;
}

.chat-ui-text-area {
  display: flex;
  height: 100%;
  width: 100%;
  flex-direction: column;
  justify-content: flex-end;
}

.chat-text {
  font-size: .75em;
  text-shadow: 2px 2px 5px black;
  color: white;
}

.chat-text-server {
  color: rgb(116, 235, 87);
}

.chat-text-action {
  color: rgb(247, 20, 20);
}

.chat-input {
  background: rgba(0, 0, 0, 0);
  width: 280px;
  margin-top: 5px;
}


.quest-ui-layout {
  display: flex;
  height: 100%;
  width: 100%;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.quest-ui {
  background: rgba(1.0, 1.0, 1.0, 0.75);
  padding: 20px 20px;
  width: 700px;
}

.quest-title {
  font-size: 3em;
  color: white;
  text-shadow: 4px 4px black;
}

.quest-text-title {
  font-size: 3em;
  color: white;
  padding-bottom: 10px;
}

.quest-text {
  font-size: 1em;
  color: white;
}

.quest-journal {
  position: absolute;
  right: 0px;
  display: flex;
  flex-direction: column;
  background: rgba(1.0, 1.0, 1.0, 0.75);
  margin: 30px;
  padding: 20px 20px;
  padding-top: 5px;
  width: 300px;
  height: 600px;
  z-index: 1;
}

.quest-entry {
  font-size: 2em;
  color: white;
  border: black;
  border-style: solid;
  border-width: thick;
  padding: 5px;
}

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

.health-ui {
  position: absolute;
  top: 0px;
  left: 0px;
  background-image: url('./resources/icons/ui/health-bar.png');
  width: 500px;
  height: 300px;
  z-index: 1;
}

.health-bar {
  background: greenyellow;
  width: 200px;
  max-width: 200px;
  height: 40px;
  position: relative;
  top: 215px;
  left: 260px;
  border-style: solid;
  border-width: 2px;
  border-color: black;
  border-radius: 5px;
}

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
  background: rgba(1.0, 1.0, 1.0, 0.75);
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

.inventory-title {
  font-size: 3em;
  color: white;
  text-shadow: 4px 4px black;
}

.inventory {
  position: absolute;
  top: 0px;
  right: 0px;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  margin: 30px;
  z-index: 1;
}

.inventory-inner {
  display: flex;
  flex-direction: column;
  background: rgba(1.0, 1.0, 1.0, 0.75);
  padding: 20px 20px;
  padding-top: 5px;
}

.inventory-row {
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
}

.inventory-column {
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
}

.inventory-character {
  background-image: url('./resources/icons/ui/inventory-character.png');
  background-size: cover;
  width: 200px;
  height: 350px;
}

.inventory-item {
  border: black;
  border-style: solid;
  border-radius: 10%;
  background-color: black;
  width: 50px;
  height: 50px;
  margin: 2px;
  background-size: cover;
}

  </style>