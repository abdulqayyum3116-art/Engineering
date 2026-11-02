'use client';

import {useEffect,useRef,type CSSProperties} from 'react';
import Link from 'next/link';
import {ArrowUpRight} from 'lucide-react';
import {serviceGroups,servicesByGroup} from '@/lib/content';
import {ServiceIconGlyph} from './service-icon';

export function ServicesShowcase(){
 const ref=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  const root=ref.current;if(!root||!('IntersectionObserver' in window))return;
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  let observer:IntersectionObserver|undefined;
  const timers:number[]=[];
  const initialize=()=>{
   observer?.disconnect();root.querySelectorAll('.reveal-pending').forEach(el=>el.classList.remove('reveal-pending'));
   if(motion.matches)return;
   observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.remove('reveal-pending');entry.target.classList.add('reveal-visible');timers.push(window.setTimeout(()=>entry.target.classList.add('reveal-complete'),900));observer?.unobserve(entry.target);}}),{threshold:0.08});
   root.querySelectorAll('[data-reveal]:not(.reveal-visible)').forEach(el=>{el.classList.add('reveal-pending');observer!.observe(el);});
  };
  initialize();motion.addEventListener('change',initialize);return ()=>{observer?.disconnect();timers.forEach(clearTimeout);motion.removeEventListener('change',initialize);};
 },[]);
 const panels=serviceGroups.filter(group=>group.id!=='agriculture');
 const agriculture=serviceGroups.find(group=>group.id==='agriculture')!;
 return <div className="services-showcase" ref={ref}>
  {panels.map(group=><section className={'engineering-panel service-panel-'+group.id} data-reveal aria-labelledby={group.id+'-services-heading'} key={group.id}><header><h2 id={group.id+'-services-heading'}>{group.title}</h2><p>{group.description}</p>{group.best&&<p className="engineering-best">{group.best}</p>}</header><div className="engineering-services-grid">{servicesByGroup(group.id).map((service,index)=><Link className="engineering-service-card" href={'/services/'+service.slug} key={service.slug} style={{'--card-order':index} as CSSProperties}><ServiceIconGlyph icon={service.icon} size={26} strokeWidth={1.5} aria-hidden="true"/><h3>{service.short}</h3><p>{service.description}</p><ul>{service.items.slice(0,3).map(item=><li key={item}>{item}</li>)}</ul><ArrowUpRight className="service-card-arrow" size={22} aria-hidden="true"/></Link>)}</div></section>)}
  <Link className="shared-service-strip" data-reveal href="/contact#enquiry"><div><h2>Not sure where to start?</h2><p>Most projects begin with one system and a focused scope. Tell us about the problem and we will suggest the right starting point.</p></div><ArrowUpRight aria-hidden="true"/></Link>
  <section className="agriculture-service-band" data-reveal aria-labelledby="agriculture-services-heading"><div className="agriculture-band-heading"><h2 id="agriculture-services-heading">{agriculture.title}</h2><Link href="/industries/agriculture" aria-label="Explore the agriculture industry"><ArrowUpRight size={18}/></Link></div><p>{agriculture.description}</p><ul>{servicesByGroup('agriculture').map(service=><li key={service.slug}><Link href={'/services/'+service.slug}><h3>{service.short}<ArrowUpRight size={15} aria-hidden="true"/></h3><p>{service.description}</p></Link></li>)}</ul></section>
 </div>;
}
