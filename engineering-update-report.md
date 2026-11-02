# Engineering-first update

Latest footer revision: the shared footer now uses an ink background, the supplied light logo, lime accents, six engineering service links, grouped site/contact navigation, and a compact agriculture row. This user-requested enhancement supersedes the original footer-preservation scope below. Build and footer link/layout checks pass at 1440px, 900px and 390px.

Latest hero revision: the hero and capability strip now fill the viewport below the header on desktop, while mobile grows naturally to fit its content. The agriculture photo, its label and its chip have been removed from the hero at the user’s request. Earlier agriculture-frame descriptions below record the initial implementation and are superseded by this revision.

Implemented locally; not deployed. Both requested surfaces use the same new services showcase and catalog. The original row renderer remains only on the unchanged engineering industry page.

## Pages and positioning

- Homepage title: **Engineering Solutions & Services | CodeSquad**.
- Services title: **Engineering Services | CodeSquad**; visible heading: **Engineering services.**, as approved during planning.
- Both meta descriptions lead with engineering and mention agricultural operations once, secondarily. Shared logo sub-label: **ENGINEERING SOLUTIONS**.
- Hero uses the supplied headline, copy, CTAs, capability labels and preserved operational tagline.
- Homepage section 01 retains the engineering photo card and replaces the agriculture card with one secondary link. Section 03 receives only the approved deployment clause through a homepage-only override.
- The marketing cross-link and FAQ answers are unchanged. No livestock service or marketing offer was added.

New routes, generated through the existing detail template:

1. `/services/maintenance-asset-systems`
2. `/services/estimating-quoting-tools`
3. `/services/technical-documentation-systems`

The supplied deliverables and descriptions are used verbatim. As approved, new pages repeat their supplied name and one-liner in the template's support section. Existing detail-page identifiers remain unchanged; new identifiers are 09–11. No numbering appears in the redesigned showcase.

## Motion and visual hierarchy

| Element | Implementation |
| --- | --- |
| H1 | CSS transform/opacity entrance, 300ms per word, 60ms stagger; accessible full heading label, decorative word spans hidden from assistive technology. Seven words complete in approximately 660ms. |
| Copy and CTAs | 350ms fade/rise after 150ms. |
| Main frame | 450ms slide/tilt entrance; nested wrapper separates pointer movement from entrance transforms. |
| Agriculture frame | 300ms fade after 480ms; approximately one-third of the engineering frame's width at all tested sizes. |
| Schematic | Dashed SVG path revealed with a stroke mask over 500ms, with three nodes; an SVG motion-path dot loops over five seconds after the draw. Path stays in the engineering visual area. |
| Chips | CSS six-second cycle, three staggered two-second slots, one engineering chip at a time. Agriculture has one static chip. |
| Capability strip | CSS 30-second translated loop, exact supplied order, accessibility-hidden duplicate, hover/focus pause. |
| Badge | Existing ordinary lettering retained; only its decorative asterisk pulses. No badge rotation. |
| Parallax | Desktop fine-pointer input only, bounded to ±8px with a gentle CSS transition. |
| Services | IntersectionObserver activates a once-only panel entrance and 80ms card staggering; shared strip and agriculture fade. |

Entrances use transform and opacity, except the explicitly requested SVG path-drawing mask. Entrance classes are released after completion so browser offscreen suspension cannot replay or strand faded content. No animation library was added.

Mobile uses fade-only hero entrances and hides the schematic. Reduced motion and no-JavaScript rendering show static content, the first engineering chip, the farm chip, and one complete capability sequence. All layout dimensions are reserved before motion.

## Palette

- Existing `--ink`: `#242e29` — dark panel, text and controls.
- Existing `--paper`: `#f7f7f0` — page surface, chips and light panel text.
- Existing `--lime`: `#d7ef75` — shared strip, icons, badge and travelling dot.
- Existing `--line`: `#dcdfd4` — light dividers and chip borders.
- Added `--soft-tint`: `#eeefe6` — token for the already-existing soft tint.
- Blueprint lines and dark-panel borders use low-opacity versions of `--paper`'s existing color. Existing photo shadows, white frame borders and typography remain in place. No new brand colors.

## Balance and screenshots

At 1440px, both showcases measure identically:

| Region | Rendered height | Share |
| --- | ---: | ---: |
| Engineering panel | 800.2px | 71.8% |
| Shared engineering strip | 101.9px | 9.1% |
| Agriculture band | 212.9px | 19.1% |
| Engineering plus shared | 902.1px | **80.9%** |

These regions have equal widths, so height and rectangular area proportions match. Common section headings, outer section padding, and the marketing block are excluded. This is approximately 81/19, within one percentage point of the approximate 80/20 target. Agriculture never approached the 30% ceiling. The initial 84/16 treatment was adjusted by tightening engineering card spacing and increasing agriculture description type from 11px to 12px on desktop.

Screenshots are in `.browser-check-engineering/`:

- [Desktop hero](.browser-check-engineering/hero-1440.png)
- [Mobile hero](.browser-check-engineering/hero-390.png)
- [Homepage services, desktop](.browser-check-engineering/home-showcase-1440.png)
- [Services page, desktop](.browser-check-engineering/services-showcase-1440.png)
- [Homepage services, mobile](.browser-check-engineering/home-showcase-390.png)
- [Services page, mobile](.browser-check-engineering/services-showcase-390.png)

Additional captures cover 900px, reduced motion, and JavaScript disabled. Machine-readable results are in `.browser-check-engineering/results.json` and `.browser-check-reposition/results.json`.

## Verification

- Production build and TypeScript check pass.
- All six existing case-study unit tests pass.
- Existing site browser suite passes 46 page/viewport checks at 1440px and 390px, seven redirects, existing form/FAQ/navigation checks, and reduced motion.
- Focused browser checks cover 1440px, 900px, and 390px; six engineering cards, four agriculture links, exact service descriptions, responsive column counts, frame-width ratio, desktop CTA position, chips, dot motion, parallax bounds, and marquee hover/focus pause.
- All eleven service detail routes return successfully. Original service records match the committed baseline exactly; the unchanged template continues to render their original content.
- Both requested titles, descriptions and header sub-label are checked against production HTML.
- Source comparisons confirm the excluded route bodies, FAQ, footer markup, enquiry form markup, existing service-detail template, and case-study code remain unchanged, allowing line-ending normalization and the preservation-only imports listed below.
- Focused checks verify reduced motion and no-JavaScript visibility at desktop and mobile sizes, with no browser application console warnings, errors, or hydration warnings.

## Files changed or created

| File | Purpose |
| --- | --- |
| `src/app/page.tsx` | Homepage metadata, hero/showcase composition, sections 01 and 03 positioning. |
| `src/app/[...segments]/page.tsx` | Services index metadata, heading and shared showcase; existing dynamic template generates the new detail pages. |
| `src/app/globals.css` | Scoped responsive layout and motion rules. |
| `src/lib/content.ts` | New service records, combined catalog, icon identifiers and supplied positioning strings. |
| `src/components/hero.tsx` — new | Hero hierarchy and progressive motion enhancement. |
| `src/components/services-showcase.tsx` — new | Shared engineering grid, AI strip and compact agriculture band. |
| `src/components/header.tsx` | Requested shared sub-label. |
| `src/components/flow-diagram.tsx` | Optional homepage-only deployment description. |
| `src/components/shared.tsx` | Preservation-only catalog import: footer and industry rows retain their original services. |
| `src/components/enquiry-form.tsx` | Preservation-only catalog import: contact retains its original eight options. |
| `tests/engineering-check.mjs` — new | Focused browser and catalog-preservation checks. |
| `engineering-update-report.md` — new | This report. |

The contact component import is the only necessary edit in an explicitly excluded page's component; it preserves existing behavior rather than expanding it. The global header change is the authorized shared exception. Build-generated `next-env.d.ts` changes were restored. No excluded page body was redesigned or rewritten.

## Limits

Verification used the local production build in Edge. The supplied live URL was inaccessible through the browsing tool, so unchanged copy was verified against the committed repository baseline, not independently against a fresh live-site capture. No deployment was performed.
