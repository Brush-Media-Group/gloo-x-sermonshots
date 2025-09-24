<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let chapters: { title: string; summary: string; start: number; end: number }[] = [];
  export let activeChapter: string | null = null;

  const dispatch = createEventDispatcher();

  function handleClick(chapter: { title: string; start: number; end: number }) {
    dispatch('seek', chapter);
  }

  // Helper function to format time in milliseconds to MM:SS format
  function formatTime(milliseconds: number): string {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
</script>

<div class="space-y-3">
  <h3 class="font-semibold text-gray-800">Chapters</h3>
  {#each chapters as chapter}
    <div
      class={`p-3 rounded-lg border cursor-pointer transition
        ${activeChapter === chapter.title
          ? 'bg-blue-50 border-blue-400 shadow-sm'
          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}
      `}
      on:click={() => handleClick(chapter)}
      role="button"
      tabindex="0"
    >
      <div class="flex justify-between items-start mb-1">
        <p class="font-medium text-gray-800">{chapter.title}</p>
        <span class="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
          {formatTime(chapter.start)}
        </span>
      </div>
      <p class="text-xs text-gray-600">{chapter.summary}</p>
    </div>
  {/each}
</div>