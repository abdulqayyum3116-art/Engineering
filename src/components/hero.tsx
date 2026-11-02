'use client';

import {useEffect,useRef,type CSSProperties} from 'react';
import Link from 'next/link';
import {ArrowUpRight,ArrowDown,MoveUpRight} from 'lucide-react';
import {SiteImage} from './site-image';
import {industries,inquiry} from '@/lib/content';

const headline='Engineering solutions, built into systems that work.';
const capabilities='AI STRATEGY ✳ AI AGENTS & AUTOMATION ✳ GENERATIVE AI ✳ CUSTOM SOFTWARE ✳ CLOUD & DEVOPS ✳ ENGINEERING SYSTEMS ✳ FARM SYSTEMS';
export function Hero(){
 const ref=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  const root=ref.current;if(!root)return;
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  const pointer=matchMedia('(min-width: 761px) and (hover: hover) and (pointer: fine)');
  const frame=root.querySelector<HTMLElement>('.engineering-parallax');
  const reset=()=>{frame?.style.setProperty('--pointer-x','0px');frame?.style.setProperty('--pointer-y','0px');};
  const update=()=>{root.classList.toggle('motion-ready',!motion.matches);reset();};
  const move=(event:PointerEvent)=>{if(motion.matches||!pointer.matches||!frame)return;const box=root.getBoundingClientRect();frame.style.setProperty('--pointer-x',`${Math.max(-8,Math.min(8,((event.clientX-box.left)/box.width-.5)*16))}px`);frame.style.setProperty('--pointer-y',`${Math.max(-8,Math.min(8,((event.clientY-box.top)/box.height-.5)*16))}px`);};
  update();if(!motion.matches)root.classList.add('entrance-ready');
  // Release entrance styles even when a browser suspends offscreen animations.
  const entranceEnd=window.setTimeout(()=>root.classList.remove('entrance-ready'),1000);
  motion.addEventListener('change',update);pointer.addEventListener('change',reset);root.addEventListener('pointermove',move);root.addEventListener('pointerleave',reset);
  return ()=>{clearTimeout(entranceEnd);motion.removeEventListener('change',update);pointer.removeEventListener('change',reset);root.removeEventListener('pointermove',move);root.removeEventListener('pointerleave',reset);};
 },[]);
 return <div ref={ref} className="engineering-hero"><section className="hero">
  <div className="hero-copy"><span className="eyebrow"><span className="live-dot"/> ENGINEERING SOLUTIONS &amp; SERVICES.</span>
   <h1 aria-label={headline}>{headline.split(' ').map((word,index)=><span aria-hidden="true" className={'hero-word '+(word==='work.'?'serif':'')} key={index} style={{'--word-order':index} as CSSProperties}>{word}{' '}</span>)}<span aria-hidden="true" className="hero-star">✳</span></h1>
   <p className="hero-enter-copy">CodeSquad designs and builds AI, custom software, cloud and automation systems for engineering firms, manufacturers and industrial teams — from live monitoring to the tools your team uses every day. We also build systems for agricultural operations.</p>
   <div className="hero-actions"><a className="button" href={inquiry}>Let’s talk <ArrowUpRight size={18}/></a><Link className="quiet-link" href="/services">Explore our services <ArrowDown size={16}/></Link></div>
   <div className="hero-note"><span className="mini-line"/> Software. Automation. Data. Built around your operation.</div>
  </div>
  <div className="hero-visual"><div className="visual-grid"/><div className="visual-label">A NEW PERSPECTIVE ON INDUSTRY</div>
   <svg className="hero-schematic" viewBox="0 0 500 400" aria-hidden="true"><defs><mask id="schematic-reveal"><path className="schematic-mask" d="M5 300 V35 H180 V85 H280 V40 H440 V210 H370" fill="none" stroke="white" strokeWidth="6" pathLength="1"/></mask></defs><g mask="url(#schematic-reveal)"><path d="M5 300 V35 H180 V85 H280 V40 H440 V210 H370" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="5 6"/><circle cx="5" cy="300" r="4"/><circle cx="180" cy="35" r="4"/><circle cx="440" cy="40" r="4"/></g><circle className="schematic-traveller" r="5" fill="var(--lime)"><animateMotion dur="5s" repeatCount="indefinite" path="M5 300 V35 H180 V85 H280 V40 H440 V210 H370" begin="0.5s"/></circle></svg>
   <div className="engineering-parallax"><div className="main-frame-entrance"><div className="photo-industrial"><SiteImage src={industries[0].image} alt="Engineer working with industrial machinery"/><span className="frame-label">01 / ENGINEERING</span><div className="engineering-chips" aria-hidden="true">{['Live monitoring','Automation','Asset tracking'].map((chip,index)=><span key={chip} style={{'--chip-order':index} as CSSProperties}>{chip}</span>)}</div></div><div className="growth-stamp"><MoveUpRight size={28}/><span>Built for<br/><strong>what’s next.</strong></span><i aria-hidden="true">✳</i></div></div></div>
  </div>
 </section><div className="engineering-marquee" tabIndex={0} aria-label="Capabilities"><div className="marquee-track"><span>{capabilities}</span><span aria-hidden="true">{capabilities}</span></div></div></div>;
}
