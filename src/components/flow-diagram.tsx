'use client';
import {useEffect,useRef,useState,type CSSProperties} from 'react';
import Link from 'next/link';
import {deliverySteps,services} from '@/lib/content';

type Node = {title:string;description?:string;slugs?:string[]};
const season:Node[] = [
 {title:'Plan',slugs:['farm-management','agribusiness-systems']},
 {title:'Plant',slugs:['farm-management','smart-irrigation']},
 {title:'Grow',slugs:['farm-management','precision-agriculture','smart-irrigation']},
 {title:'Harvest',slugs:['farm-management','agribusiness-systems']},
 {title:'Store / Sell',slugs:['agribusiness-systems']},
];
const monitoring:Node[] = [
 {title:'Sensors / field & machine data',description:'Collect readings and show source freshness.'},
 {title:'Dashboard',description:'Bring conditions and context into view.'},
 {title:'Alerts',description:'Flag agreed thresholds to the right person.'},
 {title:'Action',description:'Review, respond and record what happens.'},
];
export function FlowDiagram({kind='delivery'}:{kind?:'delivery'|'season'|'monitoring'}){
 const ref=useRef<HTMLOListElement>(null);
 const [visible,setVisible]=useState(false);
 useEffect(()=>{
  const element=ref.current;
  if(!element)return;
  const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){setVisible(true);observer.disconnect();}},{threshold:0.15});
  observer.observe(element);
  return ()=>observer.disconnect();
 },[]);
 const nodes:Node[]=kind==='delivery'?deliverySteps:kind==='season'?season:monitoring;
 return <ol ref={ref} className={'flow-diagram '+(kind==='delivery'?'steps ':'')+(visible?'flow-visible':'')} aria-label={kind==='delivery'?'Delivery cycle':kind==='season'?'Agriculture season cycle':'Monitoring data flow'}>{nodes.map((node,n)=><li className="flow-node" key={node.title} style={{'--flow-order':n} as CSSProperties}><span className="flow-number">0{n+1} <span aria-hidden="true">✳</span></span><h3>{node.title}</h3>{node.description&&<p>{node.description}</p>}{node.slugs&&<ul>{node.slugs.map(slug=><li key={slug}><Link href={'/services/'+slug}>{services.find(s=>s.slug===slug)?.short}</Link></li>)}</ul>}{n<nodes.length-1&&<span className="flow-arrow" aria-hidden="true">↓</span>}</li>)}</ol>;
}
