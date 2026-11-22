"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireOrg } from "@/lib/server/session";
import { dbErrorMessage, one, withUser } from "@/lib/server/db";
import type { FormState } from "./validation";

const uuid = z.string().uuid();
const STAGE_PROB: Record<string, number> = { prospecting: 10, qualification: 20, solution: 40, proposal: 60, negotiation: 80, closed_won: 100, closed_lost: 0 };

async function nextNumber(db: import("pg").PoolClient, tenant: string, table: "opportunities" | "quotes" | "accounts" | "leads", prefix: string) {
  const r = await one<{ n: number }>(db, `select count(*)::int + 1 as n from public.${table} where tenant_id = $1`, [tenant]);
  return `${prefix}${String(r!.n).padStart(5, "0")}`;
}

export async function createOpportunity(_: FormState, form: FormData): Promise<FormState> {
  const s = await requireOrg("opportunity.create");
  const p = z.object({ name: z.string().trim().min(2).max(300), account_id: uuid, term_months: z.coerce.number().int().min(1).max(120), expected_close: z.string().date(),
    revenue_type: z.enum(["new_business", "expansion", "renewal"]), tcv: z.string().regex(/^\d{1,15}(\.\d{1,2})?$/, "TCV must be an amount like 120000.00") })
    .safeParse(Object.fromEntries(form));
  if (!p.success) return { ok: false, message: p.error.issues[0].message };
  let id = "";
  try {
    id = (await withUser(s.userId, async (db) => one<{ id: string }>(db, `insert into public.opportunities(tenant_id, number, name, account_id, term_months, expected_close, revenue_type, tcv, owner_id)
      values ($1, $2, $3, $4, $5, $6, $7, $8, auth.uid()) returning id`, [s.org.id, await nextNumber(db, s.org.id, "opportunities", "OPP-"), p.data.name, p.data.account_id, p.data.term_months, p.data.expected_close, p.data.revenue_type, p.data.tcv])))!.id;
  } catch (e) { return { ok: false, message: dbErrorMessage(e) }; }
  redirect(`/commercial/opportunities/${id}`);
}

export async function changeStage(oppId: string, stage: string, lossReason?: string): Promise<string | null> {
  const s = await requireOrg("opportunity.edit");
  if (!uuid.safeParse(oppId).success || !(stage in STAGE_PROB)) return "Invalid request";
  try {
    await withUser(s.userId, async (db) => {
      if (stage === "closed_won") {
        // Closed Won needs an accepted quote and no pending or rejected approval on it (ported Hub rule).
        const blk = await one<{ accepted: number; open_appr: number }>(db, `select
          (select count(*)::int from public.quotes q where q.tenant_id = $1 and q.opportunity_id = $2 and q.status = 'accepted') as accepted,
          (select count(*)::int from public.approval_requests r join public.quotes q on q.tenant_id = r.tenant_id and q.id = r.entity_id
            where r.tenant_id = $1 and q.opportunity_id = $2 and r.status in ('pending','rejected')) as open_appr`, [s.org.id, oppId]);
        if (!blk?.accepted) throw Object.assign(new Error("Closed Won needs an accepted quotation."), { code: "22023" });
        if (blk.open_appr) throw Object.assign(new Error("Closed Won is blocked until pending approvals are decided."), { code: "22023" });
      }
      const r = await db.query(`update public.opportunities set stage = $3::public.opp_stage, probability = $4, closed_at = case when $3::text in ('closed_won','closed_lost') then now() else null end,
        loss_reason = case when $3::text = 'closed_lost' then $5 else null end where tenant_id = $1 and id = $2`, [s.org.id, oppId, stage, STAGE_PROB[stage], lossReason ?? null]);
      if (!r.rowCount) throw Object.assign(new Error("permission denied"), { code: "42501" });
    });
  } catch (e) { return (e as Error).message && (e as { code?: string }).code === "22023" ? (e as Error).message : dbErrorMessage(e); }
  revalidatePath(`/commercial/opportunities/${oppId}`);
  return null;
}

const line = z.object({ description: z.string().min(1).max(300), pricing_model: z.enum(["one_time", "recurring", "transactional"]),
  quantity: z.string().regex(/^\d{1,12}(\.\d{1,4})?$/), unit_price: z.string().regex(/^\d{1,12}(\.\d{1,4})?$/), unit_cost: z.string().regex(/^\d{1,12}(\.\d{1,4})?$/),
  discount_rate: z.string().regex(/^0(\.\d{1,6})?$/) });

/** Saves a draft quotation (header + lines) for an opportunity, then syncs the opportunity TCV/cost from the quote. */
export async function saveQuote(input: { opportunityId: string; quoteId?: string; termMonths: number; overallDiscountRate: string; mobilisationCost: string; lines: z.infer<typeof line>[] }): Promise<{ id?: string; error?: string }> {
  const s = await requireOrg("quote.create");
  const p = z.object({ opportunityId: uuid, quoteId: uuid.optional(), termMonths: z.number().int().min(1).max(120), overallDiscountRate: z.string().regex(/^0(\.\d{1,6})?$/),
    mobilisationCost: z.string().regex(/^\d{1,12}(\.\d{1,2})?$/), lines: z.array(line).min(1).max(100) }).safeParse(input);
  if (!p.success) return { error: "Check the quotation lines: amounts must be plain numbers and discounts below 100%." };
  const v = p.data;
  try {
    const id = await withUser(s.userId, async (db) => {
      let qid = v.quoteId;
      if (qid) {
        await db.query("update public.quotes set term_months = $3, overall_discount_rate = $4, mobilisation_cost = $5 where tenant_id = $1 and id = $2 and status = 'draft'", [s.org.id, qid, v.termMonths, v.overallDiscountRate, v.mobilisationCost]);
        await db.query("delete from public.quote_lines where tenant_id = $1 and quote_id = $2", [s.org.id, qid]);
      } else {
        qid = (await one<{ id: string }>(db, `insert into public.quotes(tenant_id, number, opportunity_id, term_months, overall_discount_rate, mobilisation_cost, owner_id, valid_until)
          values ($1, $2, $3, $4, $5, $6, auth.uid(), current_date + 30) returning id`, [s.org.id, await nextNumber(db, s.org.id, "quotes", "Q-"), v.opportunityId, v.termMonths, v.overallDiscountRate, v.mobilisationCost]))!.id;
      }
      let pos = 1;
      for (const l of v.lines) await db.query(`insert into public.quote_lines(tenant_id, quote_id, position, description, pricing_model, quantity, unit_price, unit_cost, discount_rate)
        values ($1,$2,$3,$4,$5,$6,$7,$8,$9)`, [s.org.id, qid, pos++, l.description, l.pricing_model, l.quantity, l.unit_price, l.unit_cost, l.discount_rate]);
      await db.query(`update public.opportunities o set tcv = qt.tcv, total_cost = qt.total_cost, term_months = qt.term_months
        from public.quote_totals qt where qt.tenant_id = $1 and qt.quote_id = $2 and o.tenant_id = $1 and o.id = $3`, [s.org.id, qid, v.opportunityId]);
      return qid;
    });
    revalidatePath(`/commercial/opportunities/${v.opportunityId}`);
    return { id };
  } catch (e) { return { error: dbErrorMessage(e) }; }
}

/** Submit: margin below the rate card target raises an approval automatically (segregated: requester ≠ approver). */
export async function submitQuote(quoteId: string): Promise<string | null> {
  const s = await requireOrg("quote.edit");
  if (!uuid.safeParse(quoteId).success) return "Invalid request";
  try {
    await withUser(s.userId, async (db) => {
      const t = await one<{ tcv: string; total_cost: string; target: string | null }>(db, `select qt.tcv, qt.total_cost,
        (select target_margin from public.rate_cards where tenant_id = $1 order by valid_from desc limit 1) as target from public.quote_totals qt where qt.tenant_id = $1 and qt.quote_id = $2`, [s.org.id, quoteId]);
      if (!t) throw Object.assign(new Error("permission denied"), { code: "42501" });
      await db.query("update public.quotes set status = 'submitted' where tenant_id = $1 and id = $2 and status = 'draft'", [s.org.id, quoteId]);
      const gm = await one<{ gm: string | null; below: boolean }>(db, "select case when $1::numeric > 0 then round(($1::numeric - $2::numeric) / $1::numeric, 6) end as gm, ($1::numeric = 0 or ($1::numeric - $2::numeric) / $1::numeric < coalesce($3::numeric, 0.25)) as below", [t.tcv, t.total_cost, t.target]);
      if (gm?.below) await db.query(`insert into public.approval_requests(tenant_id, kind, entity, entity_id, reason, measured_value, threshold_value, requested_by, owner_id)
        values ($1, 'margin', 'quote', $2, 'Gross margin is below the rate card target', $3, $4, auth.uid(), auth.uid())`, [s.org.id, quoteId, gm.gm, t.target ?? "0.25"]);
    });
  } catch (e) { return dbErrorMessage(e); }
  revalidatePath("/commercial/quotes");
  return null;
}

export async function setQuoteStatus(quoteId: string, status: "issued" | "accepted" | "rejected"): Promise<string | null> {
  const s = await requireOrg("quote.edit");
  if (!uuid.safeParse(quoteId).success) return "Invalid request";
  try {
    await withUser(s.userId, async (db) => {
      const pending = await one<{ n: number }>(db, "select count(*)::int as n from public.approval_requests where tenant_id = $1 and entity_id = $2 and status in ('pending','rejected')", [s.org.id, quoteId]);
      if (status !== "rejected" && pending?.n) throw Object.assign(new Error("This quotation has an approval that is pending or rejected."), { code: "22023" });
      await db.query("update public.quotes set status = $3::public.quote_status, issued_at = coalesce(issued_at, case when $3::text = 'issued' then now() end) where tenant_id = $1 and id = $2", [s.org.id, quoteId, status]);
    });
  } catch (e) { return (e as { code?: string }).code === "22023" ? (e as Error).message : dbErrorMessage(e); }
  revalidatePath(`/commercial/quotes/${quoteId}`);
  return null;
}

/** New revision of an issued quote: copies header and lines as Rev n+1 (draft) and supersedes the old one. */
export async function reviseQuote(quoteId: string): Promise<{ id?: string; error?: string }> {
  const s = await requireOrg("quote.create");
  try {
    const id = await withUser(s.userId, async (db) => {
      const q = await one<{ number: string; revision: number }>(db, "select number, revision from public.quotes where tenant_id = $1 and id = $2", [s.org.id, quoteId]);
      if (!q) throw Object.assign(new Error("permission denied"), { code: "42501" });
      const n = (await one<{ id: string }>(db, `insert into public.quotes(tenant_id, number, revision, opportunity_id, currency, term_months, valid_until, overall_discount_rate, mobilisation_cost, owner_id, business_unit_id)
        select tenant_id, number, $3, opportunity_id, currency, term_months, current_date + 30, overall_discount_rate, mobilisation_cost, auth.uid(), business_unit_id from public.quotes where tenant_id = $1 and id = $2 returning id`,
        [s.org.id, quoteId, q.revision + 1]))!.id;
      await db.query(`insert into public.quote_lines(tenant_id, quote_id, position, description, pricing_model, quantity, unit_price, unit_cost, discount_rate, rate_card_item_id)
        select tenant_id, $3, position, description, pricing_model, quantity, unit_price, unit_cost, discount_rate, rate_card_item_id from public.quote_lines where tenant_id = $1 and quote_id = $2`, [s.org.id, quoteId, n]);
      await db.query("update public.quotes set status = 'superseded' where tenant_id = $1 and id = $2", [s.org.id, quoteId]);
      return n;
    });
    return { id };
  } catch (e) { return { error: dbErrorMessage(e) }; }
}

export async function decideApproval(id: string, decision: "approved" | "rejected", note: string): Promise<string | null> {
  const s = await requireOrg("approval.edit");
  if (!uuid.safeParse(id).success) return "Invalid request";
  try {
    const r = await withUser(s.userId, (db) => db.query(`update public.approval_requests set status = $3, approver_id = auth.uid(), decided_at = now(), decision_note = nullif($4, '')
      where tenant_id = $1 and id = $2 and status = 'pending' and requested_by is distinct from auth.uid()`, [s.org.id, id, decision, note.slice(0, 1000)]));
    if (!r.rowCount) return "This request is already decided, or you raised it yourself (someone else must decide).";
  } catch (e) { return dbErrorMessage(e); }
  revalidatePath("/commercial/approvals");
  return null;
}

export async function markNotificationsRead() {
  const s = await requireOrg();
  await withUser(s.userId, (db) => db.query("update public.notifications set read_at = now() where tenant_id = $1 and user_id = auth.uid() and read_at is null", [s.org.id]));
  revalidatePath("/commercial", "layout");
}
