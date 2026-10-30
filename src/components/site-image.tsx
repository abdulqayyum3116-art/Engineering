'use client';
import {useState,type ImgHTMLAttributes} from 'react';
export function SiteImage({src,alt,...props}:ImgHTMLAttributes<HTMLImageElement>){const [failed,setFailed]=useState(false);const agri=String(src).includes('1500382017468');return <img {...props} src={failed?(agri?'/images/agriculture.svg':'/images/engineering.svg'):src} alt={failed?(alt?agri?'Illustrated agricultural landscape':'Illustrated industrial production line':''):alt} onError={()=>setFailed(true)}/>}
