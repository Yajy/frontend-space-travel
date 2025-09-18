import { writable } from "svelte/store";

export const passengerCount = writable<number>(1); // default = 1
