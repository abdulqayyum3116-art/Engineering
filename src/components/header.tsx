'use client';
import Link from 'next/link';
import Image from 'next/image';
import {usePathname} from 'next/navigation';
import {useEffect,useState} from 'react';
import {ArrowUpRight, Menu, X} from 'lucide-react';
import {inquiry} from '@/lib/content';
import {HomeLink} from './home-link';
const isCurrent=(url:string,path:string)=>url==='/'?path==='/':path===url||path.startsWith(url+'/');
export function Header(){const [open,setOpen]=useState(false);const [scrolled,setScrolled]=useState(false);const path=usePathname();useEffect(()=>{const update=()=>setScrolled(window.scrollY>12);update();window.addEventListener('scroll',update,{passive:true});return ()=>window.removeEventListener('scroll',update);},[]);return <header className={'header'+(scrolled||open?' is-glass':'')}><HomeLink className="brand" aria-label="CodeSquad home" onClick={()=>setOpen(false)}><Image src="/logo.png" alt="CodeSquad" width={184} height={40} style={{width:'auto'}} priority className="brand-logo"/></HomeLink><button className="menu-toggle" onClick={()=>setOpen(!open)} aria-label={open?'Close navigation':'Open navigation'} aria-expanded={open}>{open?<X/>:<Menu/>}</button><nav className={open?'nav open':'nav'} aria-label="Main navigation">{[['Home','/'],['Services','/services'],['Our approach','/about'],['Insights','/insights'],['Case studies','/case-studies']].map(([label,url])=>url==='/'?<HomeLink key={url} aria-current={isCurrent(url,path)?'page':undefined} onClick={()=>setOpen(false)}>{label}</HomeLink>:<Link key={url} href={url} aria-current={isCurrent(url,path)?'page':undefined} onClick={()=>setOpen(false)}>{label}</Link>)}<a className="button small" href={inquiry}>Let’s talk <ArrowUpRight size={16}/></a></nav></header>}
