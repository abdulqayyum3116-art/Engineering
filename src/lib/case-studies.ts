import 'server-only';
import {cache} from 'react';
import {fetchCaseStudies,fetchCaseStudy} from './case-study-data';

const config = () => ({
  url: process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
  key: process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY,
});

export const getCaseStudies = cache(() => fetchCaseStudies(config()));
export const getCaseStudy = cache((slug: string) => fetchCaseStudy(config(), slug));
