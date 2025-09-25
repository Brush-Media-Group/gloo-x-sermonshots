<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import ChapterList from './ChapterList.svelte';
  import { pauseAllVideosExcept, registerVideo, unregisterVideo } from '$lib/stores/videoStore';
  import { openModal } from '$lib/stores/modalStore';

  export let result: {
    transcription_id: string;
    videoUrl: string;
    text: string;
    title?: string;
    chapters: { title: string; summary: string; start: number; end: number; transcript?: string }[];
    thumbnail?: string;
  };
  export let isModal: boolean = false;

  let showFullTranscript = false;
  let videoEl: HTMLVideoElement;
  let activeChapter: { title: string; start: number; end: number; transcript?: string } | null = null;
  let videoDuration = 0;
  let selectedChapterForTranscript: { title: string; transcript?: string } | null = null;

  function handleLoadedMetadata() {
    if (videoEl) {
      videoDuration = videoEl.duration;
      // Register this video element for global management
      registerVideo(videoEl);
    }
  }

  // Cleanup when component is destroyed
  onDestroy(() => {
    if (videoEl) {
      unregisterVideo(videoEl);
    }
  });

  function handleTimeUpdate() {
    if (!videoEl) return;
    const current = videoEl.currentTime; // in seconds
    const currentMs = current * 1000; // convert to milliseconds for comparison

    const chapter = result.chapters.find(
      (c) => currentMs >= c.start && currentMs < c.end
    );

    activeChapter = chapter ?? null;

    if (activeChapter && currentMs >= activeChapter.end) {
      videoEl.pause();
    }
  }

  function seekTo(chapter: { title: string; start: number; end: number; transcript?: string }) {
    if (videoEl) {
      // Pause all other videos on the page first
      pauseAllVideosExcept(videoEl);
      
      // Pause this video first if it's currently playing
      if (!videoEl.paused) {
        videoEl.pause();
      }
      
      // Seek to the chapter start time
      videoEl.currentTime = chapter.start / 1000; // convert milliseconds to seconds
      
      // Play the video at the new position
      videoEl.play();
      activeChapter = chapter;
    }
    // Set the selected chapter for transcript display
    selectedChapterForTranscript = {
      title: chapter.title,
      transcript: chapter.transcript
    };
  }

  // Function to reset to full transcript
  function showFullVideoTranscript() {
    selectedChapterForTranscript = null;
    showFullTranscript = false;
  }

  // Function to open modal (only if not already in modal)
  function handleCardClick() {
    if (!isModal) {
      openModal({
        transcription_id: result.transcription_id,
        videoUrl: result.videoUrl,
        text: result.text,
        title: result.title || 'Untitled Video',
        chapters: result.chapters,
        thumbnail: result.thumbnail
      });
    }
  }
</script>

<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
<div 
  class="bg-white shadow rounded-xl p-6"
  class:cursor-pointer={!isModal}
  class:hover:shadow-lg={!isModal}
  class:transition-shadow={!isModal}
  class:duration-200={!isModal}
  on:click={!isModal ? handleCardClick : undefined}
  on:keydown={!isModal ? (e) => (e.key === 'Enter' || e.key === ' ') && handleCardClick() : undefined}
  role={!isModal ? 'button' : undefined}
  tabindex={!isModal ? 0 : undefined}
  aria-label={!isModal ? 'Click to expand video details' : undefined}
>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    <!-- Left side: Video + Transcript -->
    <div class="md:col-span-2 space-y-4">
      <div class="relative w-full">
        <video
          class="w-full rounded-lg"
          src={result.videoUrl}
          controls
          bind:this={videoEl}
          on:loadedmetadata={handleLoadedMetadata}
          on:timeupdate={handleTimeUpdate}
          on:click|stopPropagation
        >
          <!-- Placeholder track for accessibility compliance - would be replaced with actual captions -->
          <track kind="captions" src="data:text/vtt," srclang="en" label="English captions" default />
        </video>

        <!-- Chapter Indicators on progress bar -->
        {#if videoDuration > 0}
          <div
            class="absolute bottom-9 left-0 w-full h-1 pointer-events-none"
          >
            {#each result.chapters as chapter}
              <div
                class={`absolute top-0 h-1 rounded transition
                  ${activeChapter?.title === chapter.title
                    ? 'bg-primary-600'
                    : 'bg-primary-400/70'}`}
                style="
                  left: {((chapter.start / 1000) / videoDuration) * 100}%;
                  width: {(((chapter.end - chapter.start) / 1000) / videoDuration) * 100}%;
                "
              ></div>
            {/each}
          </div>
        {/if}
      </div>

      <!-- Transcript -->
      <div>
        <div class="flex justify-between items-center mb-2">
          <h3 class="font-semibold text-gray-800">
            {selectedChapterForTranscript ? `Chapter: ${selectedChapterForTranscript.title}` : 'Transcript'}
          </h3>
          {#if selectedChapterForTranscript}
            <button
              class="text-xs text-primary-600 hover:underline"
              on:click|stopPropagation={showFullVideoTranscript}
            >
              ← Back to Full Transcript
            </button>
          {/if}
        </div>
        
        <p class="text-sm text-gray-600 mt-2 text-justify">
          {#if selectedChapterForTranscript}
            <!-- Show chapter transcript -->
            {selectedChapterForTranscript.transcript || 'No transcript available for this chapter.'}
          {:else if showFullTranscript}
            <!-- Show full transcript -->
            {result.text}
          {:else}
            <!-- Show truncated full transcript -->
            {result.text.slice(0, 300)}...
          {/if}
        </p>
        
        {#if !selectedChapterForTranscript}
          <button
            class="mt-2 text-primary-600 hover:underline text-sm"
            on:click|stopPropagation={() => (showFullTranscript = !showFullTranscript)}
          >
            {showFullTranscript ? 'Show Less' : 'View Full Transcript'}
          </button>
        {/if}
      </div>
    </div>

    <!-- Right side: Chapters -->
    <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
    <div class="md:col-span-1" on:click|stopPropagation on:keydown|stopPropagation role="region" aria-label="Chapter navigation">
      <ChapterList
        chapters={result.chapters}
        activeChapter={activeChapter?.title ?? null}
        on:seek={(e) => seekTo(e.detail)}
      />
    </div>
  </div>
</div>