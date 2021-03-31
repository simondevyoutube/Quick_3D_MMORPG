import { GUI } from 'shared';
import { Entity } from './entity';
import { UIController } from './ui-controller';
import { LevelUpComponentSpawner } from './level-up-component';
import { NetworkController } from './network-controller';
import { SceneryController } from './scenery-controller';
import { LoadController } from './load-controller';
import { PlayerSpawner, NetworkEntitySpawner } from './spawners';
import { TerrainChunkManager } from './terrain';
import { InventoryDatabaseController } from './inventory-controller';
import { Constants, Defs, EntityManager as aEntityManager, SpatialHashGrid as aSpatialHashGrid } from 'shared';
import { ThreeJSController } from './threejs_component';
const { WEAPONS_DATA, DOM_IDS, KNOWN_ENTITIES, NAMED_COMPONENTS, EntityManager, SpatialHashGrid } = Object.assign(Object.assign(Object.assign(Object.assign({}, Constants), Defs), aEntityManager), aSpatialHashGrid);
class CrappyMMOAttempt {
    constructor() {
        this._Initialize();
    }
    _Initialize() {
        this.entityManager_ = new EntityManager();
        document.getElementById(DOM_IDS.LOGIN_UI).style.visibility = 'visible';
        document.getElementById(DOM_IDS.LOGIN_BUTTON).onclick = () => {
            this.OnGameStarted_();
        };
    }
    OnGameStarted_() {
        this.CreateGUI_();
        this.grid_ = new SpatialHashGrid([[-1000, -1000], [1000, 1000]], [100, 100]);
        this.LoadControllers_();
        this.LoadPlayer_();
        this.previousRAF_ = null;
        this.RAF_();
    }
    CreateGUI_() {
        this._guiParams = {
            general: {},
        };
        this._gui = new GUI.GUI(null);
        const generalRollup = this._gui.addFolder('General');
        this._gui.close();
    }
    LoadControllers_() {
        const threejs = new Entity();
        threejs.AddComponent(new ThreeJSController());
        this.entityManager_.Add(threejs, null);
        // Hack
        this.scene_ = threejs.GetComponent(NAMED_COMPONENTS.THREEJS_CONTROLLER).scene_;
        this.camera_ = threejs.GetComponent(NAMED_COMPONENTS.THREEJS_CONTROLLER).camera_;
        this.threejs_ = threejs.GetComponent(NAMED_COMPONENTS.THREEJS_CONTROLLER).threejs_;
        const ui = new Entity();
        ui.AddComponent(new UIController(null));
        this.entityManager_.Add(ui, KNOWN_ENTITIES.UI);
        const network = new Entity();
        network.AddComponent(new NetworkController(null));
        this.entityManager_.Add(network, KNOWN_ENTITIES.NETWORK);
        const t = new Entity();
        t.AddComponent(new TerrainChunkManager({
            scene: this.scene_,
            target: 'player',
            gui: this._gui,
            guiParams: this._guiParams,
            threejs: this.threejs_,
        }));
        this.entityManager_.Add(t, KNOWN_ENTITIES.TERRAIN);
        const l = new Entity();
        l.AddComponent(new LoadController());
        this.entityManager_.Add(l, KNOWN_ENTITIES.LOADER);
        const scenery = new Entity();
        scenery.AddComponent(new SceneryController({
            scene: this.scene_,
            grid: this.grid_,
        }));
        this.entityManager_.Add(scenery, KNOWN_ENTITIES.SCENERY);
        const spawner = new Entity();
        spawner.AddComponent(new PlayerSpawner({
            grid: this.grid_,
            scene: this.scene_,
            camera: this.camera_,
        }));
        spawner.AddComponent(new NetworkEntitySpawner({
            grid: this.grid_,
            scene: this.scene_,
            camera: this.camera_,
        }));
        this.entityManager_.Add(spawner, KNOWN_ENTITIES.SPAWNERS);
        const database = new Entity();
        database.AddComponent(new InventoryDatabaseController());
        this.entityManager_.Add(database, KNOWN_ENTITIES.DATABASE);
        // HACK
        for (let k in WEAPONS_DATA) {
            database.GetComponent(KNOWN_ENTITIES.INVENTORY_DATABASE_CONTROLLER).AddItem(k, WEAPONS_DATA[k]);
        }
    }
    LoadPlayer_() {
        const params = {
            camera: this.camera_,
            scene: this.scene_,
        };
        const levelUpSpawner = new Entity();
        levelUpSpawner.AddComponent(new LevelUpComponentSpawner({
            camera: this.camera_,
            scene: this.scene_,
        }));
        this.entityManager_.Add(levelUpSpawner, KNOWN_ENTITIES.LEVEL_UP_SPAWNER);
    }
    _OnWindowResize() {
        this.camera_.aspect = window.innerWidth / window.innerHeight;
        this.camera_.updateProjectionMatrix();
        this.threejs_.setSize(window.innerWidth, window.innerHeight);
    }
    RAF_() {
        requestAnimationFrame((t) => {
            if (this.previousRAF_ === null) {
                this.previousRAF_ = t;
            }
            this.threejs_.render(this.scene_, this.camera_);
            this.Step_(t - this.previousRAF_);
            this.previousRAF_ = t;
            setTimeout(() => {
                this.RAF_();
            }, 1);
        });
    }
    Step_(timeElapsed) {
        const timeElapsedS = Math.min(1.0 / 30.0, timeElapsed * 0.001);
        this.entityManager_.Update(timeElapsedS);
    }
}
let _APP = null;
window.addEventListener('DOMContentLoaded', () => {
    _APP = new CrappyMMOAttempt();
});
