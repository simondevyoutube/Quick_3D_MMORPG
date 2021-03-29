# QUICK_3D_MMORPG
## [Original Youtube Video](https://www.youtube.com/watch?v=IptkgFOoci0)

## How to Work on This :ox:
- _Only tested this with node v15.11.0. YMMV_
- Clone the repository
- *From the root folder*
- run `yarn`. The Yarn workspace settings will handle installing the packages for client and server.
- run `yarn server start:dev` 
- Ensure a browser is open to localhost:3000 _(Maybe. See below)_
  -  If 3000 is taken unavailable, on most systems, you can run `PORT={NEW_PORT | 4444 | 1337} yarn client start{:dev}` 
  -  Example `PORT=1337 yarn client start`
- This should set the server to auto restart on changes. 
- The client will need to be manually refreshed, if you want it to display any changes. That's by design. Noone wants to relog every time they make a change.

<details>
<summary>What are Yarn Workspaces?</summary>
<p> 
https://yarnpkg.com/
Put some really good documentation on what they are here. 

</p>
</details>
