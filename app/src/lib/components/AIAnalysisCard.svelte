<script lang="ts">
	import type { AIAnalysis } from '$lib/types';

	export let analysis: AIAnalysis;

	$: confidenceColor =
		analysis.confidence >= 80
			? 'text-green-600'
			: analysis.confidence >= 60
				? 'text-yellow-600'
				: 'text-red-600';

	$: confidenceIcon = analysis.confidence >= 80 ? '✅' : analysis.confidence >= 60 ? '⚠️' : '❌';
</script>

{#if analysis.answersQuestion}
	<div class="mb-6 rounded-xl border border-sky-200 bg-gradient-to-r from-sky-50 to-blue-50 p-6">
		<div class="mb-4 flex items-start gap-3">
			<div class="text-2xl">🎯</div>
			<div class="flex-1">
				<h3 class="mb-1 text-lg font-semibold text-sky-900">
					AI Analysis: This sermon addresses your question
				</h3>
				<div class="flex items-center gap-2 text-sm text-sky-700">
					<span class={confidenceColor}>{confidenceIcon}</span>
					<span>Confidence: {analysis.confidence}%</span>
				</div>
			</div>
		</div>

		{#if analysis.bestAnswer}
			<div class="mb-4">
				<h4 class="mb-2 font-medium text-sky-900">Key Answer:</h4>
				<div class="rounded-lg border border-sky-100 bg-white p-4">
					<p class="text-gray-800 italic">"{analysis.bestAnswer}"</p>
				</div>
			</div>
		{/if}

		{#if analysis.relevantExcerpts.length > 0}
			<div class="mb-4">
				<h4 class="mb-2 font-medium text-sky-900">Relevant Excerpts:</h4>
				<div class="space-y-2">
					{#each analysis.relevantExcerpts as excerpt, index}
						<div class="rounded-lg border border-sky-100 bg-white p-3">
							<p class="text-sm text-gray-700">"{excerpt}"</p>
						</div>
					{/each}
				</div>
			</div>
		{/if}

		{#if analysis.reasoning}
			<div class="text-sm text-sky-700">
				<strong>Why this sermon is relevant:</strong>
				{analysis.reasoning}
			</div>
		{/if}
	</div>
{:else}
	<div class="mb-6 rounded-xl border border-gray-200 bg-gray-50 p-6">
		<div class="flex items-start gap-3">
			<div class="text-2xl">🤔</div>
			<div class="flex-1">
				<h3 class="mb-1 text-lg font-medium text-gray-700">Limited relevance to your question</h3>
				<div class="mb-3 flex items-center gap-2 text-sm text-gray-600">
					<span class={confidenceColor}>{confidenceIcon}</span>
					<span>Confidence: {analysis.confidence}%</span>
				</div>
				{#if analysis.reasoning}
					<p class="text-sm text-gray-600">{analysis.reasoning}</p>
				{/if}
			</div>
		</div>
	</div>
{/if}
