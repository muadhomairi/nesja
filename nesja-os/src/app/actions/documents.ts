"use server";
import { createHash, randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { requireOrg } from "@/lib/server/session";
import { dbErrorMessage, one, withUser } from "@/lib/server/db";
import { supabaseAdmin } from "@/lib/supabase/server";
import type { FormState } from "./validation";

const MIME: Record<string, string> = { pdf: "application/pdf", png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", csv: "text/csv", txt: "text/plain",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation" };
const MAGIC: [string, number[]][] = [["pdf", [0x25, 0x50, 0x44, 0x46]], ["png", [0x89, 0x50, 0x4e, 0x47]], ["jpg", [0xff, 0xd8, 0xff]], ["jpeg", [0xff, 0xd8, 0xff]], ["docx", [0x50, 0x4b, 0x03, 0x04]], ["xlsx", [0x50, 0x4b, 0x03, 0x04]], ["pptx", [0x50, 0x4b, 0x03, 0x04]]];

/** Secure upload: extension allow-list, content signature check, 50 MB cap, SHA-256, path under the tenant prefix. */
export async function uploadDocument(_: FormState, form: FormData): Promise<FormState> {
  const s = await requireOrg("document.create");
  const file = form.get("file");
  const category = String(form.get("category") ?? "other");
  if (!(file instanceof File) || !file.size) return { ok: false, message: "Choose a file." };
  if (file.size > 52_428_800) return { ok: false, message: "Files are limited to 50 MB." };
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  const mime = MIME[ext];
  if (!mime) return { ok: false, message: "This file type is not allowed." };
  const bytes = new Uint8Array(await file.arrayBuffer());
  const sig = MAGIC.find(([e]) => e === ext)?.[1];
  if (sig && !sig.every((b, i) => bytes[i] === b)) return { ok: false, message: "The file content does not match its extension." };
  const id = randomUUID();
  const safeName = file.name.replace(/[^\w.\-]+/g, "_").slice(-120);
  const path = `${s.org.id}/${id}/${safeName}`;
  try {
    // Check permission and record metadata first (RLS), then store the bytes.
    await withUser(s.userId, (db) => db.query(`insert into public.documents(tenant_id, id, name, category, storage_path, mime_type, size_bytes, sha256, owner_id)
      values ($1,$2,$3,$4,$5,$6,$7,$8, auth.uid())`, [s.org.id, id, safeName, ["proposal", "quotation", "agreement", "tender", "sales_kit", "template", "other"].includes(category) ? category : "other", path, mime, file.size, createHash("sha256").update(bytes).digest("hex")]));
    const { error } = await supabaseAdmin().storage.from("tenant-documents").upload(path, bytes, { contentType: mime, upsert: false });
    if (error) {
      await withUser(s.userId, (db) => db.query("delete from public.documents where tenant_id = $1 and id = $2", [s.org.id, id])).catch(() => undefined);
      return { ok: false, message: "Upload failed. Nothing was saved." };
    }
  } catch (e) { return { ok: false, message: dbErrorMessage(e) }; }
  revalidatePath("/commercial/documents");
  return { ok: true, message: `${safeName} uploaded.` };
}

/** Short-lived (60 s) signed link, issued only after RLS confirms the user may see the document. */
export async function documentLink(id: string): Promise<{ url?: string; error?: string }> {
  const s = await requireOrg("document.view");
  if (!/^[0-9a-f-]{36}$/.test(id)) return { error: "Invalid request" };
  const doc = await withUser(s.userId, (db) => one<{ storage_path: string }>(db, "select storage_path from public.documents where tenant_id = $1 and id = $2", [s.org.id, id]));
  if (!doc) return { error: "Not found" };
  const { data, error } = await supabaseAdmin().storage.from("tenant-documents").createSignedUrl(doc.storage_path, 60);
  if (error || !data) return { error: "The file is not available in storage (demo records have metadata only)." };
  return { url: data.signedUrl };
}
