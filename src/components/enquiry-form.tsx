'use client';

import {useState, type FormEvent} from 'react';
import {services,enquiryNotice} from '@/lib/content';
import {EnquiryAvailability} from './shared';
import {ArrowUpRight} from 'lucide-react';

export type EnquiryPayload = {
  name: string;
  email: string;
  phone: string;
  company: string;
  website: string;
  industry: string;
  services: string[];
  message: string;
  source: 'engineering.codesquad.ai';
};

const serviceOptions = services.map(service=>service.short);

export function EnquiryForm() {
  const [notice, setNotice] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // Connect to the shared CodeSquad backend here when its contract is supplied.
    // Do not persist personal data or claim delivery before that integration exists.
    setNotice('Your enquiry has not been sent. '+enquiryNotice);
  }

  return <div className="contact-panel enquiry-panel" id="enquiry">
    <span className="eyebrow">START A CONVERSATION</span>
    <h2>Tell us about your project.</h2>
    <p>Share the operation, the problem and the system you have in mind.</p>
    <p className="form-availability" id="form-availability"><EnquiryAvailability/></p>
    <form onSubmit={handleSubmit} aria-describedby="form-availability" onChange={()=>setNotice('')}>
      <div className="form-grid">
        <label htmlFor="enquiry-name">Full name <span aria-hidden="true">*</span><input id="enquiry-name" name="name" autoComplete="name" placeholder="Jane Smith" required maxLength={120}/></label>
        <label htmlFor="enquiry-email">Email <span aria-hidden="true">*</span><input id="enquiry-email" name="email" type="email" autoComplete="email" placeholder="jane@company.com" required maxLength={254}/></label>
        <label htmlFor="enquiry-phone">Phone <span className="optional">(optional)</span><input id="enquiry-phone" name="phone" type="tel" autoComplete="tel" placeholder="Include country code" maxLength={40}/></label>
        <label htmlFor="enquiry-company">Company <span aria-hidden="true">*</span><input id="enquiry-company" name="company" autoComplete="organization" placeholder="Your company name" required maxLength={160}/></label>
        <label htmlFor="enquiry-industry">Industry <span aria-hidden="true">*</span><select id="enquiry-industry" name="industry" required defaultValue=""><option value="" disabled>Select your industry</option><option value="engineering">Engineering & consulting</option><option value="manufacturing">Manufacturing & industrial supply</option><option value="agriculture">Agriculture & agribusiness</option><option value="other">Other</option></select></label>
        <label htmlFor="enquiry-website">Website <span className="optional">(optional)</span><input id="enquiry-website" name="website" type="url" autoComplete="url" placeholder="https://yourcompany.com" maxLength={500}/></label>
      </div>
      <fieldset className="service-options"><legend>What can we help with? <span className="optional">(optional)</span></legend>{serviceOptions.map(service=><label key={service}><input type="checkbox" name="services" value={service}/><span>{service}</span></label>)}</fieldset>
      <label htmlFor="enquiry-message">Tell us about your project / operation <span aria-hidden="true">*</span><textarea id="enquiry-message" name="message" required minLength={10} maxLength={4000} rows={5} placeholder="Tell us about your operation, existing tools and the problem you want to solve."/></label>
      <p className="form-hint">Fields marked * are required. Please avoid including sensitive information.</p>
      <button type="submit" className="button">Check enquiry details <ArrowUpRight size={18}/></button>
      <p role="status" aria-live="polite" className={notice?'form-notice':''}>{notice}</p>
      <noscript><p>{enquiryNotice}</p></noscript>
    </form>
  </div>;
}
