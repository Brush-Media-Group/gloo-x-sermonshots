<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { browser } from '$app/environment';
  import { isModalOpen, modalResult, closeModal } from '$lib/stores/modalStore';
  import ResultCard from './ResultCard.svelte';

  let modalElement: HTMLDivElement;

  // Close modal on escape key
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      closeModal();
    }
  }

  // Close modal when clicking outside
  function handleBackdropClick(event: MouseEvent) {
    if (event.target === modalElement) {
      closeModal();
    }
  }

  onMount(() => {
    if (browser) {
      document.addEventListener('keydown', handleKeydown);
    }
  });

  onDestroy(() => {
    if (browser) {
      document.removeEventListener('keydown', handleKeydown);
    }
  });
</script>

{#if $isModalOpen && $modalResult}
  <!-- Modal Backdrop -->
  <div 
    class="fixed inset-0 bg-gray-700/70 z-50 flex items-center justify-center p-8"
    bind:this={modalElement}
    on:click={handleBackdropClick}
    on:keydown={handleKeydown}
    role="dialog"
    aria-modal="true"
    tabindex="-1"
  >
    <!-- Modal Content -->
    <div class="relative w-full max-w-6xl h-auto max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-y-auto">
      <!-- Close Button -->
      <button
        class="absolute top-6 right-6 z-10 bg-white hover:bg-gray-100 rounded-full p-2 shadow-lg transition-colors border border-gray-200"
        on:click={closeModal}
        aria-label="Close modal"
      >
        <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <!-- Result Card Content -->
      <div class="p-6">
        <ResultCard result={$modalResult} isModal={true} />
      </div>
    </div>
  </div>
{/if}

<style>
  /* Smooth animations */
  .fixed {
    animation: fadeIn 0.2s ease-out;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
</style>
