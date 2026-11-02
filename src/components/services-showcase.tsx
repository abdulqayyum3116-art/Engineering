import Link from 'next/link';
import {ArrowUpRight} from 'lucide-react';
import {serviceGroups,servicesByGroup} from '@/lib/content';

export function ServicesShowcase(){
 const panels=serviceGroups.filter(group=>group.id!=='agriculture');
 const agriculture=serviceGroups.find(group=>group.id==='agriculture')!;
 return <div className="services-showcase">
  {panels.map(group=><section className="directory-group" aria-labelledby={group.id+'-services-heading'} key={group.id}><header><h2 id={group.id+'-services-heading'}>{group.title}</h2><p>{group.description}</p>{group.best&&<p className="directory-best">{group.best}</p>}</header><div className="directory-rows">{servicesByGroup(group.id).map(service=><Link className="service-line" id={service.slug} href={'/services/'+service.slug} key={service.slug}><h3>{service.short}</h3><div><p>{service.description}</p><ul>{service.items.slice(0,3).map(item=><li key={item}>{item}</li>)}</ul></div><ArrowUpRight size={24} aria-hidden="true"/></Link>)}</div></section>)}
  <section className="services-agriculture" aria-labelledby="agriculture-services-heading"><header><h2 id="agriculture-services-heading">{agriculture.title}</h2><p>{agriculture.description}</p><Link href="/industries/agriculture">Explore agriculture <ArrowUpRight size={16} aria-hidden="true"/></Link></header><ul>{servicesByGroup('agriculture').map(service=><li key={service.slug}><Link id={service.slug} href={'/services/'+service.slug}><h3>{service.short}</h3><p>{service.description}</p></Link></li>)}</ul></section>
  <p className="services-aside">Looking for content or social media? That now lives with the <a href="https://www.codesquad.ai">main CodeSquad team</a>.</p>
 </div>;
}
