<script lang="ts">
	import { onMount } from 'svelte';
	import SearchBar from '$lib/components/SearchBar.svelte';
	import ResultCard from '$lib/components/ResultCard.svelte';
	import RelatedVideoCard from '$lib/components/RelatedVideoCard.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import CarouselNavigation from '$lib/components/CarouselNavigation.svelte';
	import StackedVideoCarousel from '$lib/components/StackedVideoCarousel.svelte';
	import { searchVideos, type SearchResponse, type VideoResult } from '$lib/api';
	import { asset } from '$app/paths';

	let searchQuery = '';
	let searchInputValue = ''; // Reactive value for search input
	let searchResults: VideoResult[] = [];
	let relatedContent: any[] = [];
	let isLoading = false;
	let hasSearched = false;
	let totalResults = 0;
	let currentResultIndex = 0;
	let shrinkHeader = false;
	let scrollTimeout: number | undefined;
	let showRelated = false;

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
			currentResultIndex = 0; // Reset to first result
		} catch (error) {
			console.error('Search failed:', error);
			searchResults = [];
			relatedContent = [];
			totalResults = 0;
			currentResultIndex = 0;
		} finally {
			isLoading = false;
		}
	}

	// Carousel navigation functions
	function nextResult() {
		if (currentResultIndex < searchResults.length - 1) {
			currentResultIndex++;
		}
	}

	function previousResult() {
		if (currentResultIndex > 0) {
			currentResultIndex--;
		}
	}

	// Event handlers for components
	function handleChapterClick(event: CustomEvent) {
		console.log('Chapter clicked:', event.detail);
		// TODO: Implement chapter navigation functionality
	}

	function handleMoreClick(event: CustomEvent) {
		console.log('More from sermon clicked:', event.detail);
		// TODO: Implement more from sermon functionality
	}

	function handleClearSearch() {
		searchQuery = '';
		searchInputValue = '';
		searchResults = [];
		relatedContent = [];
		hasSearched = false;
		currentResultIndex = 0;
	}

	function handleSuggestionClick(suggestion: string) {
		searchInputValue = suggestion;
		handleSearch(suggestion);
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
			handleClearSearch();
		}

		// Navigate carousel with arrow keys
		if (hasSearched && searchResults.length > 1) {
			if (e.key === 'ArrowLeft') {
				e.preventDefault();
				previousResult();
			} else if (e.key === 'ArrowRight') {
				e.preventDefault();
				nextResult();
			}
		}
	}

	function handleHeaderScroll() {
		// Debounce scroll event to prevent rapid toggling
		if (scrollTimeout) {
			clearTimeout(scrollTimeout);
		}
		scrollTimeout = window.setTimeout(() => {
			// Standard scroll-based shrink with hysteresis
			if (!shrinkHeader && window.scrollY > 50) {
				shrinkHeader = true;
			} else if (shrinkHeader && window.scrollY < 20) {
				shrinkHeader = false;
			}
		}, 50);
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
		window.addEventListener('scroll', handleHeaderScroll);
		handleHeaderScroll();

		return () => {
			document.removeEventListener('keydown', handleKeydown);
			window.removeEventListener('scroll', handleHeaderScroll);
		};
	});
</script>

<svelte:head>
	<title>Sermon Search - Ask Questions About Faith</title>
	<meta
		name="description"
		content="Ask questions about faith and discover sermons that provide biblical answers"
	/>
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<!-- Header with Search -->
	<header class="sticky top-0 z-30 border-b border-gray-100 bg-white transition-all duration-300">
		<div
			class="mx-auto max-w-4xl px-4 transition-all duration-300 {shrinkHeader
				? 'pt-4 pb-4'
				: 'pt-8 pb-12'}"
		>
			<div class="text-center transition-all duration-300 {shrinkHeader ? 'mb-2' : 'mb-8'}">
				<img
					src={asset('/logo.png')}
					alt="Real Life Logo"
					class="mx-auto cursor-pointer transition-all duration-300 {shrinkHeader
						? 'mb-2 h-5'
						: 'mb-4 h-10'}"
					on:click={() => {
						searchInputValue = '';
						hasSearched = false;
					}}
				/>
				{#if !hasSearched}
					<p
						class="mx-auto max-w-2xl leading-relaxed text-gray-600 transition-all duration-300 {shrinkHeader
							? 'mb-1 text-base'
							: 'mb-4 text-xl'}"
					>
						Ask questions about faith and discover sermons that provide biblical answers. Search
						through chapters to find exactly what you're looking for.
					</p>
				{/if}
			</div>
			<SearchBar
				onSearch={handleSearch}
				{isLoading}
				showCurrentSearch={searchResults.length > 0}
				currentSearchTerm={searchResults.length > 0 ? searchQuery : ''}
				onClear={handleClearSearch}
				bind:value={searchInputValue}
				on:toggleRelated={() => (showRelated = !showRelated)}
			/>
			<!-- Search Suggestions -->
			{#if !hasSearched}
				<div
					class="mt-4 flex flex-wrap justify-center gap-2 transition-opacity duration-300"
					style="opacity: {shrinkHeader ? 0 : 1}; pointer-events: {shrinkHeader
						? 'none'
						: 'auto'}; height: {shrinkHeader ? '0px' : 'auto'}; overflow: hidden;"
				>
					{#each ['How do I find purpose in life?', 'What does the Bible say about forgiveness?', 'How to deal with anxiety and fear?', 'Building stronger relationships', "Understanding God's love"] as suggestion}
						<button
							class="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600 transition-colors duration-200 hover:bg-gray-200"
							on:click={() => handleSuggestionClick(suggestion)}
						>
							{suggestion}
						</button>
					{/each}
				</div>
			{/if}
		</div>
	</header>

	<!-- Main Content -->
	<main class="mx-auto max-w-7xl px-4 py-8">
		{#if isLoading}
			<!-- Loading State -->
			<div class="animate-fadeInUp flex flex-col items-center justify-center py-16">
				<div class="relative">
					<div class="h-16 w-16 animate-spin rounded-full border-4 border-primary-200"></div>
					<div
						class="absolute top-0 left-0 h-16 w-16 animate-spin rounded-full border-4 border-primary-600 border-t-transparent"
					></div>
				</div>
				<div class="mt-6 text-center">
					<h3 class="mb-2 text-lg font-medium text-zinc-700">Searching sermons...</h3>
					<p class="animate-pulse-soft text-sm text-gray-500">
						Finding the most relevant content for you
					</p>
				</div>
			</div>
		{:else if hasSearched && searchResults.length === 0}
			<!-- No Results -->
			<div class="animate-fadeInUp py-8 text-center">
				<div class="mx-auto max-w-md">
					<div class="mb-4 text-6xl">🔍</div>
					<h3 class="mb-2 text-xl font-semibold text-zinc-700">No results found</h3>
					<p class="mb-4 text-gray-500">
						We couldn't find any sermons matching "{searchQuery}"
					</p>
					<div class="rounded-lg bg-primary-50 p-4 text-left">
						<h4 class="mb-2 font-medium text-primary-900">Try searching for:</h4>
						<ul class="space-y-1 text-sm text-primary-700">
							<li>• Bible book names (e.g., "Matthew", "Psalms")</li>
							<li>• Topics (e.g., "faith", "love", "forgiveness")</li>
							<li>• Keywords from sermon titles</li>
						</ul>
					</div>
					<p class="mt-4 text-gray-500">
						If you want to talk directly to church staff or have more personal questions, please
						reach out to your church—they would love to connect and support you.
					</p>
				</div>
			</div>
		{:else if hasSearched && searchResults.length > 0}
			<!-- Search Results Carousel -->
			<div class="animate-fadeInUp">
				<!-- Carousel Navigation -->
				<CarouselNavigation
					currentIndex={currentResultIndex}
					totalItems={searchResults.length}
					itemLabel="sermons"
					on:previous={previousResult}
					on:next={nextResult}
				/>

				<!-- Current Result -->
				{#if searchResults.length > 0}
					<StackedVideoCarousel
						sermons={searchResults}
						currentIndex={currentResultIndex}
						on:chapterClick={handleChapterClick}
						on:moreClick={handleMoreClick}
					/>
				{/if}

				<!-- Related Content Section -->
				{#if relatedContent.length > 0 && showRelated}
					<section class="animate-fadeInUp mt-16" style="animation-delay: 0.3s">
						<div class="mb-8 text-center">
							<h3 class="mb-2 text-2xl font-bold text-zinc-700">
								Related answers from other churches
							</h3>
							<p class="text-gray-600">Discover more sermons on similar topics</p>
						</div>
						<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
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
			<div class="py-16">
				<div class="mx-auto max-w-7xl">
					<!-- Features Grid -->
					<div class="mb-20 grid grid-cols-1 gap-8 md:grid-cols-3">
						<div class="rounded-2xl bg-white p-8 text-center shadow-sm">
							<div
								class="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-400"
							>
								<svg
									class="h-8 w-8 text-white"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
									/>
								</svg>
							</div>
							<h3 class="mb-4 text-xl font-bold text-zinc-700">Smart Search</h3>
							<p class="leading-relaxed text-gray-600">
								Ask natural questions about faith and get relevant sermon chapters that address your
								specific concerns.
							</p>
						</div>

						<div class="rounded-2xl bg-white p-8 text-center shadow-sm">
							<div
								class="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-400"
							>
								<svg
									class="h-8 w-8 text-white"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
									/>
								</svg>
							</div>
							<h3 class="mb-4 text-xl font-bold text-zinc-700">Chapter Navigation</h3>
							<p class="leading-relaxed text-gray-600">
								Browse through sermon chapters with summaries to find the exact teaching that
								answers your question.
							</p>
						</div>

						<div class="rounded-2xl bg-white p-8 text-center shadow-sm">
							<div
								class="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-400"
							>
								<svg
									class="h-8 w-8 text-white"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M13 10V3L4 14h7v7l9-11h-7z"
									/>
								</svg>
							</div>
							<h3 class="mb-4 text-xl font-bold text-zinc-700">Instant Results</h3>
							<p class="leading-relaxed text-gray-600">
								Get relevance scores and highlighted chapters that best match your search query with
								direct video links.
							</p>
						</div>
					</div>

					<!-- Popular Questions Section -->
					<div class="mb-12 text-center">
						<h2 class="mb-4 text-3xl font-bold text-zinc-700">Try These Popular Questions</h2>
						<p class="text-lg text-gray-600">Get started with these common faith-based questions</p>
					</div>

					<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
						<button
							class="rounded-xl bg-white p-6 text-left shadow-sm transition-shadow hover:shadow-md"
							on:click={() => handleSuggestionClick('How do I find purpose in life?')}
						>
							<h3 class="mb-2 text-lg font-semibold text-zinc-700">
								How do I find purpose in life?
							</h3>
							<p class="text-sm text-gray-600">
								Discover God's calling and live with intentionality
							</p>
						</button>

						<button
							class="rounded-xl bg-white p-6 text-left shadow-sm transition-shadow hover:shadow-md"
							on:click={() => handleSuggestionClick('What does the Bible say about forgiveness?')}
						>
							<h3 class="mb-2 text-lg font-semibold text-zinc-700">
								What does the Bible say about forgiveness?
							</h3>
							<p class="text-sm text-gray-600">Learn about biblical forgiveness and healing</p>
						</button>

						<button
							class="rounded-xl bg-white p-6 text-left shadow-sm transition-shadow hover:shadow-md"
							on:click={() => handleSuggestionClick('How to deal with anxiety and fear?')}
						>
							<h3 class="mb-2 text-lg font-semibold text-zinc-700">
								How to deal with anxiety and fear?
							</h3>
							<p class="text-sm text-gray-600">Find peace through faith and biblical tools</p>
						</button>

						<button
							class="rounded-xl bg-white p-6 text-left shadow-sm transition-shadow hover:shadow-md"
							on:click={() => handleSuggestionClick('Building stronger relationships')}
						>
							<h3 class="mb-2 text-lg font-semibold text-zinc-700">
								Building stronger relationships
							</h3>
							<p class="text-sm text-gray-600">Create God-centered connections with others</p>
						</button>
					</div>
				</div>
			</div>
		{/if}
	</main>
</div>

<!-- Modal Component -->
<Modal />
