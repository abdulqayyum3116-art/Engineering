import type { NextConfig } from 'next';
const config: NextConfig = {
 turbopack:{rules:{'*.css':{loaders:['@tailwindcss/turbopack'],as:'*.css'}}},
 async redirects(){return [
  {source:'/services/engineering-software',destination:'/services/custom-software-development',permanent:true},
  {source:'/services/ai-automation',destination:'/services/ai-agents-automation',permanent:true},
  {source:'/services/content-creation',destination:'/services',permanent:true},
  {source:'/services/seo',destination:'/services/seo-aeo-geo',permanent:true},
  {source:'/services/social-media',destination:'/services',permanent:true},
  {source:'/services/paid-media-lead-generation',destination:'/services/lead-generation-ads',permanent:true},
  {source:'/insights/technical-content-for-engineering-buyers',destination:'/insights/industrial-automation-monitoring',permanent:true},
  {source:'/insights/agricultural-marketing-seasonal-demand',destination:'/insights/precision-agriculture-data',permanent:true},
  {source:'/insights/expertise-to-qualified-enquiries',destination:'/insights/farm-records-systems',permanent:true},
 ];}
};
export default config;
