import {Hero} from '@/components/hero';
import {RevealSection} from '@/components/reveal-section';
import {ServicesExplorer} from '@/components/services-explorer';
import {StartingPoints} from '@/components/starting-points';
import {FlowDiagram} from '@/components/flow-diagram';
import {CaseStudies} from '@/components/case-studies';
import {SiteImage} from '@/components/site-image';
import type {CSSProperties} from 'react';
import Link from 'next/link';
import {ArrowUpRight} from 'lucide-react';
import {CTA,TextLink} from '@/components/shared';
import {articles,servicesIntro,engineeringMetaDescription} from '@/lib/content';
export const revalidate = 60;
export const metadata={title:{absolute:'AI, Software & Engineering Solutions | CodeSquad'},description:engineeringMetaDescription,alternates:{canonical:'/'},openGraph:{title:'AI, Software & Engineering Solutions | CodeSquad',description:engineeringMetaDescription,url:'/'}};
export default function Home(){return <><Hero/><RevealSection className="section services-section"><div className="section-heading" data-reveal=""><div><span className="eyebrow">01 — HOW WE HELP</span><h2>From AI to the<br/>shop floor. Connected <span className="serif sx-draw">systems.</span></h2></div><div><p>{servicesIntro}</p><TextLink href="/services">Explore all services</TextLink></div></div><ServicesExplorer/><StartingPoints/></RevealSection><section className="approach section"><div><span className="eyebrow">02 — THE CODESQUAD APPROACH</span><h2>We learn your world.<br/>Then build for<br/><span className="serif">your reality.</span></h2><TextLink href="/about">Get to know us</TextLink></div><FlowDiagram deploymentDescription="Test in real conditions and plan deployment around operational needs, including planned downtime and site schedules where they matter."/></section><RevealSection className="section"><div className="section-heading" data-reveal=""><div><span className="eyebrow">03 — IDEAS FROM THE FIELD</span><h2>A little insight.<br/>A fresh perspective.</h2></div><TextLink href="/insights">All insights</TextLink></div><div className="insight-layout">{articles.map((a,index)=><Link className={'insight-card'+(index===0?' insight-feature':'')} href={'/insights/'+a.slug} key={a.slug} data-reveal="" style={{'--i':index} as CSSProperties}><div className="insight-image"><SiteImage src={a.image} alt="" loading="lazy"/></div><div className="insight-copy"><span className="eyebrow">{a.category} <span>/ {a.read}</span></span><h3>{a.title}</h3><span className="insight-read">Read article <ArrowUpRight size={16} aria-hidden="true"/></span></div></Link>)}</div></RevealSection><CaseStudies featured/><CTA/></>}

