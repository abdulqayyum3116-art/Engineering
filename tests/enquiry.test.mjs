import test from 'node:test';
import assert from 'node:assert/strict';
import {saveEnquiry, validateEnquiry} from '../src/lib/enquiry.ts';

const known=['CRM & Business Systems','SEO, AEO & GEO'];
const input=(overrides={})=>({name:' Jane Smith ',email:'jane@company.com',phone:'+44 20 7946 0958',company:'Acme Engineering',website:'https://acme.example',services:['CRM & Business Systems','Not a service'],message:'We need a maintenance system.',...overrides});
const config={url:'https://example.supabase.co',key:'sb_secret_test'};

test('accepts a complete enquiry, trims text and keeps only known services',()=>{
  const result=validateEnquiry(input(),known);
  assert.equal(result.ok,true);
  assert.equal(result.enquiry.name,'Jane Smith');
  assert.deepEqual(result.enquiry.services,['CRM & Business Systems']);
  assert.ok(!('industry' in result.enquiry));
});

test('phone is required and must look like a phone number',()=>{
  for(const phone of ['','   ','12345','not a number','123456789012345678','+1 (941) 555-0100x'])assert.equal(validateEnquiry(input({phone}),known).ok,false,phone);
  for(const phone of ['+1 (941) 555-0100','0300 1234567','+92-300-1234567'])assert.equal(validateEnquiry(input({phone}),known).ok,true,phone);
});

test('rejects missing or invalid fields',()=>{
  for(const overrides of [{name:''},{email:'nope'},{email:''},{company:''},{message:'short'},{message:'x'.repeat(4001)},{website:'javascript:alert(1)'},{website:'acme'}])assert.equal(validateEnquiry(input(overrides),known).ok,false,JSON.stringify(overrides));
  for(const value of [null,'text',42])assert.equal(validateEnquiry(value,known).ok,false);
  assert.equal(validateEnquiry(input({website:''}),known).ok,true);
});

test('saves to the main site lead table in its existing shape',async()=>{
  const requests=[];
  const {enquiry}=validateEnquiry(input(),known);
  const result=await saveEnquiry(config,enquiry,async(url,options)=>{requests.push({url:new URL(url),options});return new Response(null,{status:201});});
  assert.equal(result,'saved');
  assert.equal(requests[0].url.pathname,'/rest/v1/medspa_leads');
  assert.equal(requests[0].options.method,'POST');
  assert.equal(requests[0].options.headers.apikey,'sb_secret_test');
  assert.deepEqual(JSON.parse(requests[0].options.body),{name:'Jane Smith',email:'jane@company.com',source:'engineering.codesquad.ai',payload:{phone:'+44 20 7946 0958',message:'We need a maintenance system.',business:'Acme Engineering',website:'https://acme.example',services:['CRM & Business Systems']}});
});

test('legacy keys also send JWT authorization',async()=>{
  const {enquiry}=validateEnquiry(input(),known);
  await saveEnquiry({...config,key:'eyJlegacy'},enquiry,async(_,options)=>{assert.equal(options.headers.Authorization,'Bearer eyJlegacy');return new Response(null,{status:201});});
});

test('missing configuration never sends a request',async()=>{
  const {enquiry}=validateEnquiry(input(),known);
  assert.equal(await saveEnquiry({},enquiry,async()=>{throw Error('Must not request');}),'unconfigured');
});

test('failures report safely without logging enquiry details or secrets',async()=>{
  const {enquiry}=validateEnquiry(input(),known);
  const warning=console.warn;const logs=[];console.warn=(...args)=>logs.push(args.join(' '));
  try{
    for(const request of [async()=>new Response('private detail',{status:401}),async()=>{throw Error('secret');}])assert.equal(await saveEnquiry(config,enquiry,request),'failed');
    const text=logs.join('');
    for(const hidden of ['jane@company.com','+44 20','sb_secret_test','private detail'])assert.ok(!text.includes(hidden),hidden);
  }finally{console.warn=warning;}
});
