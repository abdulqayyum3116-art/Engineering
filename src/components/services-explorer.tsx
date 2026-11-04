'use client';

import {useEffect,useLayoutEffect,useRef,useState,type CSSProperties,type KeyboardEvent,type MouseEvent} from 'react';
import Link from 'next/link';
import {ArrowUpRight,Check} from 'lucide-react';
import {inquiry,serviceGroups,servicesByGroup,type ServiceGroupId} from '@/lib/content';
import {ServiceIconGlyph} from './service-icon';

const tabOrder:ServiceGroupId[]=['growth','ai','software','engineering','agriculture'];
const tabLabels:Record<ServiceGroupId,string>={growth:'Growth',ai:'AI & Automation',software:'Software & Cloud',engineering:'Engineering',agriculture:'Agriculture'};
const explorerGroups=tabOrder.map(id=>serviceGroups.find(group=>group.id===id)!);

export function ServicesExplorer(){
 const [activeGroup,setActiveGroup]=useState<ServiceGroupId>(explorerGroups[0].id);
 const [direction,setDirection]=useState(1);
 const [selected,setSelected]=useState<Record<string,string>>(()=>Object.fromEntries(explorerGroups.map(group=>[group.id,servicesByGroup(group.id)[0].slug])));
 const tabs=useRef<(HTMLButtonElement|null)[]>([]);
 const tabList=useRef<HTMLDivElement>(null);
 const stage=useRef<HTMLDivElement>(null);
 const activeIndex=explorerGroups.findIndex(group=>group.id===activeGroup);
 const choose=(index:number,focus=false)=>{if(index!==activeIndex)setDirection(index>activeIndex?1:-1);setActiveGroup(explorerGroups[index].id);const tab=tabs.current[index];if(!tab)return;if(focus)tab.focus({preventScroll:true});const list=tab.parentElement!;list.scrollTo({left:tab.offsetLeft-list.clientWidth/2+tab.offsetWidth/2,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});};
 const onTabKey=(event:KeyboardEvent<HTMLButtonElement>,index:number)=>{
  const keys:Record<string,number>={ArrowRight:index+1,ArrowLeft:index-1,Home:0,End:explorerGroups.length-1};
  if(!(event.key in keys))return;event.preventDefault();
  const next=(keys[event.key]+explorerGroups.length)%explorerGroups.length;
  choose(next,true);
 };
 // On mobile a closing accordion item can push the opened option above the sticky header.
 const keepOptionVisible=(event:MouseEvent<HTMLButtonElement>)=>{
  const option=event.currentTarget;
  requestAnimationFrame(()=>{
   if(!matchMedia('(max-width:760px)').matches)return;
   const header=document.querySelector('.header')?.getBoundingClientRect().height??0;
   const top=option.getBoundingClientRect().top;
   if(top<header+8)window.scrollBy({top:top-header-12});
  });
 };
 // Sliding pill and scroll fades. The values go straight to the DOM so the measuring never re-renders.
 useLayoutEffect(()=>{
  const list=tabList.current,tab=tabs.current[activeIndex];
  if(!list||!tab)return;
  const updateFades=()=>{
   list.classList.toggle('sx-fade-start',list.scrollLeft>2);
   list.classList.toggle('sx-fade-end',list.scrollLeft+list.clientWidth<list.scrollWidth-2);
  };
  const measure=()=>{
   list.style.setProperty('--tab-x',tab.offsetLeft+'px');
   list.style.setProperty('--tab-y',tab.offsetTop+'px');
   list.style.setProperty('--tab-w',tab.offsetWidth+'px');
   list.style.setProperty('--tab-h',tab.offsetHeight+'px');
   list.classList.add('sx-tabs-ready');
   updateFades();
  };
  measure();
  const observer=new ResizeObserver(measure);observer.observe(list);
  list.addEventListener('scroll',updateFades,{passive:true});
  let current=true;
  document.fonts?.ready.then(()=>{if(current)measure();});
  return ()=>{current=false;observer.disconnect();list.removeEventListener('scroll',updateFades);};
 },[activeIndex]);
 // Pointer spotlight: mouse-style pointers only, and never with reduced motion.
 useEffect(()=>{
  const element=stage.current;
  if(!element||!matchMedia('(hover:hover) and (pointer:fine) and (prefers-reduced-motion:no-preference)').matches)return;
  let frame=0,x=0,y=0;
  const paint=()=>{
   frame=0;
   const panel=element.querySelector('.sx-panel:not([hidden])');if(!panel)return;
   const box=panel.getBoundingClientRect();
   element.style.setProperty('--mx',x-box.left+'px');
   element.style.setProperty('--my',y-box.top+'px');
   element.classList.add('sx-spot');
  };
  const onMove=(event:PointerEvent)=>{x=event.clientX;y=event.clientY;if(!frame)frame=requestAnimationFrame(paint);};
  const onLeave=()=>{if(frame){cancelAnimationFrame(frame);frame=0;}element.classList.remove('sx-spot');};
  element.addEventListener('pointermove',onMove,{passive:true});
  element.addEventListener('pointerleave',onLeave);
  return ()=>{if(frame)cancelAnimationFrame(frame);element.removeEventListener('pointermove',onMove);element.removeEventListener('pointerleave',onLeave);};
 },[]);
 return <div className="services-explorer">
  <div ref={tabList} className="sx-tabs" role="tablist" aria-label="Service areas" data-reveal="">{explorerGroups.map((group,index)=>{const active=group.id===activeGroup;return <button key={group.id} ref={el=>{tabs.current[index]=el;}} type="button" role="tab" id={'sx-tab-'+group.id} aria-controls={'sx-panel-'+group.id} aria-selected={active} tabIndex={active?0:-1} className={'sx-tab'+(active?' active':'')} onClick={()=>choose(index)} onKeyDown={event=>onTabKey(event,index)}>{tabLabels[group.id]}<span className="sx-count">{servicesByGroup(group.id).length}</span></button>;})}</div>
  <div ref={stage} className="sx-stage" data-reveal="" style={{'--sx-dir':direction} as CSSProperties}>
  {explorerGroups.map(group=>{const list=servicesByGroup(group.id);const current=selected[group.id];return <section key={group.id} className={'sx-panel sx-panel-'+group.id} role="tabpanel" id={'sx-panel-'+group.id} aria-labelledby={'sx-tab-'+group.id} hidden={group.id!==activeGroup}>
   <header className="sx-intro"><h3>{group.id==='agriculture'?'Agriculture & agribusiness':group.title}</h3><p>{group.description}</p></header>
   <div className="sx-body" style={{'--sx-rows':list.length} as CSSProperties}>{list.map((service,index)=>{const open=service.slug===current;return <div className="sx-item" key={service.slug}>
    <button type="button" className={'sx-option'+(open?' active':'')} style={{'--i':index} as CSSProperties} aria-expanded={open} aria-controls={'sx-detail-'+service.slug} onClick={event=>{setSelected(state=>({...state,[group.id]:service.slug}));keepOptionVisible(event);}}><ServiceIconGlyph icon={service.icon} size={20} strokeWidth={1.6} aria-hidden="true"/><span>{service.short}</span><ArrowUpRight className="sx-option-arrow" size={16} aria-hidden="true"/></button>
    <article className={'sx-detail'+(open?' is-open':'')} id={'sx-detail-'+service.slug}>
     <span className="sx-ghost" aria-hidden="true">{String(index+1).padStart(2,'0')}</span>
     <div className="sx-detail-top"><span className="sx-icon"><ServiceIconGlyph icon={service.icon} size={30} strokeWidth={1.4} aria-hidden="true"/></span><span className="sx-number">{String(index+1).padStart(2,'0')} / {String(list.length).padStart(2,'0')} · {tabLabels[group.id].toUpperCase()}</span></div>
     <h4>{service.title}</h4>
     <p className="sx-description">{service.description}</p>
     <ul className="sx-deliverables">{service.items.map((item,itemIndex)=><li key={item} style={{'--i':itemIndex} as CSSProperties}><Check size={15} aria-hidden="true"/>{item}</li>)}</ul>
     <div className="sx-approach"><span className="eyebrow">HOW WE APPROACH IT</span><strong>{service.support}</strong><p>{service.detail}</p></div>
     <div className="sx-actions"><Link className="button small sx-primary" href={'/services/'+service.slug}>View service details<span className="sr-only">: {service.short}</span> <ArrowUpRight size={16} aria-hidden="true"/></Link><a className="sx-secondary" href={inquiry}>Discuss a project</a></div>
    </article>
   </div>;})}</div>
  </section>;})}
  </div>
 </div>;
}
