import {CaseStudies} from '@/components/case-studies';
import {Intro, CTA} from '@/components/shared';
import {getCaseStudies} from '@/lib/case-studies';
export const revalidate = 60;
export const metadata = {
 title: 'Case Studies',
 description: 'Selected systems CodeSquad has built, including document processing, remote monitoring, data aggregation and automated pipelines.',
 alternates: {canonical: '/case-studies'},
};
export default async function CaseStudiesPage() {
 const {studies}=await getCaseStudies();
 if(studies.length)return <><Intro label="CASE STUDIES" title="Systems we’ve built." description="Technical systems CodeSquad has delivered, shown with the industry each was built for. The same approach to documents, monitoring, data and automation carries over to engineering work."/><CaseStudies/><CTA/></>;
 return <><Intro label="CASE STUDIES" title="More work to share soon." description="Selected engineering projects are being prepared for publication."/><CaseStudies/><section className="section"><span className="eyebrow">WHAT A PUBLISHED STUDY WILL SHOW</span><h2>From challenge to outcome.</h2><div className="sample-grid">{[['The operation’s challenge','The working context, constraints and problem worth solving.'],['The system built','The agreed scope, how the system works and how it fits the operation.'],['The outcome','Outcomes are published only with client permission, with context and evidence.']].map(([title,copy])=><div key={title}><h3>{title}</h3><p>{copy}</p></div>)}</div></section><CTA/></>;
}
