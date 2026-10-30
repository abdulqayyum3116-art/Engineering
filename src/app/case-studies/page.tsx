import {CaseStudies} from '@/components/case-studies';
import {Intro, CTA} from '@/components/shared';
export const revalidate = 60;
export const metadata = {
  title: 'Case studies',
  description: 'Selected CodeSquad client work relevant to engineering, manufacturing, and agriculture. Explore the original projects and their outcomes.',
  alternates: {canonical: '/case-studies'},
};
export default function CaseStudiesPage() {
  return <><Intro label="CODESQUAD CLIENT WORK" title="Real projects. Useful perspectives." description="Selected work relevant to engineering and agriculture, including transferable approaches from other sectors. Each project retains its original industry context; read the full story on CodeSquad."/><CaseStudies/><CTA/></>;
}
