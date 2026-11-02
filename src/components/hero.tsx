'use client';

import {useEffect,useRef,type CSSProperties} from 'react';
import Link from 'next/link';
import {ArrowUpRight,ArrowDown} from 'lucide-react';
import {inquiry} from '@/lib/content';

const headline='Engineering solutions, built into systems that work.';
const capabilities='AI STRATEGY ✳ AI AGENTS & AUTOMATION ✳ GENERATIVE AI ✳ CUSTOM SOFTWARE ✳ CLOUD & DEVOPS ✳ ENGINEERING SYSTEMS ✳ FARM SYSTEMS';
export function Hero(){
 const ref=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  const root=ref.current;if(!root)return;
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  const update=()=>root.classList.toggle('motion-ready',!motion.matches);
  update();if(!motion.matches)root.classList.add('entrance-ready');
  // Release entrance styles even when a browser suspends offscreen animations.
  const entranceEnd=window.setTimeout(()=>root.classList.remove('entrance-ready'),1000);
  motion.addEventListener('change',update);
  return ()=>{clearTimeout(entranceEnd);motion.removeEventListener('change',update);};
 },[]);
 return <div ref={ref} className="engineering-hero"><section className="hero hero-centered">
  <div className="hero-copy"><span className="eyebrow"><span className="live-dot"/> AI, SOFTWARE &amp; ENGINEERING SOLUTIONS.</span>
   <h1 aria-label={headline}>{headline.split(' ').map((word,index)=><span aria-hidden="true" className={'hero-word '+(word==='work.'?'serif':'')} key={index} style={{'--word-order':index} as CSSProperties}>{word}{' '}</span>)}<span aria-hidden="true" className="hero-star">✳</span></h1>
   <p className="hero-enter-copy">CodeSquad designs and builds AI, custom software, cloud and automation systems for engineering firms, manufacturers and industrial teams — from live monitoring to the tools your team uses every day. We also build systems for agricultural operations.</p>
   <div className="hero-actions"><a className="button" href={inquiry}>Let’s talk <ArrowUpRight size={18}/></a><Link className="quiet-link" href="/services">Explore our services <ArrowDown size={16}/></Link></div>
   <div className="hero-note"><span className="mini-line"/> Software. Automation. Data. Built around your operation.</div>
  </div>
 </section><div className="engineering-marquee" tabIndex={0} aria-label="Capabilities"><div className="marquee-track"><span>{capabilities}</span><span aria-hidden="true">{capabilities}</span></div></div></div>;
}
