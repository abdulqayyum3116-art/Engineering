'use client';

import {useRef, useState, type FormEvent} from 'react';
import {services,enquiryNotice} from '@/lib/content';
import {EnquiryAvailability} from './shared';
import {ArrowUpRight} from 'lucide-react';

type FormState = {status: 'idle' | 'sending' | 'sent'} | {status: 'error'; message: string};

const serviceOptions = services.map(service=>service.short);

export function EnquiryForm() {
  const [state, setState] = useState<FormState>({status: 'idle'});
  const confirmation = useRef<HTMLParagraphElement>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state.status === 'sending') return;
    const form = event.currentTarget;
    const data = new FormData(form);
    setState({status: 'sending'});
    try {
      const response = await fetch('/api/enquiry', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({...Object.fromEntries(data), services: data.getAll('services')}),
      });
      if (!response.ok) {
        const result: {error?: string} = await response.json().catch(() => ({}));
        setState({status: 'error', message: result.error ?? 'Your enquiry could not be sent.'});
        return;
      }
      form.reset();
      setState({status: 'sent'});
      requestAnimationFrame(() => confirmation.current?.focus());
    } catch {
      setState({status: 'error', message: 'Your enquiry could not be sent. Check your connection and try again.'});
    }
  }

  return <div className="contact-panel enquiry-panel" id="enquiry">
    <span className="eyebrow">START A CONVERSATION</span>
    <h2>Tell us about your project.</h2>
    <p>Share the operation, the problem and the system you have in mind.</p>
    <p className="form-availability" id="form-availability"><EnquiryAvailability/></p>
    <form onSubmit={handleSubmit} aria-describedby="form-availability" onChange={()=>{if(state.status==='error'||state.status==='sent')setState({status:'idle'});}}>
      <div className="form-grid">
        <label htmlFor="enquiry-name"><span className="field-label">Full name <span aria-hidden="true">*</span></span><input id="enquiry-name" name="name" autoComplete="name" placeholder="Jane Smith" required maxLength={120}/></label>
        <label htmlFor="enquiry-email"><span className="field-label">Email <span aria-hidden="true">*</span></span><input id="enquiry-email" name="email" type="email" autoComplete="email" placeholder="jane@company.com" required maxLength={254}/></label>
        <label htmlFor="enquiry-phone"><span className="field-label">Phone <span aria-hidden="true">*</span></span><input id="enquiry-phone" name="phone" type="tel" autoComplete="tel" placeholder="Include country code" required pattern="\+?[0-9 .\(\)\-]{7,40}" title="Use digits, with an optional + and country code" maxLength={40}/></label>
        <label htmlFor="enquiry-company"><span className="field-label">Company <span aria-hidden="true">*</span></span><input id="enquiry-company" name="company" autoComplete="organization" placeholder="Your company name" required maxLength={160}/></label>
        <label className="form-grid-wide" htmlFor="enquiry-website"><span className="field-label">Website <span className="optional">(optional)</span></span><input id="enquiry-website" name="website" type="url" autoComplete="url" placeholder="https://yourcompany.com" maxLength={500}/></label>
      </div>
      <div className="sr-only" aria-hidden="true"><label htmlFor="enquiry-fax">Leave this field empty<input id="enquiry-fax" name="fax" tabIndex={-1} autoComplete="off"/></label></div>
      <fieldset className="service-options"><legend>What can we help with? <span className="optional">(optional)</span></legend>{serviceOptions.map(service=><label key={service}><input type="checkbox" name="services" value={service}/><span>{service}</span></label>)}</fieldset>
      <label htmlFor="enquiry-message"><span className="field-label">Tell us about your project / operation <span aria-hidden="true">*</span></span><textarea id="enquiry-message" name="message" required minLength={10} maxLength={4000} rows={5} placeholder="Tell us about your operation, existing tools and the problem you want to solve."/></label>
      <p className="form-hint">Fields marked * are required. Please avoid including sensitive information.</p>
      <button type="submit" className="button" disabled={state.status==='sending'}>{state.status==='sending'?'Sending…':'Send enquiry'} <ArrowUpRight size={18} aria-hidden="true"/></button>
      <p ref={confirmation} tabIndex={-1} role="status" aria-live="polite" className={state.status==='sent'?'form-notice form-notice-sent':state.status==='error'?'form-notice':''}>{state.status==='sent'&&'Your enquiry has been sent. We’ll be in touch using the details you gave us.'}{state.status==='error'&&<>{state.message} Your details are still here, so you can try again. {enquiryNotice}</>}</p>
      <noscript><p>This form needs JavaScript. {enquiryNotice}</p></noscript>
    </form>
  </div>;
}
