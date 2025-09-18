import { writable } from "svelte/store";
import { browser } from '$app/environment';

// Get initial value from localStorage if in browser
const getStoredPassengerId = (): string | null => {
  if (browser) {
    const stored = localStorage.getItem('passengerId');
    return stored ? stored : null;
  }
  return null;
};

// Create the store with initial value from localStorage
export const passengerId = writable<string | null>(getStoredPassengerId());

// Subscribe to store changes and persist to localStorage
if (browser) {
  passengerId.subscribe((value) => {
    if (value) {
      localStorage.setItem('passengerId', value);
    } else {
      localStorage.removeItem('passengerId');
    }
  });
}