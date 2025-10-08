<script lang="ts">
	let showAllChapters = false;
	import { createEventDispatcher } from 'svelte';
	import ChapterCard from './ChapterCard.svelte';

	export let chapters: Array<{
		title: string;
		summary: string;
		start: number;
		end: number;
		isRelevant?: boolean;
		relevanceScore?: number | null;
	}> = [];
	export let activeChapter: string | null = null;

	const dispatch = createEventDispatcher();
	let scrollContainer: HTMLDivElement | undefined;
	let hasScrolledToRelevant = false;

	function handleChapterClick(event: CustomEvent) {
		dispatch('chapterClick', event.detail);
	}

	// Scroll to first relevant chapter within the container only
	function scrollToFirstRelevantChapter() {
		if (!scrollContainer || hasScrolledToRelevant) return;

		const firstRelevantIndex = chapters.findIndex((chapter) => chapter.isRelevant);
		if (firstRelevantIndex === -1) return;

		// Small delay to ensure DOM is fully rendered
		setTimeout(() => {
			if (!scrollContainer) return;

			const relevantChapterElement = scrollContainer.querySelector(
				`[data-chapter-index="${firstRelevantIndex}"]`
			) as HTMLElement;
			if (relevantChapterElement) {
				// Calculate the position relative to the scroll container
				const containerRect = scrollContainer.getBoundingClientRect();
				const elementRect = relevantChapterElement.getBoundingClientRect();
				const relativeTop = elementRect.top - containerRect.top;
				const containerHeight = scrollContainer.clientHeight;
				const elementHeight = relevantChapterElement.offsetHeight;

				// Calculate scroll position to center the element within the container
				const scrollTop =
					scrollContainer.scrollTop + relativeTop - containerHeight / 2 + elementHeight / 2;

				// Smooth scroll within the container only
				scrollContainer.scrollTo({
					top: scrollTop,
					behavior: 'smooth'
				});

				hasScrolledToRelevant = true;
			}
		}, 100);
	}

	// Reset scroll flag and trigger scroll when chapters change
	$: if (chapters && chapters.length > 0) {
		hasScrolledToRelevant = false;
		// Only scroll if there are relevant chapters and we haven't scrolled yet
		if (chapters.some((chapter) => chapter.isRelevant)) {
			setTimeout(() => scrollToFirstRelevantChapter(), 150);
		}
	}
</script>

<div>
	<div class="mb-4 flex items-center justify-between">
		<!-- <h3 class="text-xl font-semibold text-gray-900">Sermon Chapters</h3> -->
		<div class="flex items-center gap-2">
			{#if chapters.length > 0}
				<label class="flex cursor-pointer items-center text-xs text-gray-500">
					<input type="checkbox" bind:checked={showAllChapters} class="mr-1 ml-2" />
					Show all {chapters.length} chapters
				</label>
			{/if}
			<!-- info tool tip -->
			<div class="group relative">
				<i class="fa fa-info-circle cursor-pointer text-gray-400" aria-hidden="true"></i>
				<div
					class="absolute left-1/2 z-50 mt-2 hidden w-48 -translate-x-1/2 transform rounded-md border border-gray-200 bg-white p-2 text-xs text-gray-600 shadow-lg group-hover:block"
				>
					<p>
						Click on a chapter to jump to it in the sermon. Highlighted chapters are more relevant
						to your search.
					</p>
				</div>
			</div>
		</div>
	</div>

	<!-- Vertically scrollable chapters list -->
	<div
		class="flex h-96 w-full flex-col overflow-y-auto"
		style="scroll-behavior: smooth;"
		bind:this={scrollContainer}
	>
		{#each chapters as chapter, index}
			{#if showAllChapters || (chapter.relevanceScore && chapter.relevanceScore > 0)}
				<div data-chapter-index={index} class="mb-2 w-full flex-shrink-0 px-2">
					<ChapterCard
						{chapter}
						isActive={activeChapter === chapter.title}
						on:click={handleChapterClick}
					/>
				</div>
			{/if}
		{/each}
	</div>

	<!-- Scroll indicator when there are many chapters -->
	{#if chapters.length > 5}
		<div class="mt-3 text-center">
			<div
				class="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-400"
			>
				<svg class="mr-1 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M19 14l-7 7m0 0l-7-7m7 7V3"
					/>
				</svg>
				Scroll for more
			</div>
		</div>
	{/if}
</div>
