<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import ChapterCard from './ChapterCard.svelte';

  export let chapters: Array<{
    title: string;
    summary: string;
    start: number;
    end: number;
    isRelevant?: boolean;
    relevanceScore?: number | null;
  }> = [];
  export let activeChapter: string | null = null;

  const dispatch = createEventDispatcher();
  let scrollContainer: HTMLDivElement | undefined;
  let hasScrolledToRelevant = false;

  function handleChapterClick(event: CustomEvent) {
    dispatch('chapterClick', event.detail);
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

<div>
  <div class="flex justify-between items-center mb-4">
    <h3 class="text-xl font-semibold text-gray-900">Sermon Chapters</h3>
    {#if chapters.length > 0}
      <span class="text-xs text-gray-500">{chapters.length} chapter{chapters.length !== 1 ? 's' : ''}</span>
    {/if}
  </div>
  
  <!-- Scrollable chapters list with max height -->
  <div class="space-y-3 max-h-96 overflow-y-auto pr-2" bind:this={scrollContainer}>
    {#each chapters as chapter, index}
      <div data-chapter-index={index}>
        <ChapterCard 
          {chapter} 
          isActive={activeChapter === chapter.title}
          on:click={handleChapterClick}
        />
      </div>
    {/each}
  </div>
  
  <!-- Scroll indicator when there are many chapters -->
  {#if chapters.length > 5}
    <div class="text-center mt-3">
      <div class="inline-flex items-center text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
        <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
        Scroll for more
      </div>
    </div>
  {/if}
</div>
