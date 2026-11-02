import test from 'node:test';
import assert from 'node:assert/strict';
import {fetchCaseStudies, fetchCaseStudy, selectRelevantStudies, safeImageUrl} from '../src/lib/case-study-data.ts';
import {cleanStudyHtml} from '../src/lib/case-study-html.ts';

const study = (overrides = {}) => ({slug:'industrial-project',name:'Industrial Project',cat:'Manufacturing',filter:'Engineering',tagline:'Original client outcome',img:'/cover.jpg',published:true,...overrides});

test('selects published studies from every sector except healthcare, without relabelling', () => {
  const rows = [study(), study({slug:'farm-project',cat:'Agricultural equipment',filter:''}),study({slug:'legal-project',cat:'Legal',filter:'Legal',body:'A healthcare client mentioned in passing'}),study({slug:'draft-project',published:false}),study({slug:'wellness-project',cat:'DTC Wellness',filter:'Healthcare and wellness'}),null,study({slug:'../bad'}),study()];
  const selected = selectRelevantStudies(rows);
  assert.deepEqual(selected.map(s=>s.slug), ['industrial-project','farm-project','legal-project']);
  assert.equal(selected[2].cat,'Legal');
  assert.equal(selected[0].img,'https://www.codesquad.ai/cover.jpg');
});

test('excludes healthcare by category, filter or name', () => {
  const rows = [study({slug:'by-category',cat:'Dental Care',filter:'Services'}),study({slug:'by-filter',cat:'Remote Monitoring',filter:'Healthcare and wellness'}),study({slug:'by-name',name:'Clinical Gait Analysis',cat:'Research',filter:'Research'}),study({slug:'kept',cat:'Automotive Retail',filter:'Automotive'})];
  assert.deepEqual(selectRelevantStudies(rows).map(s=>s.slug), ['kept']);
});

test('engineering studies lead, then the closest studies, then database order', () => {
  const rows = [study({slug:'other-a',cat:'Legal',filter:'Legal'}),study({slug:'ipromo',cat:'Commerce',filter:'Commerce'}),study({slug:'other-b',cat:'Education',filter:'Education'}),study({slug:'settlein',cat:'Finance',filter:'Finance'}),study({slug:'engineering-project'})];
  assert.deepEqual(selectRelevantStudies(rows).map(s=>s.slug), ['engineering-project','settlein','ipromo','other-a','other-b']);
});

test('study HTML loses anything unsafe and keeps visitors on this site', () => {
  const html = cleanStudyHtml(`<article class="cs-study"><script>alert(1)</script><style>p{}</style><iframe src="https://example.com"></iframe>
    <a class="cs-study-back" href="/#case-studies" onclick="alert(1)">Back</a><a href="/inquiry">Send</a><a href="/case-studies/ipromo">Next</a><a href="/pricing">Pricing</a><a href="javascript:alert(1)">Bad</a><a href="https://calendly.com/code_squad/30min" target="_blank" rel="noopener">Book</a>
    <img src="/proof.png?v=2" alt="Proof" onerror="alert(1)"/><svg viewBox="0 0 24 24" stroke="currentColor"><path d="M7 17 17 7"></path></svg><p style="color:red">Text</p>
    <section class="cs-study-section cs-study-related"><a href="/case-studies/energybits">Hidden study</a></section></article>`);
  for (const removed of ['<script','alert(','<style','<iframe','onclick','onerror','javascript:','style=','energybits','cs-study-related']) assert.ok(!html.includes(removed),removed);
  for (const kept of ['href="/case-studies"','href="/contact#enquiry"','href="/case-studies/ipromo"','href="https://www.codesquad.ai/pricing"','href="https://calendly.com/code_squad/30min"','src="https://www.codesquad.ai/proof.png?v=2"','viewBox="0 0 24 24"','class="cs-study-back"','<p>Text</p>']) assert.ok(html.includes(kept),kept);
});

test('loads one published study with its body, by exact slug', async () => {
  const requests=[];
  const result=await fetchCaseStudy({url:'https://example.supabase.co',key:'sb_secret_test'},'settlein',async url=>{requests.push(new URL(url));return Response.json([study({slug:'settlein',cat:'Finance',filter:'Finance',body:'<p>Full article</p>'})]);});
  assert.equal(result.study.body,'<p>Full article</p>');
  assert.equal(requests[0].searchParams.get('slug'),'eq.settlein');
  assert.equal(requests[0].searchParams.get('published'),'eq.true');
  assert.ok(requests[0].searchParams.get('select').includes('body'));
});

test('hidden studies and invalid slugs have no page', async () => {
  const config={url:'https://example.supabase.co',key:'sb_secret_test'};
  const healthcare=await fetchCaseStudy(config,'energybits',async()=>Response.json([study({slug:'energybits',cat:'DTC Wellness',filter:'Healthcare and wellness',body:'<p>Article</p>'})]));
  assert.deepEqual(healthcare,{status:'ready',study:null});
  const invalid=await fetchCaseStudy(config,'../secret',async()=>{throw Error('Must not request');});
  assert.deepEqual(invalid,{status:'ready',study:null});
  const missing=await fetchCaseStudy(config,'unknown',async()=>Response.json([]));
  assert.deepEqual(missing,{status:'ready',study:null});
});

test('rejects unsafe image schemes', () => {
  assert.equal(safeImageUrl('javascript:alert(1)'),null);
  assert.equal(safeImageUrl('data:text/html,test'),null);
  assert.equal(safeImageUrl(''),null);
});

test('missing configuration never sends a request', async () => {
  const result = await fetchCaseStudies({},async()=>{throw Error('Must not request');});
  assert.equal(result.status,'unconfigured');
});

test('uses the existing table, published filter, paging, and server-side key', async () => {
  const requests=[];
  const first=Array.from({length:100},(_,n)=>study({slug:`project-${n}`,cat:'Healthcare',filter:'Healthcare'}));
  const result=await fetchCaseStudies({url:'https://example.supabase.co',key:'sb_secret_test'},async(url,options)=>{
    requests.push({url:new URL(url),options});
    return Response.json(requests.length===1?first:[study()]);
  });
  assert.equal(result.status,'ready');
  assert.equal(result.studies.length,1);
  assert.equal(requests.length,2);
  assert.equal(requests[0].url.pathname,'/rest/v1/medspa_case_studies');
  assert.equal(requests[0].url.searchParams.get('published'),'eq.true');
  assert.equal(requests[1].url.searchParams.get('offset'),'100');
  assert.equal(requests[0].options.headers.apikey,'sb_secret_test');
  assert.equal(requests[0].options.headers.Authorization,undefined);
  assert.equal(requests[0].options.next.revalidate,60);
  assert.ok(!requests[0].url.searchParams.get('select').includes('body'));
  assert.ok(!JSON.stringify(result).includes('sb_secret_test'));
});

test('legacy keys use JWT authorization and drafts remain excluded', async () => {
  const result=await fetchCaseStudies({url:'https://example.supabase.co',key:'eyJlegacy'},async(_,options)=>{
    assert.equal(options.headers.Authorization,'Bearer eyJlegacy');
    return Response.json([study({published:false})]);
  });
  assert.deepEqual(result,{status:'ready',studies:[]});
});

test('HTTP errors, malformed responses, and network failures degrade safely', async () => {
  const warning=console.warn;const logs=[];console.warn=(...args)=>logs.push(args.join(' '));
  try {
    for(const request of [async()=>new Response('private detail',{status:401}),async()=>Response.json({message:'invalid'}),async()=>{throw Error('secret or network details');}]){
      const result=await fetchCaseStudies({url:'https://example.supabase.co',key:'sb_secret_test'},request);
      assert.deepEqual(result,{status:'unavailable',studies:[]});
    }
    assert.equal(logs.length,3);
    assert.ok(!logs.join('').includes('sb_secret_test'));
    assert.ok(!logs.join('').includes('private detail'));
  } finally {console.warn=warning;}
});
