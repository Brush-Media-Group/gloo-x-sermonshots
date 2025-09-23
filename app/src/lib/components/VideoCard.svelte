<script lang="ts">
  export let video;

  let expanded = false;
  let videoEl: HTMLVideoElement;

  function toggleTranscript() {
    expanded = !expanded;
  }

  function seekTo(chapter) {
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
    ></video>

    <!-- Transcript -->
    <div class="mt-3 text-gray-700 text-sm whitespace-pre-line">
      {#if expanded}
        {video.text}
      {:else}
        {video.text.slice(0, 300)}...
      {/if}
    </div>
    <button
      class="mt-2 text-blue-600 text-sm hover:underline"
      on:click={toggleTranscript}
    >
      {expanded ? 'Show less' : 'Show full transcript'}
    </button>
  </div>

  <!-- Chapters Sidebar -->
  <aside class="w-full md:w-64 bg-gray-50 border rounded-lg p-3">
    <h3 class="font-semibold mb-2">Chapters</h3>
    <ul class="space-y-2">
      {#each video.chapters as chapter}
        <li
          class="p-2 rounded hover:bg-blue-100 cursor-pointer"
          on:click={() => seekTo(chapter)}
        >
          <p class="text-sm font-medium">{chapter.title}</p>
          <p class="text-xs text-gray-500">{chapter.summary}</p>
          <p class="text-xs text-gray-400">
            {Math.floor(chapter.start / 60)}:{String(Math.floor(chapter.start % 60)).padStart(2, '0')}
            –
            {Math.floor(chapter.end / 60)}:{String(Math.floor(chapter.end % 60)).padStart(2, '0')}
          </p>
        </li>
      {/each}
    </ul>
  </aside>
</div>
