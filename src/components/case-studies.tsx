import Link from 'next/link';
import {ArrowUpRight} from 'lucide-react';
import {getCaseStudies} from '@/lib/case-studies';
import {TextLink} from './shared';

export async function CaseStudies({featured = false}: {featured?: boolean}) {
  const result = await getCaseStudies();
  // Avoid a placeholder proof section on the homepage before real studies exist.
  if (featured && !result.studies.length) return null;
  const studies = featured ? result.studies.slice(0, 3) : result.studies;
  return <section className="section case-studies" aria-label="Case studies">
    {featured && <div className="section-heading"><div><span className="eyebrow">SELECTED WORK</span><h2>Expertise put<br/>into practice.</h2></div><TextLink href="/case-studies">Explore case studies</TextLink></div>}
    {studies.length ? <div className="article-grid">{studies.map(study => <a className="article-card case-card" href={`https://www.codesquad.ai/case-studies/${encodeURIComponent(study.slug)}`} key={study.slug}>
      {study.img ? <div className="article-image"><img src={study.img} alt={`${study.name} case study`} loading="lazy"/><ArrowUpRight aria-hidden="true"/></div> : <div className="case-cover"><span>{study.name}</span><ArrowUpRight aria-hidden="true"/></div>}
      <span className="eyebrow">{study.cat || study.filter || 'CODESQUAD CLIENT WORK'}</span>
      <h3>{study.name}</h3><p>{study.tagline}</p><span className="text-link">Read on CodeSquad <ArrowUpRight size={16} aria-hidden="true"/></span>
    </a>)}</div> : <div className="case-empty"><h2>{result.status === 'unavailable' ? 'Case studies are temporarily unavailable.' : 'More work to share soon.'}</h2><p>{result.status === 'unavailable' ? 'Please try again shortly, or get in touch to discuss relevant experience.' : 'We’re preparing selected work for engineering and agriculture. Talk to us about your project in the meantime.'}</p><Link className="button" href="/contact#enquiry">Discuss your project <ArrowUpRight size={18}/></Link></div>}
  </section>;
}
