<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import VideoPlayer from './VideoPlayer.svelte';
  import ChaptersList from './ChaptersList.svelte';
  import { openModal } from '$lib/stores/modalStore';

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
      videoPlayerRef.seekTo(chapter.start);
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

<div class="max-w-6xl mx-auto">
  <!-- Main Result Layout -->
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
    <!-- Left: Layered Video Player -->
    <div class="relative">
      <!-- Left placeholder video -->
      <div class="absolute left-0 top-1/2 transform -translate-y-1/2 w-32 opacity-50 z-0">
        {#if prevSermon}
          <div class="aspect-video bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg shadow-md flex items-center justify-center">
            <div class="text-gray-600 text-xs font-medium px-2 py-1 bg-white/80 rounded text-center">
              {prevSermon.title || 'Previous'}
            </div>
          </div>
        {:else}
          <div class="aspect-video bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg shadow-md"></div>
        {/if}
      </div>

      <!-- Right placeholder video -->
      <div class="absolute right-0 top-1/2 transform -translate-y-1/2 w-32 opacity-50 z-0">
        {#if nextSermon}
          <div class="aspect-video bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg shadow-md flex items-center justify-center">
            <div class="text-gray-600 text-xs font-medium px-2 py-1 bg-white/80 rounded text-center">
              {nextSermon.title || 'Next'}
            </div>
          </div>
        {:else}
          <div class="aspect-video bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg shadow-md"></div>
        {/if}
      </div>

      <!-- Main active video (overlaid on top) -->
      <div class="relative z-10 mx-8">
        {#if currentSermon}
          <VideoPlayer 
            bind:this={videoPlayerRef}
            videoUrl={currentSermon.videoUrl}
            thumbnail={currentSermon.thumbnail}
            title={currentSermon.title || 'Untitled Sermon'}
            chapters={currentSermon.chapters}
            on:more={handleMoreClick}
            on:chapterChange={handleChapterChange}
          />
        {/if}
      </div>
    </div>
    
    <!-- Right: Chapters -->
    {#if currentSermon}
      <ChaptersList 
        chapters={currentSermon.chapters}
        {activeChapter}
        on:chapterClick={handleChapterClick}
      />
    {/if}
  </div>
</div>
