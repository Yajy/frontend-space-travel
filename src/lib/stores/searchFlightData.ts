import { writable } from "svelte/store";

export const searchFlightData = writable<string | null>(null);