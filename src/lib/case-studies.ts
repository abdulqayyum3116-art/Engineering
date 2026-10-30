import 'server-only';
import {cache} from 'react';
import {fetchCaseStudies} from './case-study-data';

export const getCaseStudies = cache(() => fetchCaseStudies({
  url: process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
  key: process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY,
  includeSlugs: process.env.CASE_STUDY_INCLUDE_SLUGS,
}));
