export type CaseStudy = {
  slug: string;
  name: string;
  cat: string;
  filter: string;
  tagline: string;
  img: string | null;
};
export type CaseStudyResult = { status: 'ready' | 'unconfigured' | 'unavailable'; studies: CaseStudy[] };
export type CaseStudyConfig = {url?: string; key?: string; includeSlugs?: string};

// Match industry metadata only. A reference to "prompt engineering" in the
// article body must not classify a healthcare project as engineering work.
const industryPattern = /\b(engineering|manufactur(?:ing|er|ers)|industrial)\b/i;

// No published study is from an engineering client yet, so these technical systems
// from other sectors are shown under their own industry labels, closest match first.
export const defaultIncludeSlugs = 'settlein,rtm-kinetics,mamas-compass,ipromo';

export function safeImageUrl(value: unknown): string | null {
  if (typeof value !== 'string' || !value.trim()) return null;
  try {
    const url = new URL(value, 'https://www.codesquad.ai');
    return url.protocol === 'https:' ? url.href : null;
  } catch { return null; }
}

export function selectRelevantStudies(rows: unknown[], includeSlugs = ''): CaseStudy[] {
  const includeOrder = includeSlugs.split(',').map(s => s.trim()).filter(Boolean);
  const included = new Set(includeOrder);
  const seen = new Set<string>();
  const studies = rows.flatMap(value => {
    if (!value || typeof value !== 'object') return [];
    const row = value as Record<string, unknown>;
    if (row.published !== true || typeof row.slug !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(row.slug) || typeof row.name !== 'string' || !row.name.trim() || seen.has(row.slug)) return [];
    const cat = typeof row.cat === 'string' ? row.cat : '';
    const filter = typeof row.filter === 'string' ? row.filter : '';
    if (!included.has(row.slug) && !industryPattern.test(`${cat} ${filter}`)) return [];
    seen.add(row.slug);
    return [{slug: row.slug, name: row.name, cat, filter, tagline: typeof row.tagline === 'string' ? row.tagline : '', img: safeImageUrl(row.img)}];
  });
  // Engineering-labelled studies lead, so they take the homepage's featured slots once they exist.
  const rank = (study: CaseStudy) => industryPattern.test(`${study.cat} ${study.filter}`) ? -1 : includeOrder.indexOf(study.slug);
  return studies.sort((a, b) => rank(a) - rank(b));
}

export async function fetchCaseStudies(config: CaseStudyConfig, request: typeof fetch = fetch): Promise<CaseStudyResult> {
  const {url, key, includeSlugs} = config;
  if (!url?.trim() || !key?.trim()) return {status: 'unconfigured', studies: []};
  try {
    const endpoint = new URL('/rest/v1/medspa_case_studies', url);
    if (endpoint.protocol !== 'https:' || endpoint.username || endpoint.password) throw new Error('Invalid URL');
    endpoint.searchParams.set('select', 'slug,name,cat,filter,tagline,img,published');
    endpoint.searchParams.set('published', 'eq.true');
    endpoint.searchParams.set('order', 'ord.asc,created_at.desc,slug.asc');
    const headers: Record<string, string> = {apikey: key, Accept: 'application/json'};
    // New sb_secret keys are not JWTs. Legacy service-role keys use both headers.
    if (key.startsWith('eyJ')) headers.Authorization = `Bearer ${key}`;
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
    return {status: 'ready', studies: selectRelevantStudies(rows, includeSlugs)};
  } catch {
    // Do not include upstream response bodies, request headers, or secrets in logs.
    console.warn('[case-studies] Could not load published studies. Check server configuration and Supabase availability.');
    return {status: 'unavailable', studies: []};
  }
}
