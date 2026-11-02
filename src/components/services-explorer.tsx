'use client';

import {useRef,useState,type CSSProperties,type KeyboardEvent} from 'react';
import Link from 'next/link';
import {ArrowUpRight,Check} from 'lucide-react';
import {inquiry,serviceGroups,servicesByGroup,type ServiceGroupId} from '@/lib/content';
import {ServiceIconGlyph} from './service-icon';

const tabLabels:Record<ServiceGroupId,string>={ai:'AI & Automation',software:'Software & Cloud',engineering:'Engineering',agriculture:'Agriculture'};

export function ServicesExplorer(){
 const [activeGroup,setActiveGroup]=useState<ServiceGroupId>(serviceGroups[0].id);
 const [selected,setSelected]=useState<Record<string,string>>(()=>Object.fromEntries(serviceGroups.map(group=>[group.id,servicesByGroup(group.id)[0].slug])));
 const tabs=useRef<(HTMLButtonElement|null)[]>([]);
 const choose=(index:number,focus=false)=>{setActiveGroup(serviceGroups[index].id);const tab=tabs.current[index];if(!tab)return;if(focus)tab.focus({preventScroll:true});const list=tab.parentElement!;list.scrollTo({left:tab.offsetLeft-list.clientWidth/2+tab.offsetWidth/2,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});};
 const onTabKey=(event:KeyboardEvent<HTMLButtonElement>,index:number)=>{
  const keys:Record<string,number>={ArrowRight:index+1,ArrowLeft:index-1,Home:0,End:serviceGroups.length-1};
  if(!(event.key in keys))return;event.preventDefault();
  const next=(keys[event.key]+serviceGroups.length)%serviceGroups.length;
  choose(next,true);
 };
 return <div className="services-explorer">
  <div className="sx-tabs" role="tablist" aria-label="Service areas">{serviceGroups.map((group,index)=>{const active=group.id===activeGroup;return <button key={group.id} ref={el=>{tabs.current[index]=el;}} type="button" role="tab" id={'sx-tab-'+group.id} aria-controls={'sx-panel-'+group.id} aria-selected={active} tabIndex={active?0:-1} className={'sx-tab'+(active?' active':'')} onClick={()=>choose(index)} onKeyDown={event=>onTabKey(event,index)}>{tabLabels[group.id]}<span className="sx-count">{servicesByGroup(group.id).length}</span></button>;})}</div>
  {serviceGroups.map(group=>{const list=servicesByGroup(group.id);const current=selected[group.id];return <section key={group.id} className={'sx-panel sx-panel-'+group.id} role="tabpanel" id={'sx-panel-'+group.id} aria-labelledby={'sx-tab-'+group.id} hidden={group.id!==activeGroup}>
   <header className="sx-intro"><h3>{group.id==='agriculture'?'Agriculture & agribusiness':group.title}</h3><p>{group.description}</p></header>
   <div className="sx-body" style={{'--sx-rows':list.length} as CSSProperties}>{list.map((service,index)=>{const open=service.slug===current;return <div className="sx-item" key={service.slug}>
    <button type="button" className={'sx-option'+(open?' active':'')} aria-expanded={open} aria-controls={'sx-detail-'+service.slug} onClick={()=>setSelected(state=>({...state,[group.id]:service.slug}))}><ServiceIconGlyph icon={service.icon} size={20} strokeWidth={1.6} aria-hidden="true"/><span>{service.short}</span><ArrowUpRight className="sx-option-arrow" size={16} aria-hidden="true"/></button>
    <article className="sx-detail" id={'sx-detail-'+service.slug} hidden={!open}>
     <div className="sx-detail-top"><span className="sx-icon"><ServiceIconGlyph icon={service.icon} size={30} strokeWidth={1.4} aria-hidden="true"/></span><span className="sx-number">{String(index+1).padStart(2,'0')} / {String(list.length).padStart(2,'0')} · {tabLabels[group.id].toUpperCase()}</span></div>
     <h4>{service.title}</h4>
     <p className="sx-description">{service.description}</p>
     <ul className="sx-deliverables">{service.items.map(item=><li key={item}><Check size={15} aria-hidden="true"/>{item}</li>)}</ul>
     <div className="sx-approach"><span className="eyebrow">HOW WE APPROACH IT</span><strong>{service.support}</strong><p>{service.detail}</p></div>
     <div className="sx-actions"><Link className="button small sx-primary" href={'/services/'+service.slug}>View service details<span className="sr-only">: {service.short}</span> <ArrowUpRight size={16} aria-hidden="true"/></Link><a className="sx-secondary" href={inquiry}>Discuss a project</a></div>
    </article>
   </div>;})}</div>
  </section>;})}
 </div>;
}
