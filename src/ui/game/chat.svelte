<script>
	import { createEventDispatcher } from 'svelte';
	import Message from './message.svelte';

	export let author = 'Player';

	const dispatch = createEventDispatcher();
	let text;
	let list;
	// TODO-DefinitelyMaybe: remembering scroll height can be a nice feature
	// let scroll = 0;
	let messages = [];

	export function receive(data) {
		// TODO-DefinitelyMaybe: change to const
		let { text, author } = data;
		// TODO-DefinitelyMaybe: remove later
		if (data.server) {
			author = 'Server';
		}
		messages = messages.concat({ text, author });
		setTimeout(() => {
			list.scrollTop = list.scrollHeight;
		}, 1);
	}
</script>

<div id="chat">
	<ol bind:this={list}>
		{#each messages as message}
			<svelte:component this={Message} {...message} />
		{/each}
	</ol>
	<div>
		<input type="text" bind:value={text} />
		<button
			type="submit"
			on:click={() => {
				messages = messages.concat({ text, author });
				dispatch('send', { text, author });
				text = '';
				setTimeout(() => {
					list.scrollTop = list.scrollHeight;
				}, 1);
			}}>Send</button
		>
	</div>
</div>

<style>
	#chat {
		position: absolute;
		display: flex;
		flex-direction: column;
		bottom: 0px;
		height: 20%;
		width: 40%;
	}
	ol {
		overflow: hidden;
		overflow-y: scroll;
		padding-inline-start: 0em;
		list-style-type: none;
		margin-block-start: 0em;
		margin-block-end: 0em;
		height: 100%;
	}
	input {
		width: 70%;
	}
</style>
