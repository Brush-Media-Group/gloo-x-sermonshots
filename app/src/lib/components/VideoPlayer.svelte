<script lang="ts">
	import { createEventDispatcher, onMount, onDestroy } from 'svelte';
	import { pauseAllVideosExcept, registerVideo, unregisterVideo } from '$lib/stores/videoStore';

	export let videoUrl: string;
	export let thumbnail: string | undefined = undefined;
	export let title: string = '';
	export let showMoreButton: boolean = true;
	export let chapters: Array<{
		title: string;
		start: number;
		end: number;
		isRelevant: boolean;
		relevanceScore: number | null;
	}> = [];
	export let confidence: number = 0;
	export let reasoning: string = '';

	const dispatch = createEventDispatcher();
	let videoEl: HTMLVideoElement;
	let videoDuration = 0;
	let isPlaying = false;

	function handleLoadedMetadata() {
		if (videoEl) {
			videoDuration = videoEl.duration;
			registerVideo(videoEl);
			// Seek to chapter with highest relevanceScore on initial load
			if (chapters.length > 0) {
				const mostRelevant = chapters.reduce(
					(max, c) => {
						if (
							c.relevanceScore !== null &&
							(max === undefined ||
								(max.relevanceScore !== null && c.relevanceScore > max.relevanceScore))
						) {
							return c;
						}
						return max;
					},
					undefined as (typeof chapters)[0] | undefined
				);
				if (mostRelevant) {
					seekTo(mostRelevant.start);
				}
			}
		}
	}

	function handleTimeUpdate() {
		if (!videoEl) return;
		const current = videoEl.currentTime; // in seconds
		const currentMs = current * 1000; // convert to milliseconds for comparison

		const chapter = chapters.find((c) => currentMs >= c.start && currentMs < c.end);

		if (chapter) {
			dispatch('chapterChange', chapter);
		}
	}

	function handlePlay() {
		isPlaying = true;
	}
	function handlePause() {
		isPlaying = false;
	}

	export function seekTo(timeInMs: number, play: boolean = false) {
		if (videoEl) {
			// pauseAllVideosExcept(videoEl);
			if (!videoEl.paused) {
				videoEl.pause();
			}
			videoEl.currentTime = timeInMs / 1000; // convert milliseconds to seconds
			if (play) {
				videoEl.play();
			}
		}
	}

	onMount(() => {
		if (videoEl) {
			videoEl.addEventListener('play', handlePlay);
			videoEl.addEventListener('pause', handlePause);
			// Ensure overlay is visible on initial load
			isPlaying = !videoEl.paused;
		}
	});

	onDestroy(() => {
		if (videoEl) {
			videoEl.removeEventListener('play', handlePlay);
			videoEl.removeEventListener('pause', handlePause);
			unregisterVideo(videoEl);
		}
	});
</script>

<div class="space-y-4">
	<!-- Title above video -->
	<!-- <h3 class="text-xl font-bold text-gray-900 text-center">
    {title}
  </h3> -->

	<div class="relative w-full">
		<div class="relative w-full">
			<!-- Title Overlay with Confidence Label -->
			{#if chapters.length > 0}
				<div
					class="absolute top-3 left-3 z-20 transition-opacity duration-1000"
					style="opacity: {isPlaying ? 0 : 1}; pointer-events: auto; width: 40%; max-width: 40vw;"
				>
					<div
						class="mb-2 inline-flex items-center rounded-full px-3 py-1 text-base font-bold"
						style="background: #ff9900; color: white; box-shadow: 0 2px 8px #ff9900aa;"
					>
						{confidence}%
						<span class="info-tooltip-parent relative ml-2">
							<svg
								class="h-4 w-4 cursor-pointer text-white"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								viewBox="0 0 24 24"
							>
								<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
								<line x1="12" y1="16" x2="12" y2="12" stroke="currentColor" stroke-width="2" />
								<line x1="12" y1="8" x2="12" y2="8" stroke="currentColor" stroke-width="2" />
							</svg>
							<span
								class="tooltip pointer-events-none absolute top-full left-1/2 z-30 mt-2 -translate-x-1/2 rounded bg-gray-900 px-3 py-2 text-xs whitespace-nowrap text-white opacity-0 shadow-lg transition-opacity duration-150"
							>
								Confidence is based on AI analysis of sermon relevance.
							</span>
						</span>
					</div>
					<span
						class="block text-3xl font-extrabold text-white text-shadow-lg/30"
						style="overflow-wrap: break-word; white-space: normal;"
					>
						{title}
					</span>
				</div>
			{/if}
			<video
				bind:this={videoEl}
				class="w-full rounded-xl shadow-lg"
				src={videoUrl}
				controls
				poster={thumbnail}
				on:loadedmetadata={handleLoadedMetadata}
				on:timeupdate={handleTimeUpdate}
				on:play={handlePlay}
				on:pause={handlePause}
			>
				<track kind="captions" src="data:text/vtt," srclang="en" label="English captions" default />
			</video>
			{#if videoDuration > 0 && chapters.length > 0}
				<div
					class="absolute bottom-18 left-0 z-10 flex h-2 w-full gap-1 pr-3 pl-3"
					style="pointer-events: auto;"
				>
					{#each chapters as chapter, i}
						{@const isActive =
							videoEl &&
							videoEl.currentTime * 1000 >= chapter.start &&
							videoEl.currentTime * 1000 < chapter.end}
						<div
							class="group relative h-full cursor-pointer rounded-sm transition-colors duration-150"
							class:bg-orange-500={isActive}
							class:bg-gray-400={!isActive}
							style="width: {((chapter.end - chapter.start) / videoDuration) *
								100}%; margin-left: {i === 0 ? '0' : '2px'};"
							role="button"
							tabindex="0"
							aria-label={`Go to chapter: ${chapter.title}`}
							on:click={() => seekTo(chapter.start, true)}
							on:keydown={(e) => {
								if (e.key === 'Enter' || e.key === ' ') {
									seekTo(chapter.start, true);
								}
							}}
						>
							<span
								class="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 -translate-x-1/2 rounded bg-gray-900 px-2 py-1 text-xs whitespace-nowrap text-white opacity-0 transition-opacity duration-150 group-hover:opacity-100"
							>
								{chapter.title}
							</span>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</div>

	<!-- display best answer below the video -->
	{#if reasoning}
		<div class="mt-4 rounded-lg bg-gray-100 p-4">
			<p class="text-gray-700">{reasoning}</p>
		</div>
	{/if}
</div>

<style>
	.info-tooltip-parent:hover .tooltip {
		opacity: 1;
		pointer-events: auto;
	}
</style>
