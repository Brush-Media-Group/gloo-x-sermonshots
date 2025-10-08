<script lang="ts">
	import { onMount } from 'svelte';
	export let video: {
		id: string;
		title: string;
		snippet: string;
		thumbnail?: string;
		videoUrl?: string;
	};

	let showModal = false;

	function handlePlay() {
		showModal = true;
	}

	function closeModal() {
		showModal = false;
	}
</script>

<div
	class="group overflow-hidden rounded-xl border border-white/40 bg-white/80 shadow-sm backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-lg"
>
	<!-- Video Thumbnail -->
	<div
		class="relative flex aspect-video items-center justify-center overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200"
	>
		{#if video.thumbnail}
			<img
				src={video.thumbnail}
				alt={video.title}
				class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
			/>
		{:else}
			<div
				class="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary-400 to-secondary-500"
			>
				<svg class="h-8 w-8 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
					/>
				</svg>
			</div>
		{/if}

		<!-- Play Button Overlay -->
		<button
			on:click={handlePlay}
			class="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
			aria-label="Play video"
		>
			<div
				class="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 shadow-lg backdrop-blur-sm transition-transform duration-200 hover:scale-110"
			>
				<svg class="ml-0.5 h-5 w-5 text-gray-800" fill="currentColor" viewBox="0 0 24 24">
					<path d="M8 5v14l11-7z" />
				</svg>
			</div>
		</button>
	</div>

	<!-- Content -->
	<div class="p-4">
		<h4
			class="mb-2 line-clamp-2 text-sm font-semibold text-gray-900 transition-colors duration-200 group-hover:text-primary-600"
		>
			{video.title}
		</h4>
		<p class="line-clamp-3 text-xs leading-relaxed text-gray-600">
			{video.snippet}
		</p>

		<!-- Action Button -->
		<button
			on:click={handlePlay}
			class="mt-3 flex items-center gap-1 text-xs font-medium text-primary-600 opacity-0 transition-all duration-200 group-hover:opacity-100 hover:text-primary-700"
		>
			<span>Watch now</span>
			<svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
			</svg>
		</button>

		{#if showModal}
			<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
				<div class="relative w-full max-w-lg rounded-xl bg-white p-6 shadow-lg">
					<button
						class="absolute top-2 right-2 text-xl text-gray-500 hover:text-gray-700"
						on:click={closeModal}
						aria-label="Close"
					>
						&times;
					</button>
					<h3 class="mb-4 text-lg font-bold text-gray-900">{video.title}</h3>
					{#if video.videoUrl}
						<div class="mb-4 aspect-video">
							<iframe
								src={video.videoUrl}
								frameborder="0"
								allow="autoplay; encrypted-media"
								allowfullscreen
								class="h-full w-full rounded-lg"
								title={video.title}
							></iframe>
						</div>
					{:else}
						<div class="mb-4 flex h-48 items-center justify-center rounded-lg bg-gray-100">
							<span class="text-gray-400">No video available</span>
						</div>
					{/if}
					<p class="text-sm text-gray-700">{video.snippet}</p>
				</div>
			</div>
		{/if}
	</div>
</div>
