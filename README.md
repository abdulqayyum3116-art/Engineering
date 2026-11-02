# CodeSquad Engineering & Agriculture

Next.js App Router specialist services site for `engineering.codesquad.ai`.

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

Primary CTAs link to the local `/contact#enquiry` form, which asks for name, email, phone, company, an optional website, service interests and a message. The browser posts to `/api/enquiry`, which validates the fields again and inserts into the main site's `medspa_leads` table with `source` set to `engineering.codesquad.ai`; phone, message, business, website and services go in `payload`. Spam protection is a hidden field, a same-origin check and a per-instance rate limit. Do not put privileged Supabase keys in client code. Booking links still use `https://calendly.com/code_squad/30min`.

## Supabase case studies

Copy `.env.example` to `.env.local` and set `SUPABASE_URL` and `SUPABASE_SECRET_KEY` for the **same project used by CodeSquad**. The existing main-site names `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` also work. Never prefix the secret/service-role key with `NEXT_PUBLIC_`. Add the same variables to Vercel and redeploy after changing them. No schema migration or database writes are performed.

The server reads `medspa_case_studies` through Supabase REST, selects only published rows, and preserves `ord` / creation-date ordering. Requests are paginated and cached for 60 seconds. Cards appear at `/case-studies`, with up to three featured on the homepage. Each opens its full study at `/case-studies/[slug]` on this site. Article HTML is fetched only for that page, passed through an allowlist in `src/lib/case-study-html.ts`, and has its main-site links repointed here. These pages set their canonical URL to the main site, which publishes the same text, and are left out of this site's sitemap.

Every published study is shown except healthcare-related ones, which are detected from the existing `cat`, `filter` and `name` fields. Article-body text is not checked. New published studies appear automatically under their own industry label. Engineering-labelled studies sort first, followed by `leadingSlugs` in `src/lib/case-study-data.ts`, because the homepage features the first three.

With no configuration, no matching records, or a failed connection, the homepage proof section is omitted and the case-studies page displays an honest empty/unavailable state. Errors never expose credentials or upstream response bodies. The enquiry form remains unconnected as previously requested.

Run the mocked integration and filtering checks with `node --experimental-strip-types --test tests/case-studies.test.mjs` (Node 22.6+). Verify live results after adding credentials: published industry matches appear, drafts and unrelated studies do not, original links resolve, and later content changes appear after cache revalidation.

## Vercel setup

Import this repository as a Next.js project, build with `npm run build`, and retain the default output settings. Add `engineering.codesquad.ai` in project Domains and apply the exact DNS record shown by Vercel at your DNS provider. Check HTTPS after verification. The production canonical origin is defined in `src/lib/content.ts`.

Vercel preview deployments emit noindex metadata and disallow crawling. Verify all routes, mobile navigation, inquiry and booking destinations, sitemap.xml, robots.txt, and opengraph-image before promoting production. Use Vercel's deployment history to restore the preceding deployment if necessary.

No analytics or cookies are installed by this site. Contact links leave the site for CodeSquad or Calendly. No parent website changes are included.

External photographs have original local SVG fallbacks in public/images. These illustrations display automatically if a remote image cannot load.


## Service catalogue and delivery review

The eighteen services are defined in `src/lib/content.ts`, in five groups: AI & Automation, Software & Cloud, Engineering Solutions, Growth & Visibility and Agriculture. Groups, icons, numbering, the services showcase, footer links, enquiry options and sitemap all derive from that catalogue. `/services/engineering-software` and `/services/ai-automation` permanently redirect to their replacements. `/services/seo` and `/services/paid-media-lead-generation` redirect to their Growth & Visibility replacements. Content and social media services remain with the main CodeSquad site. They describe proposed service scope, not evidence of previous projects. Confirm delivery capability before launch, particularly equipment integration, sensor collection, field imagery data, automated controls and ongoing support commitments. No specific aerial or orbital imagery source is promised.

`src/components/flow-diagram.tsx` supplies the delivery, season and monitoring diagrams. All labels remain readable without animation; reduced-motion preferences disable the sequence. Enquiry availability is defined in `src/lib/content.ts` and rendered by the shared availability component in both the form and FAQ. Submissions remain unwired.

Legacy routes permanently redirect through `next.config.ts`. The sitemap derives its routes from the same service and article data as page generation. No individual files are needed for each detail route.

For the local browser checks on Windows, run the production server on port 3107, then `node tests/site-check.mjs`. The check uses installed Edge in headless mode and writes screenshots and results to the ignored `.browser-check-reposition` directory. It checks every sitemap page at 1440px and 390px, headings, internal links, overflow, images, redirects, navigation, FAQ expansion, the not-sent form state and reduced motion. `CHECK_ORIGIN` can point to another local port.

## Responsive check

With the production server running on port 3107, run `node tests/responsive-check.mjs` (requires the `playwright` package and Chromium). It loads every sitemap page at 14 widths from 320px to 2560px and fails on horizontal scrolling, elements outside the viewport, clipped content or text under 10px. It warns about touch targets under 32px on widths below 1024px.
