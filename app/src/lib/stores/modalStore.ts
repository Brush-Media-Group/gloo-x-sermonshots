import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export interface ModalResult {
  transcription_id: string;
  videoUrl: string;
  text: string;
  title: string;
  chapters: { title: string; summary: string; start: number; end: number; transcript?: string }[];
  thumbnail?: string;
}

// Store to manage modal state
export const isModalOpen = writable<boolean>(false);
export const modalResult = writable<ModalResult | null>(null);

// Functions to control modal
export function openModal(result: ModalResult) {
  modalResult.set(result);
  isModalOpen.set(true);
  // Prevent body scrolling when modal is open (only in browser)
  if (browser) {
    document.body.style.overflow = 'hidden';
  }
}

export function closeModal() {
  isModalOpen.set(false);
  modalResult.set(null);
  // Restore body scrolling (only in browser)
  if (browser) {
    document.body.style.overflow = 'auto';
  }
}
