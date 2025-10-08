<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let onSearch: (query: string) => void = () => {};
  export let placeholder = 'Ask a question about faith or search for sermon topics...';
  export let isLoading = false;
  export let showCurrentSearch = false; // Whether to show the current search term
  export let currentSearchTerm = ''; // The current active search term
  export let onClear: (() => void) | null = null; // Optional clear function
  export let value = ''; // Reactive prop to set search term from outside
  
  let term = '';
  let inputRef: HTMLInputElement;
  const dispatch = createEventDispatcher();

  // Make the search bar reactive to external value changes
  $: term = value;

  function handleSubmit(e: Event) {
    e.preventDefault();
    if (term.trim() && !isLoading) {
      performSearch();
    }
  }

  function handleClear() {
    term = '';
    value = '';
    if (onClear) {
      onClear();
    }
  }

  function handleInput() {
    value = term;
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !isLoading) {
      handleSubmit(e);
    }
  }

  function performSearch() {
    if (term.trim()) {
      onSearch(term.trim());
    }
  }
</script>

<div class="w-full max-w-4xl mx-auto">
  <!-- Current Search Display -->
  <!-- {#if showCurrentSearch && currentSearchTerm}
    <div class="mb-4 text-center">
      <div class="inline-flex items-center gap-2 px-4 py-2 bg-sky-50 border border-sky-200 rounded-full text-sky-800">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <span class="text-sm font-medium">Results for:</span>
        <span class="text-sm font-semibold">"{currentSearchTerm}"</span>
        {#if onClear}
          <button 
            on:click={handleClear}
            class="ml-2 p-1 hover:bg-sky-200 rounded-full transition-colors duration-200"
            title="Clear search"
            aria-label="Clear search"
          >
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        {/if}
      </div>
    </div>
  {/if} -->

  <form on:submit={handleSubmit}>
    <div class="relative flex items-center bg-white rounded-full shadow-lg border border-gray-200 focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-sky-100 transition-all duration-200">
      <!-- Search Icon -->
      <div class="pl-4 pr-2">
        <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      <!-- Input Field -->
      <input
        bind:this={inputRef}
        type="text"
        bind:value={term}
        {placeholder}
        disabled={isLoading}
        on:keydown={handleKeydown}
        on:input={handleInput}
        class="flex-1 bg-transparent border-none outline-none text-gray-900 placeholder-gray-500 disabled:opacity-50 text-base"
        autocomplete="off"
        spellcheck="false"
      />

      <!-- Search Button -->
      <button
        type="submit"
        disabled={!term.trim() || isLoading}
        class="m-2 px-8 py-3 bg-orange-400 text-white rounded-full focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 font-medium"
      >
        {#if isLoading}
          <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span class="hidden sm:inline">Searching...</span>
        {:else}
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3l14 9-14 9V3z" />
          </svg>
          <span>Search</span>
        {/if}
      </button>
    </div>
    <!-- Toggle Related Content (below input) -->
  <div class="w-full flex justify-start mt-2">
  <label class="flex items-center gap-2 cursor-pointer select-none text-xs text-zinc-700 ml-4">
        <input type="checkbox" class="accent-orange-400 w-4 h-4 ml-4" on:change={e => dispatch('toggleRelated')} />
        Include related answers from other churches
      </label>
    </div>
  </form>
</div>
