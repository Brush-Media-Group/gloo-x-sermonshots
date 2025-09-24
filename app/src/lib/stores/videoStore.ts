import { writable } from 'svelte/store';

// Store to track all video elements on the page
export const videoElements = writable<Set<HTMLVideoElement>>(new Set());

// Function to pause all videos except the specified one
export function pauseAllVideosExcept(exceptVideo?: HTMLVideoElement) {
  videoElements.update(videos => {
    videos.forEach(video => {
      if (video !== exceptVideo && !video.paused) {
        video.pause();
      }
    });
    return videos;
  });
}

// Function to register a video element
export function registerVideo(video: HTMLVideoElement) {
  videoElements.update(videos => {
    videos.add(video);
    return videos;
  });
}

// Function to unregister a video element
export function unregisterVideo(video: HTMLVideoElement) {
  videoElements.update(videos => {
    videos.delete(video);
    return videos;
  });
}
