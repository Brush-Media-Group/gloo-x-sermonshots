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

<div class="border rounded-xl p-4 shadow-sm flex flex-col md:flex-row gap-4">
  <!-- Video Player -->
  <div class="flex-1">
    <video
      bind:this={videoEl}
      src={video.video_url}
      controls
      class="w-full rounded-lg"
    >
      <!-- Placeholder track for accessibility compliance - would be replaced with actual captions -->
      <track kind="captions" src="data:text/vtt," srclang="en" label="English captions" default />
    </video>

    <!-- Transcript -->
    <div class="mt-3 text-gray-700 text-sm whitespace-pre-line">
      {#if expanded}
        {video.text}
      {:else}
        {video.text.slice(0, 300)}...
      {/if}
    </div>
    <button
      class="mt-2 text-primary-600 text-sm hover:underline"
      on:click={toggleTranscript}
    >
      {expanded ? 'Show less' : 'Show full transcript'}
    </button>
  </div>

  <!-- Chapters Sidebar -->
  <aside class="w-full md:w-64 bg-white/80 backdrop-blur-sm border border-primary-200 rounded-xl p-4 shadow-lg">
    <h3 class="font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-secondary-500 mb-4 flex items-center gap-2 text-base">
      <span class="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></span>
      Chapters
      <span class="ml-auto text-xs font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded-full border border-primary-200">{video.chapters.length}</span>
    </h3>
    <ul class="space-y-3">
      {#each video.chapters as chapter, index}
        <li>
          <button
            type="button"
            class="w-full text-left p-3 rounded-lg bg-white border border-gray-200 hover:bg-gradient-to-r hover:from-primary-50 hover:to-secondary-50 hover:border-primary-300 focus:bg-gradient-to-r focus:from-primary-50 focus:to-secondary-50 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/50 transition-all duration-300 shadow-sm hover:shadow-md hover:scale-[1.02] {chapter.isRelevant ? 'bg-gradient-to-r from-secondary-50 to-secondary-100 border-secondary-300 hover:from-secondary-100 hover:to-secondary-200' : ''}"
            on:click={() => seekTo(chapter)}
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-2">
                  <span class="flex items-center justify-center w-5 h-5 bg-gradient-to-r from-primary-500 to-secondary-500 text-white text-xs font-bold rounded-full shadow-sm">
                    {index + 1}
                  </span>
                  <p class="text-sm font-semibold text-gray-900">{chapter.title}</p>
                </div>
                <p class="text-xs text-gray-600 mb-3 leading-relaxed pl-7">{chapter.summary}</p>
                <div class="flex items-center gap-2 pl-7">
                  <span class="px-2 py-1 bg-primary-500 text-white text-xs font-medium rounded shadow-sm">
                    {Math.floor(chapter.start / 60)}:{String(Math.floor(chapter.start % 60)).padStart(2, '0')}
                  </span>
                  <span class="text-primary-500 text-xs font-bold">→</span>
                  <span class="px-2 py-1 bg-secondary-500 text-white text-xs font-medium rounded shadow-sm">
                    {Math.floor(chapter.end / 60)}:{String(Math.floor(chapter.end % 60)).padStart(2, '0')}
                  </span>
                </div>
              </div>
              {#if chapter.isRelevant}
                <div class="ml-3 flex flex-col items-center">
                  <span class="px-2 py-1 bg-gradient-to-r from-secondary-500 to-secondary-600 text-white text-xs font-bold rounded-full flex items-center gap-1 shadow-md">
                    🎯
                  </span>
                  <span class="text-xs text-secondary-600 mt-1 font-medium">Relevant</span>
                </div>
              {/if}
            </div>
          </button>
        </li>
      {/each}
    </ul>
  </aside>
</div>
