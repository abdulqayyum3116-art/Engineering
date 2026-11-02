'use client';

import {useEffect,useRef,useState} from 'react';
import Link from 'next/link';
import {ArrowUpRight,Check} from 'lucide-react';
import {inquiry,serviceProblems,services} from '@/lib/content';

// Problems are links to their service row, so the picker still works without JavaScript.
export function ServiceFinder(){
 const [selected,setSelected]=useState(serviceProblems[0].slug);
 const [changed,setChanged]=useState(false);
 const answer=useRef<HTMLDivElement>(null);
 const service=services.find(item=>item.slug===selected)!;
 // On phones the stacked problems push the answer off-screen, so bring it into view.
 useEffect(()=>{if(changed&&matchMedia('(max-width:700px)').matches)answer.current?.scrollIntoView({block:'nearest',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});},[selected,changed]);
 return <div className="service-finder">
  <h2>What’s getting in your way?</h2>
  <ul className="finder-problems">{serviceProblems.map(problem=><li key={problem.slug}><a href={'#'+problem.slug} aria-current={problem.slug===selected?'true':undefined} onClick={event=>{event.preventDefault();setSelected(problem.slug);setChanged(true);}}>{problem.label}</a></li>)}</ul>
  <div aria-live="polite" ref={answer}><article className={'finder-answer'+(changed?' changed':'')} key={service.slug}>
   <div className="finder-summary"><p className="finder-kicker">A good place to start</p><h3>{service.title}</h3><p>{service.description}</p><div className="finder-actions"><Link className="button" href={'/services/'+service.slug}>View this service<span className="sr-only">: {service.short}</span> <ArrowUpRight size={18} aria-hidden="true"/></Link><a className="finder-secondary" href={inquiry}>Discuss a project</a></div></div>
   <div className="finder-includes"><p className="finder-kicker">What you get</p><ul>{service.items.map(item=><li key={item}><Check size={17} aria-hidden="true"/>{item}</li>)}</ul></div>
  </article></div>
  <p className="finder-note">Not sure which fits? <Link href={inquiry}>Tell us about the problem</Link> and we’ll suggest a starting point.</p>
 </div>;
}
