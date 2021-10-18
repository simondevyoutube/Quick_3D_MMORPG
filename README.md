# Quick_3D_MMORPG

This is a refactoring of simon's original project.

- Organization
  - folder structure
    - data -> when keeping information within the scripts is labourious
    - entities -> Things that could be placed in a world
    - interfaces -> Code that organizes/does-the-bookkeeping-for entities and other systems
    - ui -> svelte components used within the pages, includes world ui
    - worlds -> games that've combined various interfaces, entities, ui etc...
    - routes -> used by svelte-kit for routing
  - remove/renamed folders/files/code
    - Components have been removed. Integrate a class or function instead.
    - rotation -> quaternion
    - many getters and setters / boilerplate has been removed
- Terrain
  - The landscape
    - 3D height map (finite)
  - The scenery
    - Generating scenery randomly is easy, making it deterministic is a completely different story. To do so I did the following two things. Firstly, I used the poisson disc sampling algorithm. Not using this algorithm (or something like it) would mean that some objects could end up stacked-up-ontop of each other. And Secondly, I made a pusedo-random number generator by transforming a sample of some simplex noise through a [probit function](https://en.wikipedia.org/wiki/Probit) and normalizing it. Using the noise by itself gives a normally distributed number which could've caused issues for the algorithm. Carely selecting the noise parameters and using the probit function was neccessary to push the distribution towards being uniform. There is still a bias within the sample but the parameters I did use gave a half-decent final distribution.
- physics
  - 3D options: [cannon-es](https://github.com/pmndrs/cannon-es)...
- UI
  - [x] svelte-kit web ui framework
- Networking (WIP)
  - Server is truth
    1. know the present (Sync)
    2. interpolate (smooth movement)
    3. prioritize (reduce bandwidth to acceptable constraints for server and client)
  - Client is a display and input.
  - [x] Server changed to deno
  - [ ] Multi-player...
  - Logic regarding an entity has moved closer to that entity
  - Move routes from client-side src to server-side?
  - Webstream websockets?

Structure will set you free.

1. Question the requirements
2. Delete the part
3. Simplify
4. Accelerate
5. Automate

# Starting the game

The client server is still node.js so `cd ./client` then `npm i` then `npm Client Dev`. The server has changed to Deno which can be started with `deno run -A --unstable ./server/src/interfaces/http.js`. There are also two vscode tasks for running `Client Dev` and `World Server`.

# Caveates

- Multiplayer is not there atm
- There's less in the world

