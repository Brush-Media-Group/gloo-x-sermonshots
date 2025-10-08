<script lang="ts">
	export let video;

	let expanded = false;
	let videoEl: HTMLVideoElement;

	function toggleTranscript() {
		expanded = !expanded;
	}

	function seekTo(chapter: { start: number; end: number }) {
		if (videoEl) {
			videoEl.currentTime = chapter.start;
			videoEl.play();
		}
	}
</script>

<div class="flex flex-col gap-4 rounded-xl border p-4 shadow-sm md:flex-row">
	<!-- Video Player -->
	<div class="flex-1">
		<video bind:this={videoEl} src={video.video_url} controls class="w-full rounded-lg">
			<!-- Placeholder track for accessibility compliance - would be replaced with actual captions -->
			<track kind="captions" src="data:text/vtt," srclang="en" label="English captions" default />
		</video>

		<!-- Transcript -->
		<div class="mt-3 text-sm whitespace-pre-line text-gray-700">
			{#if expanded}
				{video.text}
			{:else}
				{video.text.slice(0, 300)}...
			{/if}
		</div>
		<button class="mt-2 text-sm text-primary-600 hover:underline" on:click={toggleTranscript}>
			{expanded ? 'Show less' : 'Show full transcript'}
		</button>
	</div>

	<!-- Chapters Sidebar -->
	<aside
		class="w-full rounded-xl border border-primary-200 bg-white/80 p-4 shadow-lg backdrop-blur-sm md:w-64"
	>
		<h3
			class="mb-4 flex items-center gap-2 bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-base font-bold text-transparent"
		>
			<span class="h-2 w-2 animate-pulse rounded-full bg-primary-500"></span>
			Chapters
			<span
				class="ml-auto rounded-full border border-primary-200 bg-primary-50 px-2 py-1 text-xs font-medium text-primary-600"
				>{video.chapters.length}</span
			>
		</h3>
		<ul class="space-y-3">
			{#each video.chapters as chapter, index}
				<li>
					<button
						type="button"
						class="w-full rounded-lg border border-gray-200 bg-white p-3 text-left shadow-sm transition-all duration-300 hover:scale-[1.02] hover:border-primary-300 hover:bg-gradient-to-r hover:from-primary-50 hover:to-secondary-50 hover:shadow-md focus:border-primary-400 focus:bg-gradient-to-r focus:from-primary-50 focus:to-secondary-50 focus:ring-2 focus:ring-primary-400/50 focus:outline-none {chapter.isRelevant
							? 'border-secondary-300 bg-gradient-to-r from-secondary-50 to-secondary-100 hover:from-secondary-100 hover:to-secondary-200'
							: ''}"
						on:click={() => seekTo(chapter)}
					>
						<div class="flex items-start justify-between">
							<div class="flex-1">
								<div class="mb-2 flex items-center gap-2">
									<span
										class="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 text-xs font-bold text-white shadow-sm"
									>
										{index + 1}
									</span>
									<p class="text-sm font-semibold text-gray-900">{chapter.title}</p>
								</div>
								<p class="mb-3 pl-7 text-xs leading-relaxed text-gray-600">{chapter.summary}</p>
								<div class="flex items-center gap-2 pl-7">
									<span
										class="rounded bg-primary-500 px-2 py-1 text-xs font-medium text-white shadow-sm"
									>
										{Math.floor(chapter.start / 60)}:{String(
											Math.floor(chapter.start % 60)
										).padStart(2, '0')}
									</span>
									<span class="text-xs font-bold text-primary-500">→</span>
									<span
										class="rounded bg-secondary-500 px-2 py-1 text-xs font-medium text-white shadow-sm"
									>
										{Math.floor(chapter.end / 60)}:{String(Math.floor(chapter.end % 60)).padStart(
											2,
											'0'
										)}
									</span>
								</div>
							</div>
							{#if chapter.isRelevant}
								<div class="ml-3 flex flex-col items-center">
									<span
										class="flex items-center gap-1 rounded-full bg-gradient-to-r from-secondary-500 to-secondary-600 px-2 py-1 text-xs font-bold text-white shadow-md"
									>
										🎯
									</span>
									<span class="mt-1 text-xs font-medium text-secondary-600">Relevant</span>
								</div>
							{/if}
						</div>
					</button>
				</li>
			{/each}
		</ul>
	</aside>
</div>
