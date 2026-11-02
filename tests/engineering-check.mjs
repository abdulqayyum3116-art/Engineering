import fs from 'node:fs/promises';
import {spawn,execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
import {existingServices,services} from '../src/lib/content.ts';

// Compare the preserved catalog against the committed baseline, not a rewritten fixture.
const baseline=execFileSync('git',['show','HEAD:src/lib/content.ts'],{encoding:'utf8'});
const originalCatalog=Function('return '+baseline.match(/export const services = (\[[\s\S]*?\n\]);/)[1])();
assert.deepEqual(existingServices,originalCatalog);
const base=process.env.CHECK_ORIGIN||'http://localhost:3107';
const folder=new URL('../.browser-check-engineering/',import.meta.url);await fs.mkdir(folder,{recursive:true});
const chrome=spawn('C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',['--headless=new','--disable-gpu','--remote-debugging-port=9338','--user-data-dir='+new URL('profile/',folder).pathname.replace(/^\/([A-Z]:)/,'$1'),'about:blank'],{windowsHide:true,stdio:['ignore','ignore','pipe']});
chrome.stderr.on('data',data=>process.stderr.write(data));
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
let socket;
try{
 let target;for(let n=0;n<50;n++){try{target=await(await fetch('http://localhost:9338/json/new?about:blank',{method:'PUT'})).json();break;}catch{await pause(200);}}
 assert(target,'Browser did not start');socket=new WebSocket(target.webSocketDebuggerUrl);await new Promise(resolve=>socket.addEventListener('open',resolve,{once:true}));
 socket.addEventListener('close',event=>console.log('CDP closed',event.code,event.reason));
 let id=0;const pending=new Map(),errors=[];
 socket.addEventListener('message',({data})=>{const message=JSON.parse(data);if(message.id){const task=pending.get(message.id);pending.delete(message.id);message.error?task.reject(message.error):task.resolve(message.result);}else if(message.method==='Runtime.exceptionThrown')errors.push(message.params.exceptionDetails.text);else if(message.method==='Runtime.consoleAPICalled'&&['error','warning'].includes(message.params.type))errors.push(message.params.args.map(arg=>arg.value||arg.description).join(' '));});
 const send=(method,params={})=>new Promise((resolve,reject)=>{const requestId=++id;pending.set(requestId,{resolve,reject});socket.send(JSON.stringify({id:requestId,method,params}));});
 const evaluate=async expression=>{const result=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(result.exceptionDetails)throw Error(JSON.stringify(result.exceptionDetails));return result.result.value;};
 const navigate=async route=>{await send('Page.navigate',{url:base+route});await pause(600);for(let n=0;n<100;n++){if(await evaluate('document.readyState==="complete"'))break;await pause(100);}await pause(1000);};
 const screenshot=async(name,selector)=>{
  if(selector==='.services-showcase'&&await evaluate("Boolean(document.querySelector('.reveal-pending'))"))await evaluate(`(async()=>{for(const el of document.querySelectorAll('[data-reveal]')){el.scrollIntoView({behavior:'instant',block:'center'});await new Promise(r=>setTimeout(r,1000));}})()`);
  await evaluate(`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({behavior:'instant',block:'start'})`);await pause(1100);
  const box=await evaluate(`(()=>{const r=document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();return {x:r.x+scrollX,y:r.y+scrollY,width:r.width,height:r.height,scale:1}})()`);
  const result=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true,clip:box});await fs.writeFile(new URL(name+'.png',folder),Buffer.from(result.data,'base64'));
 };
 await send('Page.enable');await send('Runtime.enable');
 const results=[];
 for(const width of [1440,900,390]){
  await send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:false});
  for(const route of ['/','/services']){
   await navigate(route);
   assert.equal(await evaluate('document.documentElement.scrollWidth>innerWidth'),false);
   assert.equal(await evaluate('document.title'),route==='/'?'Engineering Solutions & Services | CodeSquad':'Engineering Services | CodeSquad');
   assert.equal(await evaluate('document.querySelectorAll(".engineering-service-card").length'),6);
   assert.equal(await evaluate('document.querySelectorAll(".agriculture-service-band li").length'),4);
   assert.equal(await evaluate('getComputedStyle(document.querySelector(".engineering-services-grid")).gridTemplateColumns.split(" ").length'),width===1440?3:width===900?2:1);
   const descriptions=await evaluate('Array.from(document.querySelectorAll(".engineering-service-card>p,.agriculture-service-band li p,.shared-service-strip p"),e=>e.textContent)');
   for(const service of services)assert(descriptions.includes(service.description),'Unchanged description '+service.slug);
   await screenshot((route==='/'?'home':'services')+'-showcase-'+width,'.services-showcase');
   const balance=await evaluate(`(()=>{const height=s=>document.querySelector(s).getBoundingClientRect().height;const engineering=height('.engineering-panel'),shared=height('.shared-service-strip'),agriculture=height('.agriculture-service-band');return {engineering,shared,agriculture,engineeringShare:(engineering+shared)/(engineering+shared+agriculture)*100}})()`);
   if(width===1440)assert(balance.engineeringShare>=70,'Agriculture exceeds 30%');
   results.push({route,width,balance});console.log("PASS layout",route,width,JSON.stringify(balance));
   if(route==='/'){
    await screenshot('hero-'+width,'.engineering-hero');
    const hero=await evaluate(`(()=>{const rect=s=>document.querySelector(s).getBoundingClientRect();return {agricultureFrames:document.querySelectorAll('.photo-agri').length,heroHeight:rect('.engineering-hero').height,headerHeight:rect('.header').height,ctaBottom:rect('.hero-actions').bottom,wordOpacity:[...document.querySelectorAll('.hero-word')].map(e=>getComputedStyle(e).opacity),schematic:getComputedStyle(document.querySelector('.hero-schematic')).display,marquee:getComputedStyle(document.querySelector('.marquee-track')).animationDuration}})()`);
    assert.equal(hero.agricultureFrames,0);if(width===1440)assert(Math.abs(hero.heroHeight+hero.headerHeight-900)<2,'Hero fills available viewport');assert(hero.wordOpacity.every(opacity=>opacity==='1'),'Hero words visible');if(width===1440)assert(hero.ctaBottom<900);assert.equal(hero.schematic==='none',width===390);assert.equal(hero.marquee,'30s');
    await evaluate('document.querySelector(".engineering-marquee").focus()');assert.equal(await evaluate('getComputedStyle(document.querySelector(".marquee-track")).animationPlayState'),'paused');await evaluate('document.activeElement.blur()');
    const chipStates=new Set();for(let n=0;n<7;n++){const state=await evaluate(`Array.from(document.querySelectorAll('.engineering-chips>span')).filter(e=>Number(getComputedStyle(e).opacity)>.5).map(e=>e.textContent).join('|')`);assert(!state.includes('|'),'Only one chip at a time');chipStates.add(state);await pause(1000);}assert(chipStates.has('Live monitoring')&&chipStates.has('Automation')&&chipStates.has('Asset tracking'),'All chips cycle');
    await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:width-40,y:200});await pause(500);
    const parallax=await evaluate(`parseFloat(document.querySelector('.engineering-parallax').style.getPropertyValue('--pointer-x'))`);if(width>760)assert(parallax>0&&parallax<=8);else assert.equal(parallax,0);
    const marquee=await evaluate(`(()=>{const e=document.querySelector('.engineering-marquee');e.scrollIntoView({behavior:'instant',block:'center'});const r=e.getBoundingClientRect();return {x:100,y:r.y+10}})()`);
    await send('Input.dispatchMouseEvent',{type:'mouseMoved',...marquee});assert.equal(await evaluate('getComputedStyle(document.querySelector(".marquee-track")).animationPlayState'),'paused');
    await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:0,y:0});
    const dot1=await evaluate('(()=>{const m=document.querySelector(".schematic-traveller").getCTM();return [m.e,m.f]})()');await pause(1000);const dot2=await evaluate('(()=>{const m=document.querySelector(".schematic-traveller").getCTM();return [m.e,m.f]})()');if(width!==390)assert.notDeepEqual(dot1,dot2,'Travelling dot moves');
   }
  }
 }
 for(const service of services){const response=await fetch(base+'/services/'+service.slug);assert.equal(response.status,200);}
 for(const mode of ['reduced','no-js']){
  if(mode==='reduced')await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
  else{await send('Emulation.setEmulatedMedia',{features:[]});await send('Emulation.setScriptExecutionDisabled',{value:true});}
  for(const width of [1440,390]){await send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:false});for(const route of ['/','/services']){
   await navigate(route);
   assert.equal(await evaluate(`Array.from(document.querySelectorAll('.hero-word,.hero-enter-copy,.hero-actions,.main-frame-entrance,.photo-agri,[data-reveal],.engineering-service-card')).every(e=>getComputedStyle(e).opacity==='1')`),true,mode+' visibility');
   assert.equal(await evaluate(`document.querySelector('.services-showcase').getAnimations({subtree:true}).length`),0);
   if(route==='/'){
    assert.equal(await evaluate(`document.querySelector('.engineering-hero').getAnimations({subtree:true}).length`),0);
    assert.deepEqual(await evaluate(`Array.from(document.querySelectorAll('.engineering-chips>span')).filter(e=>getComputedStyle(e).opacity==='1').map(e=>e.textContent)`),['Live monitoring']);
    assert.equal(await evaluate(`getComputedStyle(document.querySelector('.marquee-track>span+span')).display`),'none');
    await screenshot(mode+'-hero-'+width,'.engineering-hero');
   }
   await screenshot(mode+(route==='/'?'-home':'-services')+'-'+width,'.services-showcase');
  }}
 }
 assert.deepEqual(errors,[],'Browser console errors/warnings');
 await fs.writeFile(new URL('results.json',folder),JSON.stringify({results,errors,originalServicesUnchanged:true,reducedMotion:true,noJS:true},null,2));
 console.log(JSON.stringify(results,null,2));console.log('PASS engineering checks: layout, copy, routes, motion, reduced motion, no JS, clean console');
 await send('Browser.close');
}finally{socket?.close();chrome.kill();}
