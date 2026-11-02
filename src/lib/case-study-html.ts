import sanitizeHtml from 'sanitize-html';

const mainSite = 'https://www.codesquad.ai';

function studyImageSrc(src = ''): string {
  try {
    const url = new URL(src, mainSite);
    return url.protocol === 'https:' ? url.href : '';
  } catch { return ''; }
}

// Article links are written for the main site, so keep visitors on this one.
export function localStudyHref(href: string): string {
  if (href === '/#case-studies') return '/case-studies';
  if (href === '/inquiry') return '/contact#enquiry';
  if (href.startsWith('/case-studies/')) return href;
  return href.startsWith('/') ? mainSite + href : href;
}

// Study HTML comes from the database, so only the markup articles actually use is allowed through.
export function cleanStudyHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ['article', 'header', 'section', 'div', 'span', 'p', 'h1', 'h2', 'h3', 'strong', 'b', 'em', 'small', 'ul', 'li', 'blockquote', 'cite', 'figure', 'figcaption', 'img', 'a', 'details', 'summary', 'svg', 'path'],
    allowedAttributes: {
      '*': ['class', 'aria-hidden', 'aria-label'],
      a: ['href', 'target', 'rel'],
      img: ['src', 'alt', 'width', 'height', 'loading'],
      svg: ['viewBox', 'fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin'],
      path: ['d'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    parser: {lowerCaseAttributeNames: false},
    transformTags: {
      a: (tagName, attribs) => ({tagName, attribs: {...attribs, ...(attribs.href ? {href: localStudyHref(attribs.href)} : {})}}),
      img: (tagName, attribs) => ({tagName, attribs: {...attribs, src: studyImageSrc(attribs.src)}}),
    },
    // Related cards can point at studies hidden here, so the page lists its own instead.
    exclusiveFilter: frame => frame.tag === 'section' && /\bcs-study-related\b/.test(frame.attribs.class ?? ''),
  });
}
