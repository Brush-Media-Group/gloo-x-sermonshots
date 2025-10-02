<script lang="ts">
  import type { AIAnalysis } from '$lib/types';

  export let analysis: AIAnalysis;

  $: confidenceColor = analysis.confidence >= 80 ? 'text-green-600' : 
                      analysis.confidence >= 60 ? 'text-yellow-600' : 
                      'text-red-600';

  $: confidenceIcon = analysis.confidence >= 80 ? '✅' : 
                     analysis.confidence >= 60 ? '⚠️' : 
                     '❌';
</script>

{#if analysis.answersQuestion}
  <div class="bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-200 rounded-xl p-6 mb-6">
    <div class="flex items-start gap-3 mb-4">
      <div class="text-2xl">🎯</div>
      <div class="flex-1">
        <h3 class="text-lg font-semibold text-sky-900 mb-1">
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
        <h4 class="font-medium text-sky-900 mb-2">Key Answer:</h4>
        <div class="bg-white rounded-lg p-4 border border-sky-100">
          <p class="text-gray-800 italic">"{analysis.bestAnswer}"</p>
        </div>
      </div>
    {/if}

    {#if analysis.relevantExcerpts.length > 0}
      <div class="mb-4">
        <h4 class="font-medium text-sky-900 mb-2">Relevant Excerpts:</h4>
        <div class="space-y-2">
          {#each analysis.relevantExcerpts as excerpt, index}
            <div class="bg-white rounded-lg p-3 border border-sky-100">
              <p class="text-sm text-gray-700">"{excerpt}"</p>
            </div>
          {/each}
        </div>
      </div>
    {/if}

    {#if analysis.reasoning}
      <div class="text-sm text-sky-700">
        <strong>Why this sermon is relevant:</strong> {analysis.reasoning}
      </div>
    {/if}
  </div>
{:else}
  <div class="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-6">
    <div class="flex items-start gap-3">
      <div class="text-2xl">🤔</div>
      <div class="flex-1">
        <h3 class="text-lg font-medium text-gray-700 mb-1">
          Limited relevance to your question
        </h3>
        <div class="flex items-center gap-2 text-sm text-gray-600 mb-3">
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
