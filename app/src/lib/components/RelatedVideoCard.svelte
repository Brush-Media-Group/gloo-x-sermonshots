<script lang="ts">
  export let video: {
    id: string;
    title: string;
    snippet: string;
    thumbnail?: string;
    videoUrl?: string;
  };

  function handlePlay() {
    // In a real implementation, this would navigate to the video or open a modal
    console.log('Playing video:', video.id);
  }
</script>

<div class="group bg-white/80 backdrop-blur-sm border border-white/40 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105 overflow-hidden">
  <!-- Video Thumbnail -->
  <div class="relative aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden">
    {#if video.thumbnail}
      <img 
        src={video.thumbnail} 
        alt={video.title}
        class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
      />
    {:else}
      <div class="bg-gradient-to-br from-primary-400 to-secondary-500 w-full h-full flex items-center justify-center">
        <svg class="w-8 h-8 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      </div>
    {/if}
    
    <!-- Play Button Overlay -->
    <button 
      on:click={handlePlay}
      class="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      aria-label="Play video"
    >
      <div class="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-200">
        <svg class="w-5 h-5 text-gray-800 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z"/>
        </svg>
      </div>
    </button>
  </div>

  <!-- Content -->
  <div class="p-4">
    <h4 class="font-semibold text-gray-900 text-sm mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors duration-200">
      {video.title}
    </h4>
    <p class="text-xs text-gray-600 line-clamp-3 leading-relaxed">
      {video.snippet}
    </p>
    
    <!-- Action Button -->
    <button 
      on:click={handlePlay}
      class="mt-3 text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200"
    >
      <span>Watch now</span>
      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
    </button>
  </div>
</div>
