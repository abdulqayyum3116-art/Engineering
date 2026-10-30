import fs from 'node:fs/promises';
import path from 'node:path';
import {spawn} from 'node:child_process';
import assert from 'node:assert/strict';
const base=process.env.CHECK_ORIGIN||'http://localhost:3107';
const folder=path.resolve('.browser-check-reposition');await fs.mkdir(folder,{recursive:true});
const chrome=spawn('C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',['--headless=new','--disable-gpu','--remote-debugging-port=9337','--user-data-dir='+folder,'about:blank'],{windowsHide:true,stdio:['ignore','ignore','pipe']});
chrome.stderr.on('data',data=>process.stderr.write(data));
const pause=ms=>new Promise(r=>setTimeout(r,ms));
let socket;
try{
 let target;for(let n=0;n<50;n++){try{target=await(await fetch('http://localhost:9337/json/new?about:blank',{method:'PUT'})).json();break;}catch{await pause(200)}}
 assert(target,'Browser did not start');socket=new WebSocket(target.webSocketDebuggerUrl);await new Promise(r=>socket.addEventListener('open',r,{once:true}));
 let id=0;const pending=new Map();const errors=[];
 socket.addEventListener('close',e=>console.log('CDP closed',e.code,e.reason));
 socket.addEventListener('message',({data})=>{const m=JSON.parse(data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(m.error):p.resolve(m.result)}else if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.text)});
 const send=(method,params={})=>new Promise((resolve,reject)=>{const requestId=++id;pending.set(requestId,{resolve,reject});socket.send(JSON.stringify({id:requestId,method,params}))});
 const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value};
 await send('Page.enable');await send('Runtime.enable');
 const xml=await(await fetch(base+'/sitemap.xml')).text();const routes=[...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>new URL(m[1]).pathname);
 const config=await fs.readFile('next.config.ts','utf8');const redirects=[...config.matchAll(/source:'([^']+)',destination:'([^']+)'/g)].map(m=>({source:m[1],destination:m[2]}));
 for(const r of redirects){const res=await fetch(base+r.source,{redirect:'manual'});assert.equal(res.status,308);assert.equal(new URL(res.headers.get('location'),base).pathname,r.destination);const final=await fetch(base+r.source);assert.equal(final.status,200);assert.equal(new URL(final.url).pathname,r.destination)}
 const results=[];
 for(const width of [1440,390]){
  await send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:false});
  for(const route of routes){
   assert.equal((await fetch(base+route)).status,200,route);
   await send('Page.navigate',{url:base+route});
   for(let n=0;n<100;n++){await pause(100);if(await evaluate('document.readyState === "complete"'))break;}
   await pause(200);
   const data=await evaluate(`(()=>{const h=[...document.querySelectorAll('main h1,main h2,main h3')].map(e=>Number(e.tagName[1]));return {title:document.title,h1:document.querySelectorAll('h1').length,overflow:document.documentElement.scrollWidth>innerWidth,headings:h,brokenImages:[...document.images].filter(i=>i.complete&&!i.naturalWidth).length,links:[...document.querySelectorAll('a[href]')].map(a=>a.getAttribute('href'))}})()`);
   assert.equal(data.h1,1,route+' h1');assert.equal(data.overflow,false,route+' overflow at '+width);assert.equal(data.brokenImages,0,route+' images');
   for(let n=1;n<data.headings.length;n++)assert(data.headings[n]<=data.headings[n-1]+1,route+' heading order');
   for(const href of data.links.filter(h=>h.startsWith('/')&&!h.startsWith('//'))){assert(routes.includes(href.split('#')[0]||'/'),route+' invalid internal link '+href)}
   await evaluate(`(async()=>{for(let y=0;y<document.documentElement.scrollHeight;y+=650){scrollTo({top:y,behavior:'instant'});await new Promise(r=>setTimeout(r,90))}await Promise.all([...document.images].map(i=>i.decode().catch(()=>{})));scrollTo({top:0,behavior:'instant'})})()`);await pause(2400);
   assert.equal(await evaluate(`document.querySelectorAll('.flow-diagram:not(.flow-visible)').length`),0,route+' flow activation');
   assert.equal(await evaluate(`document.querySelectorAll('.flow-visible .flow-node').length ? getComputedStyle(document.querySelector('.flow-node')).animationName : 'flow-light'`),'flow-light',route+' flow animation');
   const size=await send('Page.getLayoutMetrics');const png=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true,clip:{x:0,y:0,width,height:size.cssContentSize.height,scale:1}});
   const name=(route==='/'?'home':route.slice(1).replaceAll('/','-'))+'-'+width+'.png';await fs.writeFile(path.join(folder,name),Buffer.from(png.data,'base64'));
   if(route==='/'){
    await evaluate(`document.querySelector('details summary').click()`);assert.equal(await evaluate(`document.querySelector('details').open`),true);
    if(width===390){await evaluate(`document.querySelector('.menu-toggle').click()`);assert.equal(await evaluate(`document.querySelector('.menu-toggle').getAttribute('aria-expanded')`),'true');await evaluate(`document.querySelector('.menu-toggle').click()`)}
   }
   if(route==='/contact'){
    assert.equal(await evaluate(`document.querySelectorAll('input[type=checkbox]').length`),8);
    await evaluate(`document.querySelector('#enquiry-name').value='Test';document.querySelector('#enquiry-email').value='test@example.com';document.querySelector('#enquiry-company').value='Test';document.querySelector('#enquiry-industry').value='engineering';document.querySelector('#enquiry-message').value='Testing a project enquiry.';document.querySelector('form').requestSubmit()`);await pause(100);
    assert.match(await evaluate(`document.querySelector('[role=status]').textContent`),/has not been sent/);
   }
   results.push({route,width,title:data.title,screenshot:name});console.log('PASS',width,route);
  }
 }
 await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});await send('Page.navigate',{url:base+'/about'});await pause(500);assert.equal(await evaluate(`getComputedStyle(document.querySelector('.flow-node')).animationName`),'none');
 assert.equal(errors.length,0,errors.join('\n'));
 await fs.writeFile(path.join(folder,'results.json'),JSON.stringify({pages:results,redirects,errors,reducedMotion:'passed'},null,2));
 console.log('PASS',results.length,'page/viewport checks;',redirects.length,'redirects; reduced motion; no runtime exceptions');
 await send('Browser.close');
}finally{socket?.close();chrome.kill();}
