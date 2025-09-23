<script lang="ts">
  import ChapterList from './ChapterList.svelte';

  export let result: {
    transcription_id: string;
    videoUrl: string;
    text: string;
    chapters: { title: string; summary: string; start: number; end: number }[];
  };

  let showFullTranscript = false;
  let videoEl: HTMLVideoElement;
  let activeChapter: { title: string; start: number; end: number } | null = null;
  let videoDuration = 0;

  function handleLoadedMetadata() {
    if (videoEl) {
      videoDuration = videoEl.duration;
    }
  }

  function handleTimeUpdate() {
    if (!videoEl) return;
    const current = videoEl.currentTime;

    const chapter = result.chapters.find(
      (c) => current >= c.start && current < c.end
    );

    activeChapter = chapter ?? null;

    if (activeChapter && current >= activeChapter.end) {
      videoEl.pause();
    }
  }

  function seekTo(chapter) {
    if (videoEl) {
      videoEl.currentTime = chapter.start;
      videoEl.play();
      activeChapter = chapter;
    }
  }
</script>

<div class="bg-white shadow rounded-xl p-6">
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
        ></video>

        <!-- Chapter Indicators on progress bar -->
        {#if videoDuration > 0}
          <div
            class="absolute bottom-9 left-0 w-full h-1 pointer-events-none"
            style="background: transparent;"
          >
            {#each result.chapters as chapter}
              <div
                class={`absolute top-0 h-1 rounded transition
                  ${activeChapter?.title === chapter.title
                    ? 'bg-blue-600'
                    : 'bg-blue-400/70'}
                `}
                style="
                  left: {(chapter.start / videoDuration) * 100}%;
                  width: {((chapter.end - chapter.start) / videoDuration) * 100}%;
                "
              ></div>
            {/each}
          </div>
        {/if}
      </div>

      <!-- Transcript -->
      <div>
        <h3 class="font-semibold text-gray-800">Transcript</h3>
        <p class="text-sm text-gray-600 mt-2">
          {#if showFullTranscript}
            {result.text}
          {:else}
            {result.text.slice(0, 300)}...
          {/if}
        </p>
        <button
          class="mt-2 text-blue-600 hover:underline text-sm"
          on:click={() => (showFullTranscript = !showFullTranscript)}
        >
          {showFullTranscript ? 'Show Less' : 'View Full Transcript'}
        </button>
      </div>
    </div>

    <!-- Right side: Chapters -->
    <div class="md:col-span-1">
      <ChapterList
        chapters={result.chapters}
        activeChapter={activeChapter?.title ?? null}
        on:seek={(e) => seekTo(e.detail)}
      />
    </div>
  </div>
</div>
