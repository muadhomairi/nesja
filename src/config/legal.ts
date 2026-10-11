/**
 * Central legal and company configuration.
 *
 * Company facts are supplied by environment variables and render publicly
 * ONLY when set. Never fill these with guesses or placeholders: an unset
 * value is simply omitted from the Terms, Privacy and Cookie pages.
 */
const env = (name: string) => (process.env[name] || "").trim();

export const companyFacts = {
  /** Registered legal entity name, e.g. "NESJA Technologies LLC". */
  legalEntityName: env("NEXT_PUBLIC_LEGAL_ENTITY_NAME"),
  /** Company / commercial registration number. */
  registrationNumber: env("NEXT_PUBLIC_LEGAL_REGISTRATION_NUMBER"),
  /** Registered office address, single line. */
  registeredAddress: env("NEXT_PUBLIC_LEGAL_REGISTERED_ADDRESS"),
  /** Governing law and courts, e.g. "the laws of the Sultanate of Oman". */
  governingLaw: env("NEXT_PUBLIC_LEGAL_GOVERNING_LAW"),
  /** Mailbox for legal notices. */
  legalEmail: env("NEXT_PUBLIC_LEGAL_EMAIL"),
  /** Mailbox for privacy requests. Falls back to the legal mailbox when unset. */
  privacyEmail: env("NEXT_PUBLIC_PRIVACY_EMAIL") || env("NEXT_PUBLIC_LEGAL_EMAIL"),
} as const;

/** Who "NESJA" refers to on the legal pages. */
export const legalName = () => companyFacts.legalEntityName || "NESJA";

/** Date the policy text below was last changed. Update when wording changes. */
export const legalUpdated = "11 October 2026";

/**
 * Customer agreement architecture. These documents are issued to customers
 * as part of a commercial engagement. An agreement is listed publicly only
 * when `published` is true AND a real document URL exists. Do not publish a
 * template that has not been approved by counsel.
 */
export type AgreementId = "msa" | "order-form" | "dpa" | "sla" | "aup" | "security-addendum";

export interface CustomerAgreement {
  id: AgreementId;
  name: string;
  purpose: string;
  url?: string;
  published: boolean;
}

export const customerAgreements: CustomerAgreement[] = [
  { id: "msa", name: "Master Subscription Agreement", purpose: "The main terms for subscribing to and using NESJA.OS.", published: false },
  { id: "order-form", name: "Order Form", purpose: "Edition, users, term, fees and start date for a specific subscription.", published: false },
  { id: "dpa", name: "Data Processing Agreement", purpose: "How NESJA processes personal data on a customer's behalf.", published: false },
  { id: "sla", name: "Service Level Agreement", purpose: "Service availability and support commitments.", published: false },
  { id: "aup", name: "Acceptable Use Policy", purpose: "Rules for acceptable use of the NESJA service.", published: false },
  { id: "security-addendum", name: "Security Addendum", purpose: "Security commitments for the NESJA service.", published: false },
];

export const publishedAgreements = () => customerAgreements.filter((a) => a.published && a.url);
