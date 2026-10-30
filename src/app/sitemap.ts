import {origin,services,industries,articles} from '@/lib/content';
export default function sitemap(){return ['', '/case-studies', '/services',...services.map(s=>'/services/'+s.slug),'/industries',...industries.map(i=>'/industries/'+i.slug),'/about','/insights',...articles.map(a=>'/insights/'+a.slug),'/contact'].map(r=>({url:origin+r}));}
