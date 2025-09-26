<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import VideoPlayer from './VideoPlayer.svelte';
  import ChaptersList from './ChaptersList.svelte';

  export let sermon: {
    transcription_id: string;
    videoUrl: string;
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
  };

  const dispatch = createEventDispatcher();
  let videoPlayerRef: VideoPlayer;
  let activeChapter: string | null = null;

  function handleChapterClick(event: CustomEvent) {
    const chapter = event.detail;
    if (videoPlayerRef) {
      videoPlayerRef.seekTo(chapter.start);
    }
    dispatch('chapterClick', chapter);
  }

  function handleMoreClick(event: CustomEvent) {
    dispatch('moreClick', event.detail);
  }

  function handleChapterChange(event: CustomEvent) {
    activeChapter = event.detail.title;
  }
</script>

<div class="max-w-6xl mx-auto">
  <!-- Sermon Title -->
  <h2 class="text-2xl font-bold text-gray-900 mb-6 text-center">
    {sermon.title || 'Untitled Sermon'}
  </h2>
  
  <!-- Main Result Layout -->
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-white rounded-2xl shadow-lg p-8">
    <!-- Left: Video -->
    <VideoPlayer 
      bind:this={videoPlayerRef}
      videoUrl={sermon.videoUrl}
      thumbnail={sermon.thumbnail}
      title={sermon.title || 'Untitled Sermon'}
      chapters={sermon.chapters}
      on:more={handleMoreClick}
      on:chapterChange={handleChapterChange}
    />
    
    <!-- Right: Chapters -->
    <ChaptersList 
      chapters={sermon.chapters}
      {activeChapter}
      on:chapterClick={handleChapterClick}
    />
  </div>
</div>
