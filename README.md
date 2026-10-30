# CodeSquad Engineering & Agriculture

Next.js App Router marketing site for `engineering.codesquad.ai`.

## Develop

Use Node.js 20.9 or newer. On Windows PowerShell use `npm.cmd` if script execution policy blocks `npm`.

```sh
npm install
npm run dev
npm run typecheck
npm run build
npm start
```

## Content

Shared copy, industry data, service definitions, article metadata, and CTA destinations live in `src/lib/content.ts`. Articles live in `content/*.mdx`. Only trusted repository authors should edit MDX. Add article metadata and an MDX file together. Pages are statically generated from the defined routes; unknown routes return 404.

Illustrative content samples are explicitly labelled. They must never be presented as client work or measured results. All launch copy is original. Photography is loaded from Unsplash; replace or download approved production assets if required by your asset policy. The industrial, agricultural, and office image sources are recorded in `src/lib/content.ts`. Source photographs: https://images.unsplash.com/photo-1581092921461-eab62e97a780, https://images.unsplash.com/photo-1500382017468-9049fed747ef and https://images.unsplash.com/photo-1497366754035-f200968a6e72. Confirm applicable image licensing before launch; no claim of ownership is made.

## Leads

Primary CTAs link to the local `/contact#enquiry` form. It includes contact details, company, industry, service interests, website, and a message. Native browser validation checks required fields, email, and URL formats. Backend integration is deferred: submissions currently stay on the page, retain entered values, and show an explicit not-sent notice. No data is transmitted or persisted. Connect `handleSubmit` in `src/components/enquiry-form.tsx` to the existing CodeSquad backend when its API contract is provided; map the exported `EnquiryPayload` type to that contract and implement pending, confirmed-success, and error states. Do not put privileged Supabase keys in client code. Booking links still use `https://calendly.com/code_squad/30min`.

## Supabase case studies

Copy `.env.example` to `.env.local` and set `SUPABASE_URL` and `SUPABASE_SECRET_KEY` for the **same project used by CodeSquad**. The existing main-site names `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` also work. Never prefix the secret/service-role key with `NEXT_PUBLIC_`. Add the same variables to Vercel and redeploy after changing them. No schema migration or database writes are performed.

The server reads `medspa_case_studies` through Supabase REST, selects only published rows, and preserves `ord` / creation-date ordering. Requests are paginated and cached for 60 seconds. Cards appear at `/case-studies`, with up to three featured on the homepage. Each links to its original full study on CodeSquad. Article HTML is not fetched or injected into this site.

Relevance is matched against the existing `cat` and `filter` fields for engineering, manufacturing, industrial, agricultural, and related industry labels. Article-body references to engineering do not qualify a project. For approved transferable work from other sectors, set `CASE_STUDY_INCLUDE_SLUGS` to a comma-separated list of existing slugs. This never overrides publication status or the displayed industry label. The bundled parent-site data had no direct industry matches at implementation time; live results will depend on your database and optional allowlist.

With no configuration, no matching records, or a failed connection, the homepage proof section is omitted and the case-studies page displays an honest empty/unavailable state. Errors never expose credentials or upstream response bodies. The enquiry form remains unconnected as previously requested.

Run the mocked integration and filtering checks with `node --experimental-strip-types --test tests/case-studies.test.mjs` (Node 22.6+). Verify live results after adding credentials: published industry matches appear, drafts and unrelated studies do not, original links resolve, and later content changes appear after cache revalidation.

## Vercel setup

Import this repository as a Next.js project, build with `npm run build`, and retain the default output settings. Add `engineering.codesquad.ai` in project Domains and apply the exact DNS record shown by Vercel at your DNS provider. Check HTTPS after verification. The production canonical origin is defined in `src/lib/content.ts`.

Vercel preview deployments emit noindex metadata and disallow crawling. Verify all routes, mobile navigation, inquiry and booking destinations, sitemap.xml, robots.txt, and opengraph-image before promoting production. Use Vercel's deployment history to restore the preceding deployment if necessary.

No analytics or cookies are installed by this site. Contact links leave the site for CodeSquad or Calendly. No parent website changes are included.

External photographs have original local SVG fallbacks in public/images. These illustrations display automatically if a remote image cannot load.

