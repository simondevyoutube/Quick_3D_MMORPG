import { sveltekit } from '@sveltejs/kit/vite';

// Refer to docs https://vitejs.dev/config/server-options.html#server-fs-allow for configurations and more details.
// files in the public directory are served at the root path.
// Instead of /static/characters/paladin.glb, use /characters/paladin.glb.
// The request url "C:\Users\rekke\Documents\Not_So_Quick_3D_MMORPG_The_Remix\static\characters\paladin.glb" is outside of Vite serving allow list.

/** @type {import('vite').UserConfig} */
const config = {
	plugins: [sveltekit()]
};

export default config;
