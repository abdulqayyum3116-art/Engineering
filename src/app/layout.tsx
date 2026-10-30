import type {Metadata} from 'next';
import {Header} from '@/components/header';
import {Footer} from '@/components/shared';
import {origin} from '@/lib/content';
import './globals.css';
export const metadata:Metadata={metadataBase:new URL(origin),title:{default:'Engineering & Agriculture Solutions | CodeSquad',template:'%s | CodeSquad'},description:'Software, automation and data systems for engineering firms, farms and agricultural businesses.',openGraph:{type:'website',siteName:'CodeSquad Engineering & Agriculture',images:['/opengraph-image']},robots:process.env.VERCEL_ENV==='preview'?{index:false,follow:false}:{index:true,follow:true}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body><a className="skip-link" href="#main">Skip to content</a><Header/><main id="main">{children}</main><Footer/><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify({'@context':'https://schema.org','@type':'Organization',name:'CodeSquad',url:origin,parentOrganization:{'@type':'Organization',name:'CodeSquad',url:'https://www.codesquad.ai'}})}}/></body></html>}
