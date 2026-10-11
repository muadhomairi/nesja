/** Small typed fetch wrapper for the site's own API routes. */
export type ApiResult<T> = ({ ok: true } & T) | { ok: false; error: string; code?: string; fieldErrors?: Record<string, string> };

export async function postJson<T>(url: string, body: unknown): Promise<ApiResult<T>> {
  try {
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await res.json().catch(() => ({ ok: false, error: "Unexpected response from the server." }));
    return data as ApiResult<T>;
  } catch {
    return { ok: false, error: "You appear to be offline. Check your connection and try again." };
  }
}
