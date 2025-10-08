<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let currentIndex: number = 0;
	export let totalItems: number = 0;
	export let itemLabel: string = 'items';

	const dispatch = createEventDispatcher();

	function handlePrevious() {
		if (currentIndex > 0) {
			dispatch('previous');
		}
	}

	function handleNext() {
		if (currentIndex < totalItems - 1) {
			dispatch('next');
		}
	}
</script>

<div class="mb-8 flex items-center justify-center">
	<button
		class="rounded-full bg-gray-800 p-2 text-white transition-all duration-200 hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
		on:click={handlePrevious}
		disabled={currentIndex === 0}
		aria-label="Previous {itemLabel}"
	>
		<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
		</svg>
	</button>

	<div class="mx-6 text-center">
		<span class="font-medium text-gray-600">
			{currentIndex + 1} of {totalItems}
			{itemLabel}
		</span>
	</div>

	<button
		class="rounded-full bg-gray-800 p-2 text-white transition-all duration-200 hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
		on:click={handleNext}
		disabled={currentIndex === totalItems - 1}
		aria-label="Next {itemLabel}"
	>
		<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
		</svg>
	</button>
</div>
