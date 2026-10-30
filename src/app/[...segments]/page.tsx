import {EnquiryForm} from '@/components/enquiry-form';
import {FlowDiagram} from '@/components/flow-diagram';
import {SiteImage} from '@/components/site-image';
import {notFound} from 'next/navigation';
import Link from 'next/link';
import fs from 'node:fs/promises';
import path from 'node:path';
import {MDXRemote} from 'next-mdx-remote/rsc';
import {ArrowUpRight} from 'lucide-react';
import {Intro,CTA,ServiceList,TextLink} from '@/components/shared';
import {services,industries,articles,booking,origin} from '@/lib/content';
const routes=['services',...services.map(s=>'services/'+s.slug),'industries',...industries.map(i=>'industries/'+i.slug),'about','insights',...articles.map(a=>'insights/'+a.slug),'contact'];
export const dynamicParams=false;
export function generateStaticParams(){return routes.map(r=>({segments:r.split('/')}));}
const pageCopy:Record<string,{title:string;description:string}>={
 services:{title:'Engineering & Agriculture Services',description:'Software, automation and data systems for engineering firms, farms and agribusinesses.'},
 industries:{title:'Engineering & Agriculture Industries',description:'Systems shaped around operational challenges in engineering, manufacturing and agriculture.'},
 about:{title:'Our Engineering & Agriculture Approach',description:'Assess, design, build, test and deploy, then support. A practical delivery process built around your operation.'},
 insights:{title:'Engineering & Agriculture Insights',description:'Practical thinking on monitoring, field data and systems your team can use every day.'},
 contact:{title:'Discuss Your Engineering & Agriculture Project',description:'Tell CodeSquad about your operation, existing tools and the problem you want to solve.'},
};
function details(route:string){const s=services.find(s=>'services/'+s.slug===route),i=industries.find(i=>'industries/'+i.slug===route),a=articles.find(a=>'insights/'+a.slug===route);return {title:s?.short||i?.label||a?.title||pageCopy[route]?.title,description:s?.description||i?.description||a?.excerpt||pageCopy[route]?.description};}
export async function generateMetadata({params}:{params:Promise<{segments:string[]}>}){const {segments}=await params;const route=segments.join('/');const d=details(route);return {title:d.title,description:d.description,alternates:{canonical:'/'+route},openGraph:{title:d.title+' | CodeSquad',description:d.description,url:'/'+route}};}
export default async function Page({params}:{params:Promise<{segments:string[]}>}){
 const {segments}=await params;const route=segments.join('/');if(!routes.includes(route))notFound();
 const s=services.find(s=>'services/'+s.slug===route),i=industries.find(i=>'industries/'+i.slug===route),a=articles.find(a=>'insights/'+a.slug===route);const d=details(route);let body;
 if(s)body=<>
  <Intro label={'OUR SERVICES / '+s.number} title={s.title} description={s.description}/>
  <section className="section two-col"><div><span className="eyebrow">WHAT WE DELIVER</span><h2>Practical systems.<br/>A focused scope.</h2><p>Agree the requirements, data sources and acceptance criteria before the build begins.</p></div><div className="detail-list">{s.items.map((item,n)=><div key={item}><span>0{n+1}</span><h3>{item}</h3></div>)}</div></section>
  <section className="section tint"><span className="eyebrow">BUILT AROUND YOUR OPERATION</span><h2>{s.support}</h2><p>{s.detail}</p><div className="two-col">{industries.filter(i=>s.group==='shared'||i.slug===s.group).map(i=><div key={i.slug}><h3>{i.label}</h3><p>{i.description}</p><TextLink href={'/industries/'+i.slug}>Explore {i.slug}</TextLink></div>)}</div></section>
  {['industrial-automation','precision-agriculture'].includes(s.slug)&&<section className="section"><span className="eyebrow">FROM DATA TO A DECISION</span><h2>Monitoring data flow</h2><FlowDiagram kind="monitoring"/></section>}
 </>;
 else if(i)body=<div className={i.color==='green'?'agri-theme':''}>
  <Intro label={'INDUSTRY / '+i.label} title={i.title} description={i.description}/>
  <div className="wide-image"><SiteImage src={i.image} alt={i.label}/></div>
  <section className="section two-col"><div><span className="eyebrow">YOUR WORLD, UNDERSTOOD</span><h2>Operational challenges.<br/>Practical starting points.</h2></div><div className="segment-list">{i.segments.map(x=><h3 key={x}>{x}<ArrowUpRight size={20}/></h3>)}</div></section>
  {i.slug==='agriculture'?<section className="section"><span className="eyebrow">SYSTEMS THROUGH THE SEASON</span><h2>Agriculture season cycle</h2><p>Plan → Plant → Grow → Harvest → Store / Sell. Services support different stages; the scope follows your crop, conditions and operation.</p><FlowDiagram kind="season"/></section>:<section className="section"><ServiceList group="engineering"/></section>}
  <section className="section tint"><span className="eyebrow">SYSTEM CONCEPTS</span><h2>Systems we can build</h2><p className="muted">Illustrative concepts only — these are not client projects or reported results</p><div className="sample-grid">{(i.slug==='engineering'?[
   ['Live operations dashboard','A shared view of work status, capacity and outstanding tasks, with source timestamps and ownership.'],
   ['Monitoring and alerts','A sensor dashboard that flags agreed thresholds and records the response from the responsible person.'],
   ['Project reporting system','A reporting workspace that brings project updates and review notes together without repeated spreadsheet consolidation.'],
  ]:[
   ['Farm records system','Field histories, input records and daily tasks organised around the people who record and review them.'],
   ['Irrigation scheduling setup','Schedules informed by moisture and weather readings, with agreed limits and manual override.'],
   ['Crop monitoring dashboard','Field observations and available imagery data in one view, with alerts that prompt a field check.'],
  ]).map(([title,copy])=><article className="sample" key={title}><span className="eyebrow">SYSTEM CONCEPT</span><h3>{title}</h3><p>{copy}</p><span className="sample-tag">ILLUSTRATIVE CONCEPT</span></article>)}</div></section>
  {i.slug==='engineering'&&<section className="section"><span className="eyebrow">HOW WE WORK</span><h2>From assessment to support.</h2><FlowDiagram/></section>}
 </div>;
 else if(a){const content=await fs.readFile(path.join(process.cwd(),'content',a.file),'utf8');body=<><Intro label={a.category+' / '+a.read} title={a.title} description={a.excerpt}/><div className="wide-image article-banner"><SiteImage src={a.image} alt=""/></div><article className="prose"><MDXRemote source={content}/><TextLink href="/insights">Back to insights</TextLink></article><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify({'@context':'https://schema.org','@type':'Article',headline:a.title,datePublished:a.date,author:{'@type':'Organization',name:'CodeSquad'},image:a.image,url:origin+'/'+route})}}/></>}
 else if(route==='services')body=<><Intro label="WHAT WE DO" title="Engineering & agriculture services." description={pageCopy.services.description}/><section className="section"><ServiceList/></section><section className="section tint"><p>Looking for marketing, content or SEO? That now lives with the <a className="text-link" href="https://www.codesquad.ai">main CodeSquad team →</a></p></section></>;
 else if(route==='industries')body=<><Intro label="WHO WE WORK WITH" title="Grounded in your industry." description={pageCopy.industries.description}/><section className="section industry-grid">{industries.map(i=><div key={i.slug}><SiteImage className="listing-image" src={i.image} alt={i.label}/><h2>{i.label}</h2><p>{i.description}</p><TextLink href={'/industries/'+i.slug}>Explore this industry</TextLink></div>)}</section></>;
 else if(route==='about')body=<><Intro label="THE CODESQUAD APPROACH" title="Understand the operation. Build the right system." description={pageCopy.about.description}/><section className="section two-col"><h2>Better systems start<br/>with better questions.</h2><div><p>Where does work slow down? Which records are entered twice? What can your team see today, and what do they need to decide? We understand the operation before proposing a system.</p><p>Review existing tools, data, working conditions and the people who use them. Agree the problem, scope and practical constraints together, including seasonal timing for agricultural work.</p><a className="text-link" href="https://www.codesquad.ai/about">Meet the wider CodeSquad team ↗</a></div></section><section className="section tint"><span className="eyebrow">HOW WE WORK</span><h2>Delivery cycle</h2><FlowDiagram/></section></>;
 else if(route==='insights')body=<><Intro label="IDEAS FROM THE FIELD" title="Useful thinking for everyday operations." description={pageCopy.insights.description}/><section className="section article-grid">{articles.map(a=><Link className="article-card" href={'/insights/'+a.slug} key={a.slug}><SiteImage className="listing-image" src={a.image} alt=""/><span className="eyebrow">{a.category} / {a.read}</span><h2>{a.title}</h2><p>{a.excerpt}</p><span className="text-link">Read article ↗</span></Link>)}</section></>;
 else body=<><Intro label="LET’S TALK" title="Tell us about your project." description={pageCopy.contact.description}/><section className="section contact-grid"><EnquiryForm/><div className="contact-options"><h2>Prefer to choose a time?</h2><p>Book a 30-minute conversation with CodeSquad.</p><a className="text-link" href={booking}>Book a consultation ↗</a><hr/><h2>Or send us a note.</h2><a className="text-link" href="mailto:info@codesquad.ai">info@codesquad.ai</a><p>Working with businesses across the US, UK, Canada, and UAE.</p></div></section></>;
 return <><div className="breadcrumb"><Link href="/">Home</Link><span>/</span><span>{s?.short||i?.label||a?.category||route}</span></div>{body}{route!=='contact'&&<CTA/>}<script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify({'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Home',item:origin},{'@type':'ListItem',position:2,name:d.title,item:origin+'/'+route}]})}}/>{s&&<script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify({'@context':'https://schema.org','@type':'Service',name:s.short,description:s.description,provider:{'@type':'Organization',name:'CodeSquad'},url:origin+'/'+route})}}/>}</>;
}
