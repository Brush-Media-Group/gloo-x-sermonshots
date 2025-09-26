<script lang="ts">
  import { createEventDispatcher, onMount, onDestroy } from 'svelte';
  import { pauseAllVideosExcept, registerVideo, unregisterVideo } from '$lib/stores/videoStore';

  export let videoUrl: string;
  export let thumbnail: string | undefined = undefined;
  export let title: string = '';
  export let showMoreButton: boolean = true;
  export let chapters: Array<{ title: string; start: number; end: number }> = [];

  const dispatch = createEventDispatcher();
  let videoEl: HTMLVideoElement;
  let videoDuration = 0;

  function handleMoreClick() {
    dispatch('more', { videoUrl, title });
  }

  function handleLoadedMetadata() {
    if (videoEl) {
      videoDuration = videoEl.duration;
      registerVideo(videoEl);
    }
  }

  function handleTimeUpdate() {
    if (!videoEl) return;
    const current = videoEl.currentTime; // in seconds
    const currentMs = current * 1000; // convert to milliseconds for comparison

    const chapter = chapters.find(
      (c) => currentMs >= c.start && currentMs < c.end
    );

    if (chapter) {
      dispatch('chapterChange', chapter);
    }
  }

  export function seekTo(timeInMs: number) {
    if (videoEl) {
      pauseAllVideosExcept(videoEl);
      if (!videoEl.paused) {
        videoEl.pause();
      }
      videoEl.currentTime = timeInMs / 1000; // convert milliseconds to seconds
      videoEl.play();
    }
  }

  onDestroy(() => {
    if (videoEl) {
      unregisterVideo(videoEl);
    }
  });
</script>

<div class="space-y-4">
  <!-- Title above video -->
  <h3 class="text-xl font-bold text-gray-900 text-center">
    {title}
  </h3>
  
  <div class="relative w-full">
    <video
      bind:this={videoEl}
      class="w-full rounded-xl shadow-lg"
      src={videoUrl}
      controls
      poster={thumbnail}
      on:loadedmetadata={handleLoadedMetadata}
      on:timeupdate={handleTimeUpdate}
    >
      <track kind="captions" src="data:text/vtt," srclang="en" label="English captions" default />
    </video>

  </div>
  
  {#if showMoreButton}
    <div class="text-center">
      <button 
        class="px-6 py-3 bg-sky-500 text-white rounded-full hover:bg-sky-600 transition-colors duration-200 font-medium"
        on:click={handleMoreClick}
      >
        More from this sermon
      </button>
    </div>
  {/if}
</div>
