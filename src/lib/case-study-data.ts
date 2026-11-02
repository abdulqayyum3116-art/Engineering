export type CaseStudy = {
  slug: string;
  name: string;
  cat: string;
  filter: string;
  tagline: string;
  img: string | null;
};
export type CaseStudyResult = { status: 'ready' | 'unconfigured' | 'unavailable'; studies: CaseStudy[] };
export type CaseStudyDetail = CaseStudy & {body: string};
export type CaseStudyDetailResult = { status: CaseStudyResult['status']; study: CaseStudyDetail | null };
export type CaseStudyConfig = {url?: string; key?: string};

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// Match metadata only, so a passing mention in the article body cannot hide a study.
// The name is included because research studies can carry a non-healthcare label.
const healthcarePattern = /\b(health\w*|wellness|medical|medspa|dental|clinic\w*|patient\w*|hospital\w*)\b/i;
const engineeringPattern = /\b(engineering|manufactur(?:ing|er|ers)|industrial)\b/i;

// The closest studies to this site's services lead, because the homepage shows the first three.
const leadingSlugs = ['settlein', 'ipromo', 'tristate-auto-sales', 'mamas-compass'];

export function safeImageUrl(value: unknown): string | null {
  if (typeof value !== 'string' || !value.trim()) return null;
  try {
    const url = new URL(value, 'https://www.codesquad.ai');
    return url.protocol === 'https:' ? url.href : null;
  } catch { return null; }
}

export function selectRelevantStudies(rows: unknown[]): CaseStudy[] {
  const seen = new Set<string>();
  const studies = rows.flatMap(value => {
    if (!value || typeof value !== 'object') return [];
    const row = value as Record<string, unknown>;
    if (row.published !== true || typeof row.slug !== 'string' || !slugPattern.test(row.slug) || typeof row.name !== 'string' || !row.name.trim() || seen.has(row.slug)) return [];
    const cat = typeof row.cat === 'string' ? row.cat : '';
    const filter = typeof row.filter === 'string' ? row.filter : '';
    if (healthcarePattern.test(`${cat} ${filter} ${row.name}`)) return [];
    seen.add(row.slug);
    return [{slug: row.slug, name: row.name, cat, filter, tagline: typeof row.tagline === 'string' ? row.tagline : '', img: safeImageUrl(row.img)}];
  });
  // Engineering-labelled studies go first once they exist; the rest keep their database order.
  const rank = (study: CaseStudy) => {
    if (engineeringPattern.test(`${study.cat} ${study.filter}`)) return -1;
    const index = leadingSlugs.indexOf(study.slug);
    return index < 0 ? leadingSlugs.length : index;
  };
  return studies.sort((a, b) => rank(a) - rank(b));
}

function studyEndpoint(url: string): URL {
  const endpoint = new URL('/rest/v1/medspa_case_studies', url);
  if (endpoint.protocol !== 'https:' || endpoint.username || endpoint.password) throw new Error('Invalid URL');
  return endpoint;
}

function studyHeaders(key: string): Record<string, string> {
  const headers: Record<string, string> = {apikey: key, Accept: 'application/json'};
  // New sb_secret keys are not JWTs. Legacy service-role keys use both headers.
  if (key.startsWith('eyJ')) headers.Authorization = `Bearer ${key}`;
  return headers;
}

export async function fetchCaseStudy(config: CaseStudyConfig, slug: string, request: typeof fetch = fetch): Promise<CaseStudyDetailResult> {
  const {url, key} = config;
  if (!url?.trim() || !key?.trim()) return {status: 'unconfigured', study: null};
  if (!slugPattern.test(slug)) return {status: 'ready', study: null};
  try {
    const endpoint = studyEndpoint(url);
    endpoint.searchParams.set('select', 'slug,name,cat,filter,tagline,img,published,body');
    endpoint.searchParams.set('published', 'eq.true');
    endpoint.searchParams.set('slug', `eq.${slug}`);
    endpoint.searchParams.set('limit', '1');
    const response = await request(endpoint.href, {
      headers: studyHeaders(key),
      signal: AbortSignal.timeout(8000),
      next: {revalidate: 60, tags: ['industry-case-studies']},
    });
    if (!response.ok) throw new Error('Case study request failed');
    const rows: unknown = await response.json();
    if (!Array.isArray(rows)) throw new Error('Invalid case study response');
    // The same rules as the listing apply, so hidden studies have no page here.
    const [study] = selectRelevantStudies(rows);
    if (!study) return {status: 'ready', study: null};
    const body = (rows[0] as Record<string, unknown>).body;
    return {status: 'ready', study: {...study, body: typeof body === 'string' ? body : ''}};
  } catch {
    console.warn('[case-studies] Could not load a published study. Check server configuration and Supabase availability.');
    return {status: 'unavailable', study: null};
  }
}

export async function fetchCaseStudies(config: CaseStudyConfig, request: typeof fetch = fetch): Promise<CaseStudyResult> {
  const {url, key} = config;
  if (!url?.trim() || !key?.trim()) return {status: 'unconfigured', studies: []};
  try {
    const endpoint = studyEndpoint(url);
    endpoint.searchParams.set('select', 'slug,name,cat,filter,tagline,img,published');
    endpoint.searchParams.set('published', 'eq.true');
    endpoint.searchParams.set('order', 'ord.asc,created_at.desc,slug.asc');
    const headers = studyHeaders(key);
    const rows: unknown[] = [];
    const pageSize = 100;
    for (let offset = 0; ; offset += pageSize) {
      endpoint.searchParams.set('limit', String(pageSize));
      endpoint.searchParams.set('offset', String(offset));
      const response = await request(endpoint.href, {
        headers,
        signal: AbortSignal.timeout(8000),
        next: {revalidate: 60, tags: ['industry-case-studies']},
      });
      if (!response.ok) throw new Error('Case study request failed');
      const page: unknown = await response.json();
      if (!Array.isArray(page)) throw new Error('Invalid case study response');
      rows.push(...page);
      if (page.length < pageSize) break;
    }
    return {status: 'ready', studies: selectRelevantStudies(rows)};
  } catch {
    // Do not include upstream response bodies, request headers, or secrets in logs.
    console.warn('[case-studies] Could not load published studies. Check server configuration and Supabase availability.');
    return {status: 'unavailable', studies: []};
  }
}
