<script>
  let chatElement_;// = document.getElementById("chat-input");
  // this.chatElement_.addEventListener(
  //   "keydown",
  //   (e) => this.OnChatKeyDown_(e),
  //   false
  // );
  function OnChatKeyDown_(evt) {
    if (evt.keyCode === 13) {
      evt.preventDefault();
      const msg = this.chatElement_.value;
      if (msg != "") {
        const net =
          this.FindEntity("network").GetComponent("NetworkController");
        net.SendChat(msg);
      }
      this.chatElement_.value = "";
    }
    evt.stopPropagation();
  }
  function AddEventMessages(events) {
    for (let e of events) {
      // TODO-DefinitelyMaybe: Some error came up where we couldn't find .Name on the attacker
      if (!e.attacker) {
        console.error(
          "Some error came up where we couldn't find .Name on the attacker"
        );
        console.error(e);
        debugger;
      }
      if (e.type != "attack") {
        continue;
      }
      if (e.attacker.Name != "player" && e.target.Name != "player") {
        continue;
      }

      const attackerName =
        e.attacker.Name == "player" ? "You" : e.attacker.Account.name;
      const targetName =
        e.target.Name == "player" ? "you" : e.target.Account.name;

      this.AddChatMessage({
        name: "",
        text:
          attackerName + " hit " + targetName + " for " + e.amount + " damage!",
        action: true,
      });
    }
  }

  function AddChatMessage(msg) {
    const e = document.createElement("div");
    e.className = "chat-text";
    if (msg.server) {
      e.className += " chat-text-server";
    } else if (msg.action) {
      e.className += " chat-text-action";
    } else {
      e.innerText = "[" + msg.name + "]: ";
    }
    e.innerText += msg.text;
    const chatElement = document.getElementById("chat-ui-text-area");
    chatElement.insertBefore(e, document.getElementById("chat-input"));
  }
</script>

<div class="chat-ui">
  <div class="chat-ui-text-area" id="chat-ui-text-area">
    <input
      class="chat-text chat-input"
      id="chat-input"
      maxLength="64"
      type="text"
    />
  </div>
</div>

<style>
  .chat-ui {
    position: absolute;
    left: 10px;
    bottom: 10px;
    background: rgba(1, 1, 1, 0);
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
    font-size: 0.75em;
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
</style>
