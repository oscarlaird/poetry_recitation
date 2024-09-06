<script>
	import '../app.css';
	import { onMount } from 'svelte';
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

<div class="app" bind:this={app}>
	Testing Development Branch
	<br>
	Screen Width: {screen_width}
	<main>
		<slot />
	</main>
</div>

<style>
	.app {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	main {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 1rem;
		width: 100%;
		max-width: 64rem;
		margin: 0 auto;
		box-sizing: border-box;
	}

	footer {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 12px;
	}

	footer a {
		font-weight: bold;
	}

	@media (min-width: 480px) {
		footer {
			padding: 12px 0;
		}
	}
</style>
