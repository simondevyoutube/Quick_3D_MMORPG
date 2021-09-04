# Quick_3D_MMORPG

This is a refactoring of simon's project.
Structure will set you free.

1. Question the requirements
2. Delete the part
3. Simplify
4. Accelerate cycle time
5. Automate

- [x] ESmodules only
- [x] svelte-kit web ui framework
- [x] organize folder structure
- [x] rename files
- [x] remove code
 - [x] Components have been removed. Integrate a class or function instead.
 - [x] move terrain files to functions folder
 - [x] null -> undefined
 - [x] rotation -> quaternion
 - [x] many getters and setters / boilerplate has been removed
 - [x] networking
   - Logic about a entity has moved closer to that entity
 - [x] Removed Scenery
   1. The terrain/scenery is semi-deterministic and the server sends us the key. Use of noise functions or...
   2. There is no terrain, instead, a predefined map.
- [x] three.js glsl
 - [x] highlighted in vscode extensions
 - [x] variables changed
- [x] organize file contents
 - The interfaces folder should only have files responsible for book-keeping.
- physics
  - 3D options: [cannon-es](https://github.com/pmndrs/cannon-es), ammo.js...
  - 2D options: [matter.js](https://brm.io/matter-js/demo/#collisionFiltering)...
- how to readmes
 - Getting a model into the game
 - Animating a model in game
- Webstream websockets
- ui themes
- Server to deno
 - [x] mockup ws test
- game dev
 - scene transitions (fade out and in + loading wheel)?
 - objects inventory / place
 - save / load (scenes / data)
- typescript (maybe)
- Electron app (maybe)
  - distribution yo

# Starting the frontend client

`cd ./client` then `npm i` then `npm dev`
