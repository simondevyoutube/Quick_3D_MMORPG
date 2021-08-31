import { rock1 } from "./rock.js";
import { rockMoss1 } from "./rockmoss.js";

export const newRockData = (name) => {
  switch (name) {
    case "rock":
      return rock1
    case "rockmoss":
      return rockMoss1
    default:
      throw `Didn't have rock data for: ${name}`
  }
}