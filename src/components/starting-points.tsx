import Link from 'next/link';
import {ArrowUpRight} from 'lucide-react';
import {inquiry,services,startingPoints} from '@/lib/content';
import {ServiceIconGlyph} from './service-icon';

export function StartingPoints(){
 return <div className="starting-points">
  <div className="sp-heading"><span className="eyebrow">START FROM THE PROBLEM</span><h3>Know the problem, not the service?</h3></div>
  <ul className="sp-grid">{startingPoints.map(point=>{const service=services.find(s=>s.slug===point.slug)!;return <li key={point.slug}><Link className="sp-card" href={'/services/'+service.slug}><span className="sp-problem">{point.problem}</span><span className="sp-outcome">{point.outcome}</span><span className="sp-service"><ServiceIconGlyph icon={service.icon} size={16} strokeWidth={1.7} aria-hidden="true"/>{service.short}<ArrowUpRight size={15} aria-hidden="true"/></span></Link></li>;})}</ul>
  <Link className="sp-fallback" href={inquiry}><span><strong>Something else?</strong> Most projects begin with one system and a focused scope. Tell us the problem and we will suggest a starting point.</span><ArrowUpRight size={20} aria-hidden="true"/></Link>
 </div>;
}
