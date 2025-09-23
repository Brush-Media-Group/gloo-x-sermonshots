<script lang="ts">
  export let value = '';
  export let onSearch: (query: string) => void = () => {};
  export let placeholder = 'Search sermons, topics, or keywords...';
  export let isLoading = false;
  
  let term = value;
  let inputRef: HTMLInputElement;

  function handleSubmit(e: Event) {
    e.preventDefault();
    if (term.trim() && !isLoading) {
      onSearch(term.trim());
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !isLoading) {
      handleSubmit(e);
    }
  }

  function clearSearch() {
    term = '';
    inputRef?.focus();
  }

  // Update internal term when external value changes
  $: if (value !== term) {
    term = value;
  }
</script>

<form on:submit={handleSubmit} class="w-full max-w-3xl mx-auto">
  <div class="relative flex items-center bg-white rounded-xl shadow-lg border border-gray-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 transition-all duration-200">
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
      class="flex-1 py-4 px-2 bg-transparent border-none outline-none text-gray-900 placeholder-gray-500 disabled:opacity-50"
      autocomplete="off"
      spellcheck="false"
    />

    <!-- Clear Button -->
    {#if term}
      <button
        type="button"
        on:click={clearSearch}
        class="p-2 text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="Clear search"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    {/if}

    <!-- Search Button -->
    <button
      type="submit"
      disabled={!term.trim() || isLoading}
      class="m-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
    >
      {#if isLoading}
        <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span class="hidden sm:inline">Searching...</span>
      {:else}
        <span>Search</span>
      {/if}
    </button>
  </div>

  <!-- Search Suggestions/Tips -->
  <div class="mt-3 text-center">
    <p class="text-sm text-gray-500">
      Try searching for topics like "faith", "hope", "forgiveness", or specific Bible verses
    </p>
  </div>
</form>
