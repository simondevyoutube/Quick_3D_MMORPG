<script>
  // const e = document.getElementById("quest-ui");
  //   e.style.visibility = "hidden";
  _quests = {};

  function AddQuest(quest) {
    if (quest.id in this._quests) {
      return;
    }

    const e = document.createElement("DIV");
    e.className = "quest-entry";
    e.id = "quest-entry-" + quest.id;
    e.innerText = quest.title;
    e.onclick = (evt) => {
      this.OnQuestSelected_(e.id);
    };
    document.getElementById("quest-journal").appendChild(e);

    this._quests[quest.id] = quest;
    this.OnQuestSelected_(quest.id);
  }

  function OnQuestSelected_(id) {
    const quest = this._quests[id];

    const e = document.getElementById("quest-ui");
    e.style.visibility = "";

    const text = document.getElementById("quest-text");
    text.innerText = quest.text;

    const title = document.getElementById("quest-text-title");
    title.innerText = quest.title;
  }

  function OnQuestsClicked_(msg) {
    const visibility = this._ui.quests.style.visibility;
    this.HideUI_();
    this._ui.quests.style.visibility = visibility ? "" : "hidden";
  }
  
const _TITLE = "Welcome Adventurer!";
const _TEXT =
  `Welcome to Honeywood adventurer, I see you're the chosen one and also the dragon born and whatever else, you're going to save the world! Also bring the rings back to mordor and defeat the evil dragon, and all the other things. But first, I must test you with some meaningless bullshit tasks that every rpg makes you do to waste time. Go kill like uh 30 ghosts and collect their eyeballs or something. Also go get my drycleaning and pick up my kids from daycare.`;

  function InitComponent() {
    this._RegisterHandler("input.picked", (m) => this._OnPicked(m));
    const e = document.getElementById("quest-ui");
    e.style.visibility = "hidden";
  }

  function _OnPicked(msg) {
    // HARDCODE A QUEST
    const quest = {
      id: "foo",
      title: _TITLE,
      text: _TEXT,
    };
    this._AddQuestToJournal(quest);
  }

  function _AddQuestToJournal(quest) {
    const ui = this.FindEntity("ui").GetComponent("UIController");
    ui.AddQuest(quest);
  }

</script>

<div class="quest-journal" id="quest-journal" />
<div class="quest-ui-layout" id="quest-ui">
  <div class="quest-ui">
    <div class="quest-text-title" id="quest-text-title" />
    <div class="quest-text" id="quest-text" />
  </div>
</div>

<style>
  .quest-ui-layout {
    display: flex;
    height: 100%;
    width: 100%;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .quest-ui {
    background: rgba(1, 1, 1, 0.75);
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
    background: rgba(1, 1, 1, 0.75);
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
</style>
