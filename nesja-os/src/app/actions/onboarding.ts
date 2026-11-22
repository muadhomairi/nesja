"use server";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireOrg } from "@/lib/server/session";
import { dbErrorMessage, withUser } from "@/lib/server/db";
import type { FormState } from "./validation";

export async function configureAction(_: FormState, form: FormData): Promise<FormState> {
  const s = await requireOrg("admin.tenant");
  const units = String(form.get("units") ?? "").split(/\r?\n|,/).map((u) => u.trim()).filter(Boolean).slice(0, 30);
  const tz = String(form.get("time_zone") ?? "UTC").slice(0, 60);
  const margin = z.coerce.number().min(0).max(0.9).safeParse(Number(form.get("target_margin") ?? 25) / 100);
  if (!margin.success) return { ok: false, message: "Target margin must be between 0 and 90%." };
  try {
    await withUser(s.userId, async (db) => {
      await db.query("update public.tenants set time_zone = $2 where id = $1", [s.org.id, tz]);
      for (const u of units) await db.query("insert into public.business_units(tenant_id, name) values ($1, $2) on conflict do nothing", [s.org.id, u]);
      await db.query(`insert into public.rate_cards(tenant_id, name, currency, valid_from, target_margin)
        values ($1, 'Standard rate card', $2, current_date, $3) on conflict (tenant_id, name) do update set target_margin = excluded.target_margin`, [s.org.id, s.org.base_currency, margin.data.toFixed(4)]);
    });
  } catch (e) { return { ok: false, message: dbErrorMessage(e) }; }
  redirect("/onboarding?step=team");
}

/** CSV import of accounts: number,name,industry,country. Validated row by row; nothing partial is saved. */
export async function importAccountsAction(_: FormState, form: FormData): Promise<FormState> {
  const s = await requireOrg("data.import");
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) return { ok: false, message: "Choose a CSV file." };
  if (file.size > 2_000_000) return { ok: false, message: "The file is larger than 2 MB. Split it into smaller files." };
  const text = await file.text();
  const rows = text.split(/\r?\n/).filter((l) => l.trim()).map((l) => l.split(",").map((c) => c.trim().replace(/^"|"$/g, "")));
  const [head, ...data] = rows;
  if (!head || head[0]?.toLowerCase() !== "number" || head[1]?.toLowerCase() !== "name") return { ok: false, message: "The first row must be: number,name,industry,country" };
  const errors: string[] = [];
  const clean = data.map((r, i) => {
    if (!r[0] || !r[1]) errors.push(`Row ${i + 2}: number and name are required`);
    if (r[3] && !/^[A-Za-z]{2}$/.test(r[3])) errors.push(`Row ${i + 2}: country must be a 2-letter code`);
    return { number: r[0]?.slice(0, 40), name: r[1]?.slice(0, 300), industry: r[2]?.slice(0, 100) || null, country: r[3]?.toUpperCase() || null };
  });
  if (errors.length) return { ok: false, message: errors.slice(0, 5).join(". ") + (errors.length > 5 ? ` (+${errors.length - 5} more)` : "") };
  if (clean.length > 5000) return { ok: false, message: "At most 5,000 rows per import." };
  try {
    await withUser(s.userId, async (db) => {
      for (const r of clean) await db.query("insert into public.accounts(tenant_id, number, name, industry, country, owner_id) values ($1,$2,$3,$4,$5, auth.uid())", [s.org.id, r.number, r.name, r.industry, r.country]);
    });
  } catch (e) { return { ok: false, message: dbErrorMessage(e) }; }
  return { ok: true, message: `Imported ${clean.length} accounts.` };
}
