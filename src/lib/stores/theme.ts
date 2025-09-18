import { writable } from "svelte/store";

let initialTheme: "light" | "dark" = "light";

if (typeof localStorage !== "undefined") {
  const stored = localStorage.getItem("theme");
  if (stored === "dark" || stored === "light") {
    initialTheme = stored;
  }
}

export const theme = writable<"light" | "dark">(initialTheme);

theme.subscribe((value) => {
  if (typeof document !== "undefined") {
    document.documentElement.setAttribute("data-theme", value);
    localStorage.setItem("theme", value);
  }
});
