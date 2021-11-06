import { newCharacterData } from "./characters/mod.js";
import { newPlantData } from "./plants/mod.js";
import { newRockData } from "./rocks/mod.js";
import { newTreeData } from "./trees/mod.js";
import { newWeaponData } from "./weapons/mod.js";
import { cloud } from "./cloud.js";

export const newModelData = Object.assign({}, {cloud}, newCharacterData, newPlantData, newRockData, newTreeData, newWeaponData)