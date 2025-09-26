<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let chapters: { title: string; summary: string; start: number; end: number; transcript?: string; isRelevant?: boolean; relevanceScore?: number | null }[] = [];
  export let activeChapter: string | null = null;

  const dispatch = createEventDispatcher();
  let scrollContainer: HTMLDivElement | undefined;
  let hasScrolledToRelevant = false;

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

  // Scroll to first relevant chapter within the container only
  function scrollToFirstRelevantChapter() {
    if (!scrollContainer || hasScrolledToRelevant) return;
    
    const firstRelevantIndex = chapters.findIndex(chapter => chapter.isRelevant);
    if (firstRelevantIndex === -1) return;

    // Small delay to ensure DOM is fully rendered
    setTimeout(() => {
      if (!scrollContainer) return;
      
      const relevantChapterElement = scrollContainer.querySelector(`[data-chapter-index="${firstRelevantIndex}"]`) as HTMLElement;
      if (relevantChapterElement) {
        // Calculate the position relative to the scroll container
        const containerRect = scrollContainer.getBoundingClientRect();
        const elementRect = relevantChapterElement.getBoundingClientRect();
        const relativeTop = elementRect.top - containerRect.top;
        const containerHeight = scrollContainer.clientHeight;
        const elementHeight = relevantChapterElement.offsetHeight;
        
        // Calculate scroll position to center the element within the container
        const scrollTop = scrollContainer.scrollTop + relativeTop - (containerHeight / 2) + (elementHeight / 2);
        
        // Smooth scroll within the container only
        scrollContainer.scrollTo({
          top: scrollTop,
          behavior: 'smooth'
        });
        
        hasScrolledToRelevant = true;
      }
    }, 100);
  }

  // Reset scroll flag and trigger scroll when chapters change
  $: if (chapters && chapters.length > 0) {
    hasScrolledToRelevant = false;
    // Only scroll if there are relevant chapters and we haven't scrolled yet
    if (chapters.some(chapter => chapter.isRelevant)) {
      setTimeout(() => scrollToFirstRelevantChapter(), 150);
    }
  }
</script>

<div class="space-y-3">
  <div class="flex justify-between items-center">
    <h3 class="font-semibold text-gray-800">Chapters</h3>
    {#if chapters.length > 0}
      <span class="text-xs text-gray-500">{chapters.length} chapter{chapters.length !== 1 ? 's' : ''}</span>
    {/if}
  </div>
  
  <!-- Scrollable chapters list with max height -->
  <div class="space-y-3 max-h-96 overflow-y-auto pr-2" bind:this={scrollContainer}>
    {#each chapters as chapter, index}
      <div
        class={`p-3 rounded-lg border cursor-pointer transition relative
          ${activeChapter === chapter.title
            ? 'bg-primary-50 border-primary-400 shadow-sm'
            : chapter.isRelevant
            ? 'bg-secondary-50 border-secondary-300 hover:bg-secondary-100 shadow-sm'
            : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}
        `}
        data-chapter-index={index}
        on:click={() => handleClick(chapter)}
        on:keydown={(e) => (e.key === 'Enter' || e.key === ' ') && handleClick(chapter)}
        role="button"
        tabindex="0"
      >
        {#if chapter.isRelevant}
          <div class="absolute top-2 right-2 flex gap-2">
            <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-secondary-100 text-secondary-800">
              🎯 Relevance Score: {chapter.relevanceScore}/100
            </span>
          </div>
        {/if}
        <div class="flex justify-between items-start mb-1">
          <p class="font-medium text-gray-800 pr-16">{chapter.title}</p>
          <span class="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
            {formatTime(chapter.start)}
          </span>
        </div>
        <p class="text-xs text-gray-600">{chapter.summary}</p>
      </div>
    {/each}
  </div>
  
  <!-- Scroll indicator when there are many chapters -->
  {#if chapters.length > 5}
    <div class="text-center">
      <div class="inline-flex items-center text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
        <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
        Scroll for more
      </div>
    </div>
  {/if}
</div>