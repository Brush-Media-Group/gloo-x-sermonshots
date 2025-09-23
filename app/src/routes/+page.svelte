<script lang="ts">
  import { onMount } from 'svelte';
  import SearchBar from '$lib/components/SearchBar.svelte';
  import ResultCard from '$lib/components/ResultCard.svelte';
  import RelatedVideoCard from '$lib/components/RelatedVideoCard.svelte';
  import { searchVideos, type SearchResponse, type VideoResult } from '$lib/api';

  let searchQuery = '';
  let searchResults: VideoResult[] = [];
  let relatedContent: any[] = [];
  let isLoading = false;
  let hasSearched = false;
  let totalResults = 0;

  async function handleSearch(query: string) {
    if (!query.trim()) return;
    
    isLoading = true;
    searchQuery = query;
    hasSearched = true;
    
    try {
      const response: SearchResponse = await searchVideos(query);
      searchResults = response.results;
      relatedContent = response.relatedContent;
      totalResults = response.totalResults;
    } catch (error) {
      console.error('Search failed:', error);
      searchResults = [];
      relatedContent = [];
      totalResults = 0;
    } finally {
      isLoading = false;
    }
  }

  // Keyboard shortcuts
  function handleKeydown(e: KeyboardEvent) {
    // Focus search bar with Ctrl+K or Cmd+K
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
      searchInput?.focus();
    }
    
    // Clear search with Escape
    if (e.key === 'Escape' && hasSearched) {
      searchQuery = '';
      searchResults = [];
      relatedContent = [];
      hasSearched = false;
      totalResults = 0;
    }
  }

  // Optional: Load some initial content or handle URL params
  onMount(() => {
    // You could check for URL search params here
    const urlParams = new URLSearchParams(window.location.search);
    const initialQuery = urlParams.get('q');
    if (initialQuery) {
      handleSearch(initialQuery);
    }

    // Add global keyboard event listener
    document.addEventListener('keydown', handleKeydown);
    
    return () => {
      document.removeEventListener('keydown', handleKeydown);
    };
  });
</script>

<svelte:head>
  <title>Video Search - Find Sermon Content</title>
  <meta name="description" content="Search through sermon videos and find specific content with chapters and transcripts" />
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
  <!-- Header with Search -->
  <header class="bg-white/80 backdrop-blur-sm shadow-sm border-b border-white/20 sticky top-0 z-10">
    <div class="max-w-6xl mx-auto px-4 py-6">
      <div class="text-center mb-6">
        <h1 class="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
          Sermon Video Search
        </h1>
        <p class="text-gray-600 text-sm">
          Discover meaningful content across our sermon library
        </p>
      </div>
      <SearchBar 
        value={searchQuery} 
        onSearch={handleSearch}
        {isLoading}
      />
    </div>
  </header>

  <!-- Main Content -->
  <main class="max-w-6xl mx-auto px-4 py-8">
    {#if isLoading}
      <!-- Loading State -->
      <div class="flex flex-col justify-center items-center py-16 animate-fadeInUp">
        <div class="relative">
          <div class="animate-spin rounded-full h-16 w-16 border-4 border-blue-200"></div>
          <div class="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent absolute top-0 left-0"></div>
        </div>
        <div class="mt-6 text-center">
          <h3 class="text-lg font-medium text-gray-900 mb-2">Searching sermons...</h3>
          <p class="text-gray-500 text-sm animate-pulse-soft">
            Finding the most relevant content for you
          </p>
        </div>
      </div>
    {:else if hasSearched && searchResults.length === 0}
      <!-- No Results -->
      <div class="text-center py-16 animate-fadeInUp">
        <div class="max-w-md mx-auto">
          <div class="text-6xl mb-4">🔍</div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">
            No results found
          </h3>
          <p class="text-gray-500 mb-4">
            We couldn't find any sermons matching "{searchQuery}"
          </p>
          <div class="bg-blue-50 rounded-lg p-4 text-left">
            <h4 class="font-medium text-blue-900 mb-2">Try searching for:</h4>
            <ul class="text-sm text-blue-700 space-y-1">
              <li>• Bible book names (e.g., "Matthew", "Psalms")</li>
              <li>• Topics (e.g., "faith", "love", "forgiveness")</li>
              <li>• Keywords from sermon titles</li>
            </ul>
          </div>
        </div>
      </div>
    {:else if hasSearched && searchResults.length > 0}
      <!-- Search Results -->
      <div class="space-y-8 animate-fadeInUp">
        <!-- Results Header -->
        <div class="flex items-center justify-between bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/40">
          <h2 class="text-xl font-semibold text-gray-800">
            Results for "<span class="text-blue-600">{searchQuery}</span>"
          </h2>
          <div class="flex items-center gap-2">
            <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span class="text-sm text-gray-600 font-medium">
              {totalResults} result{totalResults !== 1 ? 's' : ''} found
            </span>
          </div>
        </div>

        <!-- Results List -->
        <div class="space-y-8">
          {#each searchResults as result, index}
            <div class="animate-fadeInUp" style="animation-delay: {index * 0.1}s">
              <ResultCard {result} />
            </div>
          {/each}
        </div>

        <!-- Related Content Section -->
        {#if relatedContent.length > 0}
          <section class="mt-16 animate-fadeInUp" style="animation-delay: 0.3s">
            <div class="text-center mb-8">
              <h3 class="text-2xl font-bold text-gray-900 mb-2">
                Related Content from other churches
              </h3>
              <p class="text-gray-600">
                Discover more sermons on similar topics
              </p>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {#each relatedContent as video, index}
                <div class="animate-fadeInUp" style="animation-delay: {0.4 + index * 0.1}s">
                  <RelatedVideoCard {video} />
                </div>
              {/each}
            </div>
          </section>
        {/if}
      </div>
    {:else}
      <!-- Welcome State -->
      <div class="text-center py-20 animate-fadeInUp">
        <div class="max-w-4xl mx-auto">
          <!-- Hero Section -->
          <div class="mb-16">
            <div class="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-6 shadow-lg">
              <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h2 class="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-6">
              Discover Sermon Content
            </h2>
            <p class="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Search through our comprehensive sermon library to find specific topics, Bible verses, and spiritual insights. 
              Every video includes timestamped chapters and full transcripts for easy navigation.
            </p>
            
            <!-- Quick Search Suggestions -->
            <div class="flex flex-wrap justify-center gap-3 mb-12">
              <span class="text-sm text-gray-500 mr-2">Popular searches:</span>
              {#each ['Faith', 'Hope', 'Love', 'Forgiveness', 'Prayer'] as suggestion}
                <button 
                  class="px-4 py-2 bg-white/60 backdrop-blur-sm border border-white/40 rounded-full text-sm text-gray-700 hover:bg-white/80 hover:border-blue-300 transition-all duration-200 hover:scale-105"
                  on:click={() => handleSearch(suggestion)}
                >
                  {suggestion}
                </button>
              {/each}
            </div>
          </div>

          <!-- Features Grid -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <div class="group bg-white/60 backdrop-blur-sm p-8 rounded-2xl shadow-sm border border-white/40 hover:shadow-lg hover:scale-105 transition-all duration-300">
              <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 class="text-lg font-bold text-gray-900 mb-3">Smart Search</h3>
              <p class="text-gray-600 leading-relaxed">
                Search through full transcripts and find exact moments in videos. Our intelligent search understands context and meaning.
              </p>
            </div>

            <div class="group bg-white/60 backdrop-blur-sm p-8 rounded-2xl shadow-sm border border-white/40 hover:shadow-lg hover:scale-105 transition-all duration-300">
              <div class="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 class="text-lg font-bold text-gray-900 mb-3">Chapter Navigation</h3>
              <p class="text-gray-600 leading-relaxed">
                Jump to specific sections with timestamped chapters. Each chapter includes summaries and key points for quick reference.
              </p>
            </div>

            <div class="group bg-white/60 backdrop-blur-sm p-8 rounded-2xl shadow-sm border border-white/40 hover:shadow-lg hover:scale-105 transition-all duration-300">
              <div class="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m-6-8h8a2 2 0 012 2v8a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2z" />
                </svg>
              </div>
              <h3 class="text-lg font-bold text-gray-900 mb-3">Interactive Playback</h3>
              <p class="text-gray-600 leading-relaxed">
                Watch videos with synchronized transcripts and interactive chapters. Pause, rewind, and explore content at your own pace.
              </p>
            </div>
          </div>

          <!-- Call to Action -->
          <div class="mt-16 p-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
            <h3 class="text-xl font-bold text-gray-900 mb-3">Ready to explore?</h3>
            <p class="text-gray-600 mb-4">
              Start by searching for a topic, Bible verse, or keyword in the search bar above.
            </p>
            <div class="text-sm text-gray-500">
              💡 Tip: Try searching for specific Bible books like "Romans" or topics like "salvation"
            </div>
          </div>
        </div>
      </div>
    {/if}
  </main>
</div>
