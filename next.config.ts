import type { NextConfig } from 'next';
const config: NextConfig = {
 turbopack:{rules:{'*.css':{loaders:['@tailwindcss/turbopack'],as:'*.css'}}},
 async redirects(){return [
  {source:'/services/content-creation',destination:'/services',permanent:true},
  {source:'/services/seo',destination:'/services',permanent:true},
  {source:'/services/social-media',destination:'/services',permanent:true},
  {source:'/services/paid-media-lead-generation',destination:'/services',permanent:true},
  {source:'/insights/technical-content-for-engineering-buyers',destination:'/insights/industrial-automation-monitoring',permanent:true},
  {source:'/insights/agricultural-marketing-seasonal-demand',destination:'/insights/precision-agriculture-data',permanent:true},
  {source:'/insights/expertise-to-qualified-enquiries',destination:'/insights/farm-records-systems',permanent:true},
 ];}
};
export default config;
