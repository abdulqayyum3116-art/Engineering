export type Enquiry = {name: string; email: string; phone: string; company: string; website: string; services: string[]; message: string};
export type EnquiryValidation = {ok: true; enquiry: Enquiry} | {ok: false; error: string};
export type EnquiryConfig = {url?: string; key?: string};
export type EnquirySaveResult = 'saved' | 'unconfigured' | 'failed';

export const enquirySource = 'engineering.codesquad.ai';

const text = (value: unknown) => typeof value === 'string' ? value.trim() : '';

function validWebsite(value: string): boolean {
  try { return ['http:', 'https:'].includes(new URL(value).protocol); } catch { return false; }
}

// The browser checks these too, but only this check can be relied on.
export function validateEnquiry(input: unknown, knownServices: string[]): EnquiryValidation {
  const row = input && typeof input === 'object' ? input as Record<string, unknown> : {};
  const [name, email, phone, company, website, message] = [row.name, row.email, row.phone, row.company, row.website, row.message].map(text);
  const digits = phone.replace(/\D/g, '').length;
  if (!name || name.length > 120) return {ok: false, error: 'Enter your full name.'};
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return {ok: false, error: 'Enter a valid email address.'};
  if (phone.length > 40 || !/^\+?[0-9 .()-]+$/.test(phone) || digits < 7 || digits > 15) return {ok: false, error: 'Enter a valid phone number, including the country code.'};
  if (!company || company.length > 160) return {ok: false, error: 'Enter your company name.'};
  if (website && (website.length > 500 || !validWebsite(website))) return {ok: false, error: 'Enter a valid website address, starting with https://.'};
  if (message.length < 10 || message.length > 4000) return {ok: false, error: 'Tell us about your project in 10 to 4,000 characters.'};
  const services = Array.isArray(row.services) ? knownServices.filter(service => (row.services as unknown[]).includes(service)) : [];
  return {ok: true, enquiry: {name, email, phone, company, website, services, message}};
}

// medspa_leads is the main site's enquiry table. It keeps phone, message and business in payload.
export async function saveEnquiry(config: EnquiryConfig, enquiry: Enquiry, request: typeof fetch = fetch): Promise<EnquirySaveResult> {
  const {url, key} = config;
  if (!url?.trim() || !key?.trim()) return 'unconfigured';
  try {
    const endpoint = new URL('/rest/v1/medspa_leads', url);
    if (endpoint.protocol !== 'https:' || endpoint.username || endpoint.password) throw new Error('Invalid URL');
    const headers: Record<string, string> = {apikey: key, 'Content-Type': 'application/json', Prefer: 'return=minimal'};
    if (key.startsWith('eyJ')) headers.Authorization = `Bearer ${key}`;
    const {name, email, phone, company, website, services, message} = enquiry;
    const response = await request(endpoint.href, {
      method: 'POST',
      headers,
      body: JSON.stringify({name, email, source: enquirySource, payload: {phone, message, business: company, website, services}}),
      signal: AbortSignal.timeout(8000),
      cache: 'no-store',
    });
    if (!response.ok) throw new Error('Enquiry request failed');
    return 'saved';
  } catch {
    // Do not include enquiry details, upstream responses, or secrets in logs.
    console.warn('[enquiry] Could not save an enquiry. Check server configuration and Supabase availability.');
    return 'failed';
  }
}
