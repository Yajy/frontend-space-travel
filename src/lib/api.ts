import { error } from "@sveltejs/kit";

export async function safeFetch<T = any>(url: string, options: RequestInit = {}): Promise<T> {
  try {
    const res = await fetch(url, options);

    if (!res.ok) {
      throw error(res.status, res.statusText || "Something went wrong");
    }

    return await res.json();
  } catch (err) {
    throw error(500, "Backend not reachable. Please try again later.");
  }
}
