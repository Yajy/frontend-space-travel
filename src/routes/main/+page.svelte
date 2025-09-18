<script lang="ts">
	import { onMount } from 'svelte';
	import createGlobe from 'cobe';
	import { spring } from 'svelte/motion';
	import { cn } from '$lib/utils';

	let x = spring(0, {
		stiffness: 0.04,
		damping: 0.4,
		precision: 0.005
	});

	let className = '';
	export { className as class };
	let pointerInteracting: any = null;
	let pointerInteractionMovement = 0;
	let canvas: HTMLCanvasElement;

	let phi = 0;
	let width = 0;
	
	let onResize = () => {
		if (canvas) {
			width = canvas.offsetWidth;
		}
	};

	let onRender = (state: any) => {
		if (!pointerInteracting) {
			phi += 0.005;
		}
		state.phi = phi + $x;
		state.width = width * 2;
		state.height = width * 2;
	};

	onMount(() => {
		window.addEventListener('resize', onResize);
		onResize();

		const globe = createGlobe(canvas, {
			devicePixelRatio: 2,
			width: width,
			height: width,
			phi: 0,
			theta: 0,
			dark: 1,
			diffuse: 0.4,
			mapSamples: 16000,
			mapBrightness: 1.2,
			baseColor: [0.3, 0.3, 0.3],
			markerColor: [251 / 255, 100 / 255, 21 / 255],
			glowColor: [1, 1, 1],
			markers: [
				{ location: [14.5995, 120.9842], size: 0.03 },
				{ location: [19.076, 72.8777], size: 0.03 },
				{ location: [23.8103, 90.4125], size: 0.05 },
				{ location: [30.0444, 31.2357], size: 0.07 },
				{ location: [39.9042, 116.4074], size: 0.08 },
				{ location: [-23.5505, -46.6333], size: 0.05 },
				{ location: [19.4326, -99.1332], size: 0.04 },
				{ location: [40.7128, -74.006], size: 0.1 },
				{ location: [34.6937, 135.5022], size: 0.05 },
				{ location: [41.0082, 28.9784], size: 0.06 },
			],
			onRender: onRender
		});

		return () => {
			window.removeEventListener('resize', onResize);
		};
	});
</script>

<!-- Main container with dark background -->
<div style="
	min-height: 100vh;
	width: 100%;
	background: #000000;
	position: relative;
	overflow: hidden;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 2rem;
">
	<!-- Small Globe Title -->
	<h1 style="
		font-size: 2.5rem;
		font-weight: 300;
		color: #ffffff;
		margin-bottom: 3rem;
		text-align: center;
		letter-spacing: -0.02em;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
	">Globe</h1>

	<!-- Content Container -->
	<div style="
		display: flex;
		align-items: center;
		justify-content: flex-start;
		width: 100%;
		max-width: 1400px;
		position: relative;
		z-index: 2;
		padding-left: 4rem;
	">
		
		<!-- Apple-style Login Card -->
		<div style="
			background: rgba(255, 255, 255, 0.05);
			backdrop-filter: blur(40px);
			-webkit-backdrop-filter: blur(40px);
			border: 1px solid rgba(255, 255, 255, 0.1);
			border-radius: 20px;
			padding: 2.5rem;
			width: 100%;
			max-width: 380px;
			box-shadow: 
				0 8px 32px rgba(0, 0, 0, 0.3),
				inset 0 1px 0 rgba(255, 255, 255, 0.1);
			position: relative;
			z-index: 10;
		">
			<h2 style="
				color: #ffffff;
				font-size: 1.75rem;
				font-weight: 600;
				text-align: center;
				margin-bottom: 2rem;
				font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
			">Sign In</h2>
			
			<form style="display: flex; flex-direction: column; gap: 1.25rem;">
				<!-- Email Field -->
				<div>
					<input
						type="email"
						placeholder="Email"
						style="
							width: 100%;
							padding: 1rem 1.25rem;
							background: rgba(255, 255, 255, 0.08);
							border: 1px solid rgba(255, 255, 255, 0.15);
							border-radius: 12px;
							color: #ffffff;
							font-size: 1rem;
							outline: none;
							transition: all 0.3s ease;
							font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
						"
						on:focus={(e) => {
							e.target.style.borderColor = 'rgba(0, 122, 255, 0.6)';
							e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.12)';
							e.target.style.boxShadow = '0 0 0 4px rgba(0, 122, 255, 0.1)';
						}}
						on:blur={(e) => {
							e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)';
							e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
							e.target.style.boxShadow = 'none';
						}}
					/>
				</div>
				
				<!-- Password Field -->
				<div>
					<input
						type="password"
						placeholder="Password"
						style="
							width: 100%;
							padding: 1rem 1.25rem;
							background: rgba(255, 255, 255, 0.08);
							border: 1px solid rgba(255, 255, 255, 0.15);
							border-radius: 12px;
							color: #ffffff;
							font-size: 1rem;
							outline: none;
							transition: all 0.3s ease;
							font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
						"
						on:focus={(e) => {
							e.target.style.borderColor = 'rgba(0, 122, 255, 0.6)';
							e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.12)';
							e.target.style.boxShadow = '0 0 0 4px rgba(0, 122, 255, 0.1)';
						}}
						on:blur={(e) => {
							e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)';
							e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
							e.target.style.boxShadow = 'none';
						}}
					/>
				</div>
				
				<!-- Sign In Button -->
				<button
					type="submit"
					style="
						width: 100%;
						background: rgba(0, 122, 255, 0.8);
						color: #ffffff;
						font-weight: 600;
						padding: 1rem;
						border: none;
						border-radius: 12px;
						font-size: 1rem;
						cursor: pointer;
						transition: all 0.3s ease;
						margin-top: 0.5rem;
						font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
						backdrop-filter: blur(20px);
					"
					on:mouseenter={(e) => {
						e.target.style.background = 'rgba(0, 122, 255, 1)';
						e.target.style.transform = 'translateY(-1px)';
						e.target.style.boxShadow = '0 8px 25px rgba(0, 122, 255, 0.3)';
					}}
					on:mouseleave={(e) => {
						e.target.style.background = 'rgba(0, 122, 255, 0.8)';
						e.target.style.transform = 'translateY(0)';
						e.target.style.boxShadow = 'none';
					}}
				>
					Sign In
				</button>
			</form>
			
			<!-- Footer Links -->
			<div style="text-align: center; margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid rgba(255, 255, 255, 0.1);">
				<a href="#" style="
					color: rgba(255, 255, 255, 0.7); 
					font-size: 0.875rem; 
					text-decoration: none; 
					transition: color 0.3s ease;
					font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
				"
				   on:mouseenter={(e) => e.target.style.color = '#ffffff'}
				   on:mouseleave={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.7)'}>
					Forgot your password?
				</a>
			</div>
		</div>
		
		<!-- Massive Globe Container -->
		<div style="
			width: 120vh;
			height: 120vh;
			position: absolute;
			right: -40vh;
			top: 50%;
			transform: translateY(-50%);
			z-index: 1;
		">
			<canvas
				bind:this={canvas}
				style="
					width: 100%;
					height: 100%;
					cursor: grab;
					contain: layout paint size;
				"
				on:pointerdown={(e) => {
					pointerInteracting = e.clientX - pointerInteractionMovement;
					canvas.style.cursor = "grabbing";
				}}
				on:pointerup={() => {
					pointerInteracting = null;
					canvas.style.cursor = "grab";
				}}
				on:pointerout={() => {
					pointerInteracting = null;
					canvas.style.cursor = "grab";
				}}
				on:mousemove={(e) => {
					if (pointerInteracting !== null) {
						const delta = e.clientX - pointerInteracting;
						pointerInteractionMovement = delta;
						x.set(delta / 200);
					}
				}}
			/>
		</div>
		
	</div>
</div>

<style>
	@media (max-width: 1024px) {
		div:first-child > div:nth-child(3) {
			right: -60vh !important;
			width: 100vh !important;
			height: 100vh !important;
		}
		
		div:first-child > div:nth-child(2) {
			padding-left: 2rem !important;
		}
	}

	@media (max-width: 768px) {
		div:first-child > div:nth-child(3) {
			display: none !important;
		}
		
		div:first-child > div:nth-child(2) {
			justify-content: center !important;
			padding-left: 0 !important;
		}
	}
</style>