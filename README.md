# Quick_3D_MMORPG

A recreation of simon's project where the following happened:

- Code refactoring (make it approach-able/use-able)
  - [x] ESmodules
  - [x] svelte-kit web ui framework
  - [x] organize folder structure
  - [x] rename files
  - [x] remove code
    - [x] remain functionaly equivelent
      - [x] components have been removed. Integrate a class or function instead.
    - [x] move in-line data about terrain workers url to top of file
    - [x] null -> undefined
    - [x] rotation -> quaternion
    - [x] most Getters and setters / boilerplate
    - [x] networking extras
      - Put some network logic outside of network script
  - [x] three.js glsl
    - [x] highlighted in vscode extensions
    - [x] variables changed
  - organize file contents
    - The interfaces folder should only have files responsible for book-keeping.
  - some entities are not entities
  - how to readmes
    - Getting a model into the game
    - Animating a model in game
  - promises
  - Webstream websockets
  - ui themes
  - Server to deno
    - [x] mockup ws test
  - game dev features
    - dev entity
      - change character
    - scene transitions (fade out and in + loading wheel)?
    - objects inventory / place
- typescript (maybe)
- Electron app (maybe)

Structure will set you free

# Starting the frontend client

`cd ./client` then `npm i` then `npm dev`
