'use client';

import {useEffect,useRef,type CSSProperties} from 'react';
import Link from 'next/link';
import {Settings,Gauge,Package,Wrench,Calculator,FileText,ArrowUpRight} from 'lucide-react';
import {services,serviceIcons} from '@/lib/content';
const icons={gear:Settings,gauge:Gauge,product:Package,wrench:Wrench,calculator:Calculator,document:FileText};

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
 const shared=services.find(service=>service.group==='shared')!;
 return <div className="services-showcase" ref={ref}>
  <section className="engineering-panel" data-reveal aria-labelledby="engineering-services-heading"><header><h2 id="engineering-services-heading">Engineering Services</h2><p>Software, automation and data systems for engineering firms, manufacturers and industrial teams.</p><p className="engineering-best">Best for: engineering firms · manufacturers · industrial operators</p></header><div className="engineering-services-grid">{services.filter(service=>service.group==='engineering').map((service,index)=>{const Icon=icons[serviceIcons[service.slug]];return <Link className="engineering-service-card" href={'/services/'+service.slug} key={service.slug} style={{'--card-order':index} as CSSProperties}><Icon size={26} strokeWidth={1.5} aria-hidden="true"/><h3>{service.short}</h3><p>{service.description}</p><ul>{service.items.slice(0,3).map(item=><li key={item}>{item}</li>)}</ul><ArrowUpRight className="service-card-arrow" size={22} aria-hidden="true"/></Link>;})}</div></section>
  <Link className="shared-service-strip" data-reveal href={'/services/'+shared.slug}><div><h2>Across every project — AI, Integration &amp; Support</h2><p>{shared.description}</p></div><ArrowUpRight aria-hidden="true"/></Link>
  <section className="agriculture-service-band" data-reveal aria-labelledby="agriculture-services-heading"><div className="agriculture-band-heading"><h2 id="agriculture-services-heading">Also serving agriculture</h2><Link href="/industries/agriculture" aria-label="Explore the agriculture industry"><ArrowUpRight size={18}/></Link></div><p>A specialist practice for farms and agribusinesses — farm, field and operations systems.</p><ul>{services.filter(service=>service.group==='agriculture').map(service=><li key={service.slug}><Link href={'/services/'+service.slug}><h3>{service.short}<ArrowUpRight size={15} aria-hidden="true"/></h3><p>{service.description}</p></Link></li>)}</ul></section>
 </div>;
}
