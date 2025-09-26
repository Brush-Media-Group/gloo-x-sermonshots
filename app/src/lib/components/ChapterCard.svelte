<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let chapter: {
    title: string;
    summary: string;
    start: number;
    end: number;
    isRelevant?: boolean;
    relevanceScore?: number | null;
  };
  export let clickable: boolean = true;
  export let isActive: boolean = false;

  const dispatch = createEventDispatcher();

  function handleClick() {
    if (clickable) {
      dispatch('click', chapter);
    }
  }

  function formatTime(milliseconds: number): string {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
</script>

{#if clickable}
  <button 
    class="w-full p-3 rounded-lg border transition-all duration-200 text-left relative
      {isActive
        ? 'bg-primary-50 border-primary-400 shadow-sm'
        : chapter.isRelevant
        ? 'bg-secondary-50 border-secondary-300 hover:bg-secondary-100 shadow-sm'
        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}"
    on:click={handleClick}
  >
    <div class="flex justify-between items-start mb-2">
      <h4 class="font-medium text-gray-900 flex-1 pr-4">
        {chapter.title}
        {#if chapter.isRelevant}
          <span class="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-secondary-100 text-secondary-800">
            🎯 Relevance Score: {chapter.relevanceScore}/100
          </span>
        {/if}
      </h4>
      <span class="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
        {formatTime(chapter.start)}
      </span>
    </div>
    <p class="text-sm text-gray-600">{chapter.summary}</p>
  </button>
{:else}
  <div class="p-4 rounded-lg border border-gray-200">
    <div class="flex justify-between items-start mb-2">
      <h4 class="font-medium text-gray-900 flex-1 pr-4">
        {chapter.title}
        {#if chapter.isRelevant}
          <span class="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-secondary-100 text-secondary-800">
            🎯 Relevance Score: {chapter.relevanceScore}/100
          </span>
        {/if}
      </h4>
      <span class="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
        {formatTime(chapter.start)}
      </span>
    </div>
    <p class="text-sm text-gray-600">{chapter.summary}</p>
  </div>
{/if}
