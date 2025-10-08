<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let chapter: {
		title: string;
		summary: string;
		start: number;
		end: number;
		isRelevant?: boolean;
		relevanceScore?: number | null;
	};
	export let clickable: boolean = true;
	export let isActive: boolean = false;

	const dispatch = createEventDispatcher();

	let showFullSummary = false;

	function handleClick() {
		if (clickable) {
			showFullSummary = !showFullSummary;
			dispatch('click', chapter);
		}
	}

	function getShortSummary(summary: string): string {
		const words = summary.split(/\s+/);
		if (words.length <= 15) return summary;
		return words.slice(0, 15).join(' ') + '...';
	}

	function formatTime(milliseconds: number): string {
		const minutes = Math.floor(milliseconds / 60000);
		const seconds = Math.floor((milliseconds % 60000) / 1000);
		return `${minutes}:${seconds.toString().padStart(2, '0')}`;
	}
</script>

{#if clickable}
	<button
		class="relative w-full rounded-lg border p-3 text-left transition-all duration-200
      {isActive
			? chapter.isRelevant
				? 'border-2 border-orange-300 bg-orange-100 shadow-sm'
				: 'border-2 border-orange-300 bg-gray-50 hover:bg-gray-100'
			: chapter.isRelevant
				? 'border-orange-100 bg-orange-100 shadow-sm'
				: 'border-gray-200 bg-gray-50 hover:bg-gray-100'}"
		on:click={handleClick}
	>
		<div class="mb-2 flex items-start justify-between">
			<h4 class="flex-1 text-sm font-medium text-gray-900">
				{chapter.title}
			</h4>
			<span class="rounded px-2 py-1 text-xs text-gray-500">
				<i class="fa-regular fa-clock mr-1"></i>
				{formatTime(chapter.start)}
			</span>
		</div>
		<p class="text-sm text-gray-600">
			{#if showFullSummary}
				{chapter.summary}
			{:else}
				{getShortSummary(chapter.summary)}
			{/if}
		</p>
	</button>
{:else}
	<div class="rounded-lg border border-gray-200 p-4">
		<div class="mb-2 flex items-start justify-between">
			<h4 class="flex-1 pr-4 font-medium text-gray-900">
				{chapter.title}
				{#if chapter.isRelevant}
					<span
						class="ml-2 inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800"
					>
						{chapter.relevanceScore} %
					</span>
				{/if}
			</h4>
			{formatTime(chapter.start)}
		</div>
		<p class="text-sm text-gray-600">{chapter.summary}</p>
	</div>
{/if}
