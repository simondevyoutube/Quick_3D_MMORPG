# Quick_3D_MMORPG

A recreation of simon's project where the following happened:

- Code refactoring (make it approach-able/use-able)
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
      - The server tells us the things to create i.e. sending "generate"={id,entityName,transform, ...data}
      - The server can then send more specific updates "update"={id,...data}
  - [x] Terrain generation starts when a psuedo random key is received
  - [x] three.js glsl
    - [x] highlighted in vscode extensions
    - [x] variables changed
  - organize file contents
    - The interfaces folder should only have files responsible for book-keeping.
  - some entities are not entities
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

Structure will set you free.

1. Question the requirements
2. Delete the part
3. Simplify
4. Accelerate cycle time
5. Automate

# Starting the frontend client

`cd ./client` then `npm i` then `npm dev`

# 🙂🙁 Fortunately / Unfortunately

- I don't think top-level await can be used...