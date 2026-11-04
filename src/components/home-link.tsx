'use client';

import type {ComponentProps,MouseEvent} from 'react';
import Link from 'next/link';
import {usePathname} from 'next/navigation';

// Next.js does not scroll on a link to the current URL, so handle "already on the home page" here.
export function HomeLink({onClick,...props}:Omit<ComponentProps<typeof Link>,'href'>){
 const path=usePathname();
 const click=(event:MouseEvent<HTMLAnchorElement>)=>{
  onClick?.(event);
  const newTab=event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||event.button!==0;
  if(path!=='/'||newTab||event.defaultPrevented)return;
  event.preventDefault();
  window.scrollTo({top:0});
 };
 return <Link {...props} href="/" onClick={click}/>;
}
