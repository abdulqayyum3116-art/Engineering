'use client';
import Link from 'next/link';
import {useState} from 'react';
import {ArrowUpRight, Menu, X} from 'lucide-react';
import {inquiry} from '@/lib/content';
export function Header(){const [open,setOpen]=useState(false);return <header className="header"><Link href="/" className="brand" aria-label="CodeSquad home"><span className="brand-icon">c<span>↗</span></span><span>codesquad<span className="brand-dot">.</span><small>ENGINEERING & AGRICULTURE</small></span></Link><button className="menu-toggle" onClick={()=>setOpen(!open)} aria-label={open?'Close navigation':'Open navigation'} aria-expanded={open}>{open?<X/>:<Menu/>}</button><nav className={open?'nav open':'nav'} aria-label="Main navigation">{[['Services','/services'],['Industries','/industries'],['Our approach','/about'],['Insights','/insights'],['Case studies','/case-studies']].map(([label,url])=><Link key={url} href={url} onClick={()=>setOpen(false)}>{label}</Link>)}<a className="button small" href={inquiry}>Let’s talk <ArrowUpRight size={16}/></a></nav></header>}
