<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let chapters: { title: string; summary: string; start: number; end: number }[] = [];
  export let activeChapter: string | null = null;

  const dispatch = createEventDispatcher();

  function handleClick(chapter) {
    dispatch('seek', chapter);
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
    >
      <p class="font-medium text-gray-800">{chapter.title}</p>
      <p class="text-xs text-gray-600 mt-1">{chapter.summary}</p>
    </div>
  {/each}
</div>
