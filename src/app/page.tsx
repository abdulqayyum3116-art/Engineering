import {Hero} from '@/components/hero';
import {ServicesExplorer} from '@/components/services-explorer';
import {StartingPoints} from '@/components/starting-points';
import {FlowDiagram} from '@/components/flow-diagram';
import {CaseStudies} from '@/components/case-studies';
import {SiteImage} from '@/components/site-image';
import Link from 'next/link';
import {ArrowUpRight} from 'lucide-react';
import {CTA,TextLink} from '@/components/shared';
import {articles,servicesIntro,engineeringMetaDescription} from '@/lib/content';
export const revalidate = 60;
export const metadata={title:{absolute:'AI, Software & Engineering Solutions | CodeSquad'},description:engineeringMetaDescription,alternates:{canonical:'/'},openGraph:{title:'AI, Software & Engineering Solutions | CodeSquad',description:engineeringMetaDescription,url:'/'}};
export default function Home(){return <><Hero/><section className="section services-section"><div className="section-heading"><div><span className="eyebrow">01 — HOW WE HELP</span><h2>From AI to the<br/>shop floor. Connected <span className="serif">systems.</span></h2></div><div><p>{servicesIntro}</p><TextLink href="/services">Explore all services</TextLink></div></div><ServicesExplorer/><StartingPoints/></section><section className="approach section"><div><span className="eyebrow">02 — THE CODESQUAD APPROACH</span><h2>We learn your world.<br/>Then build for<br/><span className="serif">your reality.</span></h2><TextLink href="/about">Get to know us</TextLink></div><FlowDiagram deploymentDescription="Test in real conditions and plan deployment around operational needs, including planned downtime and site schedules where they matter."/></section><section className="section"><div className="section-heading"><div><span className="eyebrow">03 — IDEAS FROM THE FIELD</span><h2>A little insight.<br/>A fresh perspective.</h2></div><TextLink href="/insights">All insights</TextLink></div><div className="article-grid">{articles.map(a=><Link className="article-card" href={'/insights/'+a.slug} key={a.slug}><div className="article-image"><SiteImage src={a.image} alt="" loading="lazy"/><ArrowUpRight/></div><span className="eyebrow">{a.category} <span> / {a.read}</span></span><h3>{a.title}</h3></Link>)}</div></section><CaseStudies featured/><CTA/></>}

