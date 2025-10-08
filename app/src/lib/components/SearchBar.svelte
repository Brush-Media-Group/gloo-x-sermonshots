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

<div class="mx-auto w-full max-w-4xl">

	<form on:submit={handleSubmit}>
		<div
			class="relative flex items-center rounded-full border border-gray-200 bg-white shadow-lg transition-all duration-200 focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-sky-100"
		>
			<!-- Search Icon -->
			<div class="pr-2 pl-4">
				<svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
					/>
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
				class="flex-1 border-none bg-transparent text-base text-gray-900 placeholder-gray-500 outline-none disabled:opacity-50"
				autocomplete="off"
				spellcheck="false"
			/>

			<!-- Search Button -->
			<button
				type="submit"
				disabled={!term.trim() || isLoading}
				class="m-2 flex items-center gap-2 rounded-full bg-orange-400 px-8 py-3 font-medium text-white transition-all duration-200 focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
			>
				{#if isLoading}
					<svg class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
						<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
						></circle>
						<path
							class="opacity-75"
							fill="currentColor"
							d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
						></path>
					</svg>
					<span class="hidden sm:inline">Searching...</span>
				{:else}
					<svg class="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M5 3l14 9-14 9V3z"
						/>
					</svg>
					<span>Search</span>
				{/if}
			</button>
		</div>
		<!-- Toggle Related Content (below input) -->
		<div class="mt-2 flex w-full justify-start">
			<label class="ml-4 flex cursor-pointer items-center gap-2 text-xs text-zinc-700 select-none">
				<input
					type="checkbox"
					class="ml-4 h-4 w-4 accent-orange-400"
					on:change={(e) => dispatch('toggleRelated')}
				/>
				Include related answers from other churches
			</label>
		</div>
	</form>
</div>
