# QUICK_3D_MMORPG
## [Original Youtube Video](https://www.youtube.com/watch?v=IptkgFOoci0)

## How to Work on This :ox:
- _Only tested this with node v15.11.0. YMMV_
- Clone the repository
- *From the root folder*
- run `yarn`. The Yarn workspace settings will handle installing the packages for client and server.
- run `yarn shared build`
- run `yarn server start:watch`
- run `yarn client start:dev`
- Ensure a browser is open to localhost:7700 _(Maybe. See below)_
  -  Example `yarn client start:dev`
- This should set the server to auto restart on changes. 
- The client will need to be manually refreshed, if you want it to display any changes. That's by design. Noone wants to relog every time they make a change.

<details>
<summary>What are Yarn Workspaces?</summary>
<p> 
https://yarnpkg.com/
Put some really good documentation on what they are here. 

</p>
</details>
