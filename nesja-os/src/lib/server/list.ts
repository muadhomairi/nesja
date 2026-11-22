/** Shared helpers for list pages: safe text search and paging from URL params. */
export type ListParams = { q?: string; page?: string; [k: string]: string | undefined };
export const PAGE = 50;
export function paging(sp: ListParams) { const p = Math.max(1, Math.min(1000, Number(sp.page) || 1)); return { limit: PAGE, offset: (p - 1) * PAGE, page: p }; }
export const like = (q?: string) => (q ? `%${q.slice(0, 100).replace(/[%_\\]/g, (c) => `\\${c}`)}%` : null);
