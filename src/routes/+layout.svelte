<script>
	import '../app.css';
	import { onMount } from 'svelte';
    import VoskListener from './VoskListener.svelte';
	let app;
	let screen_width;
	// refresh screen width on resize
	onMount(() => {
		screen_width = window.innerWidth;
		window.addEventListener('resize', () => {
			screen_width = window.innerWidth;
		});
	});
</script>

<VoskListener />
<!-- Development Branch
<br>
Screen Width: {screen_width} -->
<main>
	<slot />
</main>

<style>
</style>
