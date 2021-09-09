# Quick_3D_MMORPG

This is a refactoring of simon's project.
Structure will set you free.

1. Question the requirements
2. Delete the part
3. Simplify
4. Accelerate cycle time
5. Automate

- Organization
  - folder structure
    - data -> when keeping information within the scripts is labourious
    - entities -> Things that could be placed in a world
    - functions -> Code that does something for something else
    - interfaces -> Code that organizes/does-the-bookkeeping-for entities and other systems
    - routes -> used by svelte-kit for routing
    - ui -> svelte components used within the pages, includes world ui
  - remove/renamed folders/files/code
    - Components have been removed. Integrate a class or function instead.
    - rotation -> quaternion
    - many getters and setters / boilerplate has been removed
- Terrain
  - Predefined map (Manual work but very simple)
  - Infinite 2D side scrolling or birds-eye ( Simplist procedural  )
    - https://www.youtube.com/watch?v=jV-DZqdKlnE
  - Infinite 3D height map ( Easy enough procedural )
  - Space ( Hard and requires a good setup)
    - Generating spheres
      - Using triangles -> - Icosahedron
      - Using Points -> Fibonacci sphere
      - Using squares -> Cube sphere
- physics
  - 3D options: [cannon-es](https://github.com/pmndrs/cannon-es), ammo.js...
  - 2D options: [matter.js](https://brm.io/matter-js/demo/#collisionFiltering)...
- UI
  - [x] svelte-kit web ui framework
  - themes
- Networking
  - Logic regarding an entity has moved closer to that entity
  - Move routes from client-side src to server-side?
  - [ ] Webstream websockets
  - Server to deno
   - [x] mockup ws test
- Game Dev
  - typescript (not yet)
  - three.js glsl highlighting by vscode extensions
  - [ ] scene transitions (fade out and in + loading wheel)?
  - [ ] objects inventory / place
  - [ ] save / load (scenes / data)
- Distribution
  - [ ] Electron app
- HOW-TO/readmes
 - Getting a model into the game
   - [Checking your model](https://gltf-viewer.donmccurdy.com/)
 - Animating a model in game
   - [Used THREE.Clock() for dynamic animation frames](https://discoverthreejs.com/book/first-steps/animation-loop/)

# Starting the frontend client

`cd ./client` then `npm i` then `npm dev`

```javascript
// https://www.youtube.com/watch?v=mr5xkf6zSzk
// Cubic (3rd) Bezier through A,B,C,D where A(start) and D (end) are assumed to be 0 and 1
function NormalizedBezier3(B, C, t) {
  const s = 1 - t
  const t2 = t*t
  const s2 = s*s
  const t3 = t2*t
  return (3*B*s2*t) + (3*C*s*t2) + t3
}
```