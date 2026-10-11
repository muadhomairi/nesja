"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { contactSchema, companySizes, fieldErrors } from "@/lib/validation";
import { postJson } from "@/lib/api-client";
import { getAttribution, submissionContext } from "@/lib/attribution";
import { track } from "@/lib/analytics";
import { contactEnquiryTypes, categoryFromParam } from "@/config/enquiries";
import { Button } from "@/components/ui/Button";
import { TextField, TextArea, SelectField, FormAlert, Honeypot } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";

const formLabel = Object.fromEntries(contactEnquiryTypes.map((t) => [t.value, t.label]));
const prompt = Object.fromEntries(contactEnquiryTypes.map((t) => [t.value, t.prompt]));

/** Contact Sales enquiry. Enterprise fields are optional and revealed on request. */
export function ContactForm() {
  const [v, setV] = useState({ enquiryType: "", name: "", email: "", company: "", role: "", message: "", country: "", companySize: "", estimatedUsers: "" });
  const [enterprise, setEnterprise] = useState(false);
  const [formContext, setFormContext] = useState("contact");
  const [hp, setHp] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const param = q.get("type") || q.get("topic");
    const users = q.get("users");
    const edition = q.get("edition"), term = q.get("term");
    const category = categoryFromParam(param) ?? (edition ? "PROPOSAL" : null);
    if (category === "ENTERPRISE" || (users && Number(users) >= 1000)) setEnterprise(true);
    const from = q.get("from");
    setFormContext(["contact", category?.toLowerCase(), from].filter(Boolean).join(":"));
    setV((s) => ({
      ...s,
      enquiryType: category ?? s.enquiryType,
      estimatedUsers: users ?? s.estimatedUsers,
      message: s.message || (edition ? `We'd like a proposal for the ${edition.charAt(0).toUpperCase() + edition.slice(1)} edition${term ? `, ${term === "monthly" ? "monthly" : `${term.replace("m", "")}-month`} term` : ""}${users ? `, ${users} users` : ""}.` : ""),
    }));
  }, []);

  const set = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setV((s) => ({ ...s, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...v, enterprise, estimatedUsers: v.estimatedUsers === "" ? "" : Number(v.estimatedUsers), attribution: getAttribution(), submission: submissionContext(formContext), website: hp };
    const parsed = contactSchema.safeParse(payload);
    if (!parsed.success) {
      const errs = fieldErrors(parsed.error);
      setErrors(errs);
      document.getElementById(Object.keys(errs)[0])?.focus();
      return;
    }
    setErrors({}); setFormError(""); setState("loading");
    const res = await postJson("/api/contact", payload);
    if (res.ok) { setState("done"); track("contact_submitted", { enterprise, enquiryType: v.enquiryType }); return; }
    setState("idle");
    if (res.fieldErrors) setErrors(res.fieldErrors);
    setFormError(res.error);
  };

  if (state === "done") {
    return (
      <div className="surface p-8 text-center md:p-12" role="status">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-teal/15 text-teal"><Icon name="check" className="h-6 w-6" /></span>
        <h2 className="mt-6 text-2xl font-semibold text-cloud">Thank you. Your enquiry has been received.</h2>
        <p className="mx-auto mt-3 max-w-md text-mist">A member of the NESJA team will review your enquiry and respond using the contact details you provided.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="surface relative space-y-5 p-6 md:p-8">
      <Honeypot value={hp} onChange={setHp} />
      <SelectField label="Enquiry type" name="enquiryType" placeholder="Choose an enquiry type…" options={contactEnquiryTypes.map((t) => t.value)} optionLabels={formLabel} value={v.enquiryType} onChange={set("enquiryType")} error={errors.enquiryType} />
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField label="Name" name="name" autoComplete="name" value={v.name} onChange={set("name")} error={errors.name} />
        <TextField label="Work email" name="email" type="email" autoComplete="email" value={v.email} onChange={set("email")} error={errors.email} />
        <TextField label="Company" name="company" autoComplete="organization" value={v.company} onChange={set("company")} error={errors.company} />
        <TextField label="Role" name="role" autoComplete="organization-title" value={v.role} onChange={set("role")} error={errors.role} />
      </div>
      <TextArea label="Message" name="message" value={v.message} onChange={set("message")} error={errors.message} placeholder={prompt[v.enquiryType] ?? "What would you like to discuss?"} />

      <div>
        <button type="button" onClick={() => setEnterprise((x) => !x)} aria-expanded={enterprise} aria-controls="enterprise-fields" className="inline-flex items-center gap-2 text-sm font-medium text-teal hover:text-teal-soft">
          <Icon name={enterprise ? "minus" : "plus"} className="h-4 w-4" /> {enterprise ? "Enterprise enquiry details" : "This is an enterprise enquiry (optional details)"}
        </button>
        <div id="enterprise-fields" hidden={!enterprise} className="mt-4 grid gap-5 sm:grid-cols-3">
          <TextField label="Country" name="country" autoComplete="country-name" optional value={v.country} onChange={set("country")} error={errors.country} />
          <SelectField label="Company size" name="companySize" optional options={companySizes} value={v.companySize} onChange={set("companySize")} error={errors.companySize} />
          <TextField label="Estimated users" name="estimatedUsers" inputMode="numeric" optional value={v.estimatedUsers} onChange={set("estimatedUsers")} error={errors.estimatedUsers} />
        </div>
      </div>

      {formError && <FormAlert>{formError}</FormAlert>}
      <div className="flex flex-col-reverse items-start gap-4 pt-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-mist">Your details are handled under our <Link href="/privacy" className="underline hover:text-cloud">Privacy Policy</Link>.</p>
        <Button type="submit" size="lg" loading={state === "loading"} arrow>{state === "loading" ? "Sending…" : "Send enquiry"}</Button>
      </div>
    </form>
  );
}
