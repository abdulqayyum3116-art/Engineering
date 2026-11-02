import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {CaseStudyCard} from '@/components/case-studies';
import {getCaseStudies,getCaseStudy} from '@/lib/case-studies';
import {cleanStudyHtml} from '@/lib/case-study-html';

export const revalidate = 60;

type Props = {params: Promise<{slug: string}>};

export async function generateStaticParams() {
 const {studies} = await getCaseStudies();
 return studies.map(study => ({slug: study.slug}));
}

export async function generateMetadata({params}: Props): Promise<Metadata> {
 const {slug} = await params;
 const {study} = await getCaseStudy(slug);
 if (!study) return {};
 return {
  title: study.name,
  description: study.tagline,
  // The same article is published on the main site, which stays the search result for it.
  alternates: {canonical: `https://www.codesquad.ai/case-studies/${study.slug}`},
  openGraph: {title: `${study.name} | CodeSquad`, description: study.tagline, url: `/case-studies/${study.slug}`, ...(study.img ? {images: [study.img]} : {})},
 };
}

export default async function CaseStudyPage({params}: Props) {
 const {slug} = await params;
 const {status, study} = await getCaseStudy(slug);
 // Throwing keeps the last good page during a Supabase outage instead of caching a 404.
 if (status === 'unavailable') throw new Error('Case study unavailable');
 if (!study || !study.body) notFound();
 const {studies} = await getCaseStudies();
 const more = studies.filter(item => item.slug !== study.slug).slice(0, 3);
 return <>
  <div dangerouslySetInnerHTML={{__html: cleanStudyHtml(study.body)}}/>
  {more.length > 0 && <section className="section case-studies" aria-labelledby="more-case-studies"><h2 id="more-case-studies" className="more-studies-heading">More case studies.</h2><div className="article-grid">{more.map(item => <CaseStudyCard study={item} key={item.slug}/>)}</div></section>}
 </>;
}
