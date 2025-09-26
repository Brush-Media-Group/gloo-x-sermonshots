<script lang="ts">
  export let value = '';
  export let onSearch: (query: string) => void = () => {};
  export let placeholder = 'Ask a question about faith or search for sermon topics...';
  export let isLoading = false;
  export let debounceMs = 500; // Configurable debounce delay
  export let minSearchLength = 2; // Minimum characters before searching
  
  let term = value || '';
  let inputRef: HTMLInputElement;
  let debounceTimer: NodeJS.Timeout | null = null;

  function handleSubmit(e: Event) {
    e.preventDefault();
    if (term.trim() && !isLoading) {
      performSearch();
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !isLoading) {
      handleSubmit(e);
    }
  }

  function performSearch() {
    if (term.trim().length >= minSearchLength) {
      onSearch(term.trim());
    }
  }


  // Auto-search with debounce when term changes
  let lastSearchTerm = '';
  $: if (term !== lastSearchTerm) {
    // Clear existing timer
    if (debounceTimer) {
      clearTimeout(debounceTimer);
      debounceTimer = null;
    }
    
    // Only search if term meets minimum length requirement and is different from last search
    if (term && term.trim().length >= minSearchLength && term.trim() !== lastSearchTerm.trim()) {
      debounceTimer = setTimeout(() => {
        if (!isLoading && term.trim() !== lastSearchTerm.trim()) {
          lastSearchTerm = term.trim();
          performSearch();
        }
      }, debounceMs);
    } else if (!term || term.trim().length === 0) {
      // Reset lastSearchTerm when input is empty
      lastSearchTerm = '';
    }
  }
</script>

<form on:submit={handleSubmit} class="w-full max-w-4xl mx-auto">
  <div class="relative flex items-center bg-white rounded-full shadow-lg border border-gray-200 focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-sky-100 transition-all duration-200">
    <!-- Search Icon -->
    <div class="pl-6 pr-2">
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
      class="flex-1 py-4 px-3 bg-transparent border-none outline-none text-gray-900 placeholder-gray-500 disabled:opacity-50 text-base"
      autocomplete="off"
      spellcheck="false"
    />

    <!-- Search Button -->
    <button
      type="submit"
      disabled={!term.trim() || isLoading}
      class="m-2 px-8 py-3 bg-sky-500 text-white rounded-full hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 font-medium"
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
</form>
