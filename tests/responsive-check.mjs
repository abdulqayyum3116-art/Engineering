// Responsive audit: every sitemap page at 14 widths (320–2560px).
// Fails on horizontal page overflow, elements outside the viewport, clipped content
// or text under 10px; reports touch targets under 32px on touch widths (<1024px).
// Run against a production server: `npm run build && npx next start -p 3107`,
// then `node tests/responsive-check.mjs` (needs the `playwright` package and Chromium).
import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)('playwright');
const base=process.env.CHECK_ORIGIN||'http://localhost:3107';
const sitemap=await (await fetch(base+'/sitemap.xml')).text();
const routes=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>new URL(m[1]).pathname);
const widths=[320,360,390,414,600,768,820,900,1024,1180,1280,1440,1920,2560];
const browser=await chromium.launch();const failures=[],warnings=new Set();
for(const width of widths){
 const page=await browser.newPage({viewport:{width,height:900}});
 page.on('pageerror',error=>failures.push(`${width} JS error: ${error.message}`));
 for(const route of routes){
  await page.goto(base+route,{waitUntil:'load'});
  const found=await page.evaluate(width=>{const out=[];const vw=document.documentElement.clientWidth;
   const name=e=>e.tagName.toLowerCase()+(typeof e.className==='string'&&e.className?'.'+e.className.trim().split(/\s+/)[0]:'');
   const clipped=e=>{for(let a=e.parentElement;a;a=a.parentElement)if(/(hidden|clip|auto|scroll)/.test(getComputedStyle(a).overflowX))return true;return false;};
   if(document.documentElement.scrollWidth>vw+1)out.push(['fail','page scrolls horizontally']);
   for(const e of document.querySelectorAll('body *')){const s=getComputedStyle(e);if(s.display==='none'||s.visibility==='hidden'||s.position==='fixed')continue;const r=e.getBoundingClientRect();if(!r.width)continue;
    if((r.right>vw+1||r.left<-1)&&!clipped(e))out.push(['fail','outside viewport: '+name(e)]);
    if(s.display!=='inline'&&e.clientWidth&&e.scrollWidth>e.clientWidth+2&&!/(hidden|auto|scroll|clip)/.test(s.overflowX)&&!['svg','img'].includes(e.tagName.toLowerCase()))out.push(['fail','content overflows: '+name(e)]);
    if([...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim())&&parseFloat(s.fontSize)<10)out.push(['fail','text under 10px: '+name(e)]);}
   if(width<1024)for(const e of document.querySelectorAll('a,button,select,textarea,summary,input:not([type=checkbox])')){const s=getComputedStyle(e);if(s.display==='none'||s.visibility==='hidden')continue;const r=e.getBoundingClientRect();if(r.width&&r.height<32&&!e.closest('p'))out.push(['warn','small touch target: '+name(e)+' "'+e.textContent.trim().slice(0,30)+'"']);}
   return out;},width);
  for(const [level,message] of found)(level==='fail'?failures.push(`${width}px ${route}: ${message}`):warnings.add(`${route}: ${message}`));
 }
 await page.close();
}
await browser.close();
for(const warning of warnings)console.warn('WARN',warning);
if(failures.length){console.error([...new Set(failures)].join('\n'));process.exit(1);}
console.log(`PASS ${routes.length} pages × ${widths.length} widths`);
