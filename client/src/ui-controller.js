import {entity} from './entity.js';


export const ui_controller = (() => {

  class UIController extends entity.Component {
    constructor(params) {
      super();
      this._params = params;
      this._quests = {};
      this._loadingMessages = [
        "Waking the dragons...",
        "Sharpening swords...",
        "Brewing potions...",
        "Conjuring magic spells...",
        "Recruiting brave warriors...",
        "Drawing dungeon maps...",
        "Polishing armor...",
        "Training mythical beasts...",
        "Loading epic loot...",
        "Preparing epic quests...",
        "Summoning ancient spirits...",
        "Forging legendary weapons...",
        "Enchanting mystical artifacts...",
        "Awakening sleeping giants...",
        "Almost ready for adventure!"
      ];
      this._loadingMessageIndex = 0;
      this._loadingInterval = null;
      this._loadingStartTime = 0;
    }
  
    InitComponent() {
      this.iconBar_ = {
        stats: document.getElementById('icon-bar-stats'),
        inventory: document.getElementById('icon-bar-inventory'),
        quests: document.getElementById('icon-bar-quests'),
      };

      this._ui = {
        inventory: document.getElementById('inventory'),
        stats: document.getElementById('stats'),
        quests: document.getElementById('quest-journal'),
      };

      const e = document.getElementById('quest-ui');
      e.style.visibility = 'hidden';

      this.iconBar_.inventory.onclick = (m) => { this.OnInventoryClicked_(m); };
      this.iconBar_.stats.onclick = (m) => { this.OnStatsClicked_(m); };
      this.iconBar_.quests.onclick = (m) => { this.OnQuestsClicked_(m); };
      this.HideUI_();

      this.chatElement_ = document.getElementById('chat-input');
      this.chatElement_.addEventListener(
          'keydown', (e) => this.OnChatKeyDown_(e), false);
    }

    FadeoutLogin() {
      const loginElement = document.getElementById('login-ui');
      if (loginElement.classList.contains('fadeOut')) {
        return;
      }
  
      loginElement.classList.toggle('fadeOut');
      document.getElementById('game-ui').style.visibility = 'visible';
    }  
    
    OnChatKeyDown_(evt) {
      if (evt.keyCode === 13) {
        evt.preventDefault();
        const msg = this.chatElement_.value;
        if (msg != '') {
          const net = this.FindEntity('network').GetComponent(
              'NetworkController');
          net.SendChat(msg);
        }
        this.chatElement_.value = '';
      }
      evt.stopPropagation();
    }

    AddQuest(quest) {
      if (quest.id in this._quests) {
        return;
      }

      const e = document.createElement('DIV');
      e.className = 'quest-entry';
      e.id = 'quest-entry-' + quest.id;
      e.innerText = quest.title;
      e.onclick = (evt) => {
        this.OnQuestSelected_(e.id);
      };
      document.getElementById('quest-journal').appendChild(e);

      this._quests[quest.id] = quest;
      this.OnQuestSelected_(quest.id);
    }

    AddEventMessages(events) {
      for (let e of events) {
        if (e.type != 'attack') {
          continue;
        }
        
        // Skip if either attacker or target is undefined (entity may have been removed)
        if (!e.attacker || !e.target) {
          continue;
        }
        
        if (e.attacker && e.attacker.Name != 'player' && e.target.Name != 'player') {
          continue;
        }

        const attackerName = e.attacker.Name == 'player' ? 'You' : e.attacker.Account.name;
        const targetName = e.target.Name == 'player' ? 'you' : e.target.Account.name;

        this.AddChatMessage({
            name: '',
            text: attackerName + ' hit ' + targetName + ' for ' + e.amount + ' damage!',
            action: true,
        });
      }
    }

    AddChatMessage(msg) {
      const e = document.createElement('div');
      e.className = 'chat-text';
      if (msg.server) {
        e.className += ' chat-text-server';
      } else if (msg.action) {
        e.className += ' chat-text-action';
      } else {
        e.innerText = '[' + msg.name + ']: ';
      }
      e.innerText += msg.text;
      const chatElement = document.getElementById('chat-ui-text-area');
      chatElement.insertBefore(e, document.getElementById('chat-input'));
    }

    OnQuestSelected_(id) {
      const quest = this._quests[id];

      const e = document.getElementById('quest-ui');
      e.style.visibility = '';

      const text = document.getElementById('quest-text');
      text.innerText = quest.text;

      const title = document.getElementById('quest-text-title');
      title.innerText = quest.title;
    }

    HideUI_() {
      this._ui.inventory.style.visibility = 'hidden';
      this._ui.stats.style.visibility = 'hidden';
      this._ui.quests.style.visibility = 'hidden';
    }
    
    OnQuestsClicked_(msg) {
      const visibility = this._ui.quests.style.visibility;
      this.HideUI_();
      this._ui.quests.style.visibility = (visibility ? '' : 'hidden');
    }

    OnStatsClicked_(msg) {
      const visibility = this._ui.stats.style.visibility;
      this.HideUI_();
      this._ui.stats.style.visibility = (visibility ? '' : 'hidden');
    }

    OnInventoryClicked_(msg) {
      const visibility = this._ui.inventory.style.visibility;
      this.HideUI_();
      this._ui.inventory.style.visibility = (visibility ? '' : 'hidden');
    }

    ShowLoadingDialog() {
      const MESSAGE_CYCLE_INTERVAL = 2000; // milliseconds between message changes
      const loadingUI = document.getElementById('loading-ui');
      if (loadingUI) {
        loadingUI.style.visibility = 'visible';
        this._loadingStartTime = Date.now();
        this._loadingMessageIndex = 0;
        this._UpdateLoadingMessage();
        
        // Cycle through messages
        this._loadingInterval = setInterval(() => {
          this._UpdateLoadingMessage();
        }, MESSAGE_CYCLE_INTERVAL);
      }
    }

    _UpdateLoadingMessage() {
      const MESSAGE_FADE_DELAY = 150; // milliseconds for fade transition
      const messageElement = document.getElementById('loading-message');
      if (messageElement) {
        // Fade out
        messageElement.style.opacity = '0';
        
        setTimeout(() => {
          // Update message
          messageElement.textContent = this._loadingMessages[this._loadingMessageIndex];
          this._loadingMessageIndex = (this._loadingMessageIndex + 1) % this._loadingMessages.length;
          
          // Fade in
          messageElement.style.opacity = '1';
        }, MESSAGE_FADE_DELAY);
      }
    }

    UpdateLoadingProgress(progress) {
      const loadingBar = document.getElementById('loading-bar');
      if (loadingBar) {
        loadingBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
      }
    }

    HideLoadingDialog() {
      const FADEOUT_DURATION = 1000; // milliseconds for fade out animation
      if (this._loadingInterval) {
        clearInterval(this._loadingInterval);
        this._loadingInterval = null;
      }
      
      const loadingUI = document.getElementById('loading-ui');
      if (loadingUI) {
        // Smooth fade out
        loadingUI.classList.add('fadeOut');
        setTimeout(() => {
          loadingUI.style.visibility = 'hidden';
          loadingUI.classList.remove('fadeOut');
        }, FADEOUT_DURATION);
      }
    }

    Update(timeInSeconds) {
    }
  };

  return {
    UIController: UIController,
  };

})();