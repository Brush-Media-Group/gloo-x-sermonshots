<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<script src="https://kit.fontawesome.com/4f11e66f04.js" crossorigin="anonymous"></script>
</svelte:head>

{@render children?.()}
