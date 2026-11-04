'use client';

import {useEffect,useRef,type ReactNode} from 'react';

// Fades [data-reveal] children in as they reach the viewport. Content is only hidden once
// motion-ready is set, so it stays visible without JavaScript or with reduced motion.
export function RevealSection({className,children}:{className?:string;children:ReactNode}){
 const ref=useRef<HTMLElement>(null);
 useEffect(()=>{
  const root=ref.current;
  if(!root||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  root.classList.add('motion-ready');
  const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){entry.target.classList.add('in-view');observer.unobserve(entry.target);}},{rootMargin:'0px 0px -8% 0px'});
  root.querySelectorAll('[data-reveal]').forEach(element=>observer.observe(element));
  return ()=>observer.disconnect();
 },[]);
 return <section ref={ref} className={className}>{children}</section>;
}
