<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import VideoPlayer from './VideoPlayer.svelte';
	import ChaptersList from './ChaptersList.svelte';
	import AIAnalysisCard from './AIAnalysisCard.svelte';
	import { openModal } from '$lib/stores/modalStore';
	import type { AIAnalysis } from '$lib/types';

	export let sermons: Array<{
		transcription_id: string;
		videoUrl: string;
		text: string;
		title?: string;
		thumbnail?: string;
		chapters: Array<{
			title: string;
			summary: string;
			start: number;
			end: number;
			isRelevant?: boolean;
			relevanceScore?: number | null;
			transcript?: string;
		}>;
		aiAnalysis?: AIAnalysis;
	}> = [];
	export let currentIndex: number = 0;

	const dispatch = createEventDispatcher();
	let videoPlayerRef: VideoPlayer;
	let activeChapter: string | null = null;

	$: currentSermon = sermons[currentIndex];
	$: nextSermon = sermons[currentIndex + 1];
	$: prevSermon = sermons[currentIndex - 1];

	function handleChapterClick(event: CustomEvent) {
		const chapter = event.detail;
		if (videoPlayerRef) {
			videoPlayerRef.seekTo(chapter.start, true);
		}
		dispatch('chapterClick', chapter);
	}

	function handleMoreClick(event: CustomEvent) {
		if (currentSermon) {
			openModal({
				transcription_id: currentSermon.transcription_id,
				videoUrl: currentSermon.videoUrl,
				text: currentSermon.text,
				title: currentSermon.title || 'Untitled Sermon',
				chapters: currentSermon.chapters,
				thumbnail: currentSermon.thumbnail
			});
		}
		dispatch('moreClick', event.detail);
	}

	function handleChapterChange(event: CustomEvent) {
		activeChapter = event.detail.title;
	}
</script>

<div class="mx-auto max-w-7xl">

	<!-- Main Result Layout -->
	<div class="rounded-2xl bg-white p-8 shadow-lg">
		<div class="relative">

			<!-- Main active video and chapters list side by side -->
			{#if currentSermon}
				<div class="mb-2 flex flex-row items-center justify-center">
					<span
						class="mr-4 text-8xl leading-none font-extrabold text-gray-200 select-none"
						style="font-family: serif;">“</span
					>
					<h3 class="mb-6 text-center text-xl font-bold text-orange-500 uppercase">
						{currentSermon.aiAnalysis?.bestAnswer}
					</h3>
				</div>
				<div class="relative z-10 mx-4 flex flex-row items-start gap-4">
					<div class="min-w-0 flex-1">
						<VideoPlayer
							bind:this={videoPlayerRef}
							videoUrl={currentSermon.videoUrl}
							thumbnail={currentSermon.thumbnail}
							title={currentSermon.title || 'Untitled Sermon'}
							chapters={currentSermon.chapters}
							confidence={currentSermon.aiAnalysis?.confidence || 0}
							reasoning={currentSermon.aiAnalysis?.reasoning || ''}
							on:more={handleMoreClick}
							on:chapterChange={handleChapterChange}
						/>
					</div>
					<div class="w-100 max-w-full">
						<ChaptersList
							chapters={currentSermon.chapters}
							{activeChapter}
							on:chapterClick={handleChapterClick}
						/>
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>
