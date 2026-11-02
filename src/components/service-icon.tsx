import {Compass,Bot,Sparkles,CodeXml,Package,Cloud,Plug,Gauge,Wrench,Calculator,FileText,Sprout,Satellite,Droplets,Truck,Contact,Search,Megaphone,type LucideProps} from 'lucide-react';
import type {ServiceIcon} from '@/lib/content';

const icons:Record<ServiceIcon,React.ComponentType<LucideProps>>={compass:Compass,bot:Bot,sparkles:Sparkles,code:CodeXml,product:Package,cloud:Cloud,plug:Plug,gauge:Gauge,wrench:Wrench,calculator:Calculator,document:FileText,sprout:Sprout,satellite:Satellite,droplets:Droplets,truck:Truck,contacts:Contact,search:Search,megaphone:Megaphone};

export function ServiceIconGlyph({icon,...props}:{icon:ServiceIcon}&LucideProps){const Icon=icons[icon];return <Icon {...props}/>;}
