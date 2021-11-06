# Quick_3D_MMORPG

This is a refactoring of simon's project original project.

- Organization
  - folder structure
    - data -> when keeping information within the scripts is labourious
    - entities -> Things that could be placed in a world
    - interfaces -> Code that organizes/does-the-bookkeeping-for entities and other systems
    - ui -> svelte components used within the pages, includes world ui
    - worlds -> games that've combined various interfaces, entities, ui etc...
    - routes -> used by svelte-kit for routing
  - remove/renamed folders/files/code
    - Components have been removed. A function and an object/class should be just fine.
    - rotation -> quaternion
    - many getters and setters / boilerplate has been removed
- Terrain
  - The landscape
    - 3D height map (finite)
  - The scenery
    - Generating scenery randomly is easy, making it deterministic is a completely different story. To do so I did the following two things. Firstly, I used the poisson disc sampling algorithm. Not using this algorithm (or something like it) would mean that some objects could end up stacked-up-ontop of each other. And Secondly, I made a pusedo-random number generator by transforming a sample of some simplex noise through a [probit function](https://en.wikipedia.org/wiki/Probit) and normalizing it. Using the noise by itself gives a normally distributed number which could've caused issues for the algorithm. Carely selecting the noise parameters and using the probit function was neccessary to push the distribution towards being uniform. There is still a bias within the sample but the parameters I did use gave a half-decent final distribution.
- physics
  - 3D - [cannon-es](https://github.com/pmndrs/cannon-es)
- UI
  - [x] svelte-kit web ui framework
- <details>
  <summary>Networking has been cut</summary>
  In an attempt to simplify further I've cut out the server folder. This is to focus on other issues first. It also doesn't make as much sense as it previously did considering the introduction of sveltekit within the client folder. Progress will be made within a local environment. Later down the road we'll look into dedicated servers.
</details>

Structure will set you free.

1. Question the requirements
2. Delete the part
3. Simplify
4. Accelerate
5. Automate

# Start developing

The client server runs via sveltekit so a normal node setup is required. `npm i` then `npm run dev`

