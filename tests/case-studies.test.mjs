import test from 'node:test';
import assert from 'node:assert/strict';
import {fetchCaseStudies, selectRelevantStudies, safeImageUrl} from '../src/lib/case-study-data.ts';

const study = (overrides = {}) => ({slug:'industrial-project',name:'Industrial Project',cat:'Manufacturing',filter:'Engineering',tagline:'Original client outcome',img:'/cover.jpg',published:true,...overrides});

test('selects published industry matches without relabelling other sectors', () => {
  const rows = [study(), study({slug:'farm-project',cat:'Agricultural equipment',filter:''}),study({slug:'legal-project',cat:'Legal',filter:'Legal',body:'Prompt engineering for documents'}),study({slug:'draft-project',published:false}),study({slug:'wellness-project',cat:'DTC Wellness',filter:'Healthcare'}),null,study({slug:'../bad'}),study()];
  assert.deepEqual(selectRelevantStudies(rows).map(s=>s.slug), ['industrial-project','farm-project']);
  const included = selectRelevantStudies(rows,'wellness-project,draft-project');
  assert.equal(included.length,3);
  assert.equal(included[2].cat,'DTC Wellness');
  assert.equal(included[0].img,'https://www.codesquad.ai/cover.jpg');
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
  const first=Array.from({length:100},(_,n)=>study({slug:`project-${n}`,cat:'Legal',filter:'Legal'}));
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
