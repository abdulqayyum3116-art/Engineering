import {CaseStudies} from '@/components/case-studies';
import {Intro, CTA} from '@/components/shared';
export const revalidate = 60;
export const metadata = {
 title: 'Engineering & Agriculture Projects',
 description: 'Engineering and agriculture project studies are being prepared. Published studies will explain the challenge, system and approved outcome.',
 alternates: {canonical: '/case-studies'},
};
export default function CaseStudiesPage() {
 return <><Intro label="ENGINEERING & AGRICULTURE PROJECTS" title="More work to share soon." description="Selected engineering and agriculture projects are being prepared for publication."/><CaseStudies/><section className="section"><span className="eyebrow">WHAT A PUBLISHED STUDY WILL SHOW</span><h2>From challenge to outcome.</h2><div className="sample-grid">{[['The operation’s challenge','The working context, constraints and problem worth solving.'],['The system built','The agreed scope, how the system works and how it fits the operation.'],['The outcome','Outcomes are published only with client permission, with context and evidence.']].map(([title,copy])=><div key={title}><h3>{title}</h3><p>{copy}</p></div>)}</div></section><CTA/></>;
}
