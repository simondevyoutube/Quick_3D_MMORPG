<script>
  import { Component } from "../../../entity.js";

  let show = false;

  function OnInventoryClicked_(msg) {
    const visibility = this._ui.inventory.style.visibility;
    this.HideUI_();
    this._ui.inventory.style.visibility = visibility ? "" : "hidden";
  }

  export class InventoryDatabaseController extends Component {
    constructor() {
      super();

      this.items_ = {};
    }

    AddItem(name, item) {
      this.items_[name] = item;
    }

    Find(name) {
      return this.items_[name];
    }
  }

  export class UIInventoryController extends Component {
    constructor() {
      super();
    }

    InitEntity() {
      this._RegisterHandler("inventory.updated", () =>
        this.OnInventoryUpdated_()
      );

      this.inventory_ = this.GetComponent("InventoryController");

      const _SetupElement = (n) => {
        const element = document.getElementById(n);
        element.ondragstart = (ev) => {
          ev.dataTransfer.setData("text/plain", n);
        };
        element.ondragover = (ev) => {
          ev.preventDefault();
        };
        element.ondrop = (ev) => {
          ev.preventDefault();
          const data = ev.dataTransfer.getData("text/plain");
          const other = document.getElementById(data);

          this.OnItemDropped_(other, element);
        };
      };

      for (let k in this.inventory_.Inventory) {
        _SetupElement(k);
      }
    }

    OnInventoryUpdated_() {
      const items = this.inventory_.Inventory;
      for (let k in items) {
        this.SetItemAtSlot_(k, items[k].value);
      }
    }

    OnItemDropped_(oldElement, newElement) {
      const oldItem = this.inventory_.Inventory[oldElement.id];
      const newItem = this.inventory_.Inventory[newElement.id];

      const oldValue = oldItem.value;
      const newValue = newItem.value;

      this.SetItemAtSlot_(oldElement.id, newValue);
      this.SetItemAtSlot_(newElement.id, oldValue);

      this.inventory_.SetItemAtSlot_(oldElement.id, newValue);
      this.inventory_.SetItemAtSlot_(newElement.id, oldValue);
    }

    GetItemDefinition_(name) {
      const database = this.FindEntity("database").GetComponent(
        "InventoryDatabaseController"
      );
      return database.Find(name);
    }

    SetItemAtSlot_(slot, itemName) {
      const div = document.getElementById(slot);
      const item = this.GetItemDefinition_(itemName);
      if (item) {
        const path = "./resources/icons/weapons/" + item.renderParams.icon;
        div.style.backgroundImage = "url('" + path + "')";
      } else {
        div.style.backgroundImage = "";
      }
    }
  }

  export class InventoryController extends Component {
    constructor() {
      super();

      this.inventory_ = this.CreateEmpty_();
    }

    CreateEmpty_() {
      const inventory = {};
      for (let i = 1; i <= 24; ++i) {
        inventory["inventory-" + i] = {
          type: "inventory",
          value: null,
        };
      }

      for (let i = 1; i <= 8; ++i) {
        inventory["inventory-equip-" + i] = {
          type: "equip",
          value: null,
        };
      }
      return inventory;
    }

    get Inventory() {
      return this.inventory_;
    }

    InitComponent() {
      // Hack
      this._RegisterHandler("network.inventory", (m) =>
        this.OnNetworkUpdate_(m)
      );
    }

    OnNetworkUpdate_(msg) {
      const inventory = this.CreateEmpty_();
      for (let k in msg.inventory) {
        inventory[k].value = msg.inventory[k];
      }

      let changed = false;
      for (let k in inventory) {
        if (inventory[k].value != this.inventory_[k].value) {
          this.SetItemAtSlot_(k, inventory[k].value);
        }
      }

      if (inventory) {
        this.Broadcast({
          topic: "inventory.updated",
        });
      }
    }

    CreatePacket() {
      // Meh
      const packet = {};
      for (let k in this.inventory_) {
        if (this.inventory_[k].value) {
          packet[k] = this.inventory_[k].value;
        }
      }
      return packet;
    }

    GetItemDefinition_(name) {
      const database = this.FindEntity("database").GetComponent(
        "InventoryDatabaseController"
      );
      return database.Find(name);
    }

    SetItemAtSlot_(slot, itemName) {
      const oldValue = this.inventory_[slot].value;

      this.inventory_[slot].value = itemName;

      if (this.inventory_[slot].type == "equip" && oldValue != itemName) {
        this.Broadcast({
          topic: "inventory.equip",
          value: itemName,
        });
      }
    }

    GetItemByName(name) {
      for (let k in this.inventory_) {
        if (this.inventory_[k].value == name) {
          return this.FindEntity(name);
        }
      }
      return null;
    }
  }

  export class InventoryItem extends Component {
    constructor(params) {
      super();
      this._params = params;
    }

    InitComponent() {}

    get Params() {
      return this._params;
    }

    get RenderParams() {
      return this._params.renderParams;
    }
  }
</script>

{#if show}
<div class="inventory" id="inventory">
  <div class="inventory-inner">
    <div class="inventory-title">Inventory</div>
    <div class="inventory-row">
      <div class="inventory-column">
        <div class="inventory-item" id="inventory-equip-1" draggable="true" />
        <div class="inventory-item" id="inventory-equip-2" draggable="true" />
        <div class="inventory-item" id="inventory-equip-3" draggable="true" />
        <div class="inventory-item" id="inventory-equip-4" draggable="true" />
      </div>
      <div class="inventory-character" />
      <div class="inventory-column">
        <div class="inventory-item" id="inventory-equip-5" draggable="true" />
        <div class="inventory-item" id="inventory-equip-6" draggable="true" />
        <div class="inventory-item" id="inventory-equip-7" draggable="true" />
        <div class="inventory-item" id="inventory-equip-8" draggable="true" />
      </div>
    </div>
    <div class="inventory-row">
      <div class="inventory-item" id="inventory-1" draggable="true" />
      <div class="inventory-item" id="inventory-2" draggable="true" />
      <div class="inventory-item" id="inventory-3" draggable="true" />
      <div class="inventory-item" id="inventory-4" draggable="true" />
      <div class="inventory-item" id="inventory-5" draggable="true" />
      <div class="inventory-item" id="inventory-6" draggable="true" />
      <div class="inventory-item" id="inventory-7" draggable="true" />
      <div class="inventory-item" id="inventory-8" draggable="true" />
    </div>
    <div class="inventory-row">
      <div class="inventory-item" id="inventory-9" draggable="true" />
      <div class="inventory-item" id="inventory-10" draggable="true" />
      <div class="inventory-item" id="inventory-11" draggable="true" />
      <div class="inventory-item" id="inventory-12" draggable="true" />
      <div class="inventory-item" id="inventory-13" draggable="true" />
      <div class="inventory-item" id="inventory-14" draggable="true" />
      <div class="inventory-item" id="inventory-15" draggable="true" />
      <div class="inventory-item" id="inventory-16" draggable="true" />
    </div>
    <div class="inventory-row">
      <div class="inventory-item" id="inventory-17" draggable="true" />
      <div class="inventory-item" id="inventory-18" draggable="true" />
      <div class="inventory-item" id="inventory-19" draggable="true" />
      <div class="inventory-item" id="inventory-20" draggable="true" />
      <div class="inventory-item" id="inventory-21" draggable="true" />
      <div class="inventory-item" id="inventory-22" draggable="true" />
      <div class="inventory-item" id="inventory-23" draggable="true" />
      <div class="inventory-item" id="inventory-24" draggable="true" />
    </div>
  </div>
</div>
{/if}

<style>
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
    background: rgba(1, 1, 1, 0.75);
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
    background-image: url("./resources/icons/ui/inventory-character.png");
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
