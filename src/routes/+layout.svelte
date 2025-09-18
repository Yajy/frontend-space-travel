<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import '../app.css';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<meta name="description" content="Space Travel Booking Platform - Book your journey to the stars" />
	<title>Space Travel | Book Your Cosmic Journey</title>
</svelte:head>

<main>
  {@render children?.()}
</main>
