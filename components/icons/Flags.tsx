import React from 'react';

const SvgFlag = ({ children, ...props }: React.SVGProps<SVGSVGElement> & { children: React.ReactNode }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 640 480" 
    width="20" 
    height="16" 
    className={`rounded shadow-sm overflow-hidden flex-shrink-0 ${props.className || ''}`} 
    style={{ width: '20px', height: '16px', minWidth: '20px', minHeight: '16px', maxWidth: '20px', maxHeight: '16px' }} 
    preserveAspectRatio="none" 
    {...props}
  >
    {children}
  </svg>
);

export const FlagEN = (props: any) => (
  <SvgFlag {...props}>
    <rect width="640" height="480" fill="#012169"/>
    <path fill="#FFF" d="m75 0 244 181L562 0h78v62L400 241l240 178v61h-80L320 301 81 480H0v-60l239-178L0 64V0z"/>
    <path fill="#C8102E" d="m424 281 216 159v40L369 281zm-184 20 211 179h-89L120 301zM640 0v3L391 191l2-44L590 0zM0 0l239 176h-60L0 42z"/>
    <path fill="#FFF" d="M241 0v480h160V0zM0 160v160h640V160z"/>
    <path fill="#C8102E" d="M0 193v96h640v-96zM273 0v480h96V0z"/>
  </SvgFlag>
);

export const FlagFA = (props: any) => (
  <SvgFlag {...props}>
    <rect width="640" height="160" fill="#239f40"/>
    <rect y="160" width="640" height="160" fill="#fff"/>
    <rect y="320" width="640" height="160" fill="#da0000"/>
    <path fill="#da0000" d="M320 180c-15 0-25 10-25 25v50c0 10 10 20 25 20s25-10 25-20v-50c0-15-10-25-25-25zm-40 10c-10 0-15 5-15 15v40c0 5 5 10 15 10s15-5 15-10v-40c0-10-5-15-15-15zm80 0c-10 0-15 5-15 15v40c0 5 5 10 15 10s15-5 15-10v-40c0-10-5-15-15-15z"/>
  </SvgFlag>
);

export const FlagAR = (props: any) => (
  <SvgFlag {...props}>
    <rect width="640" height="160" fill="#00732f"/>
    <rect y="160" width="640" height="160" fill="#fff"/>
    <rect y="320" width="640" height="160" fill="#000"/>
    <rect width="160" height="480" fill="#f00"/>
  </SvgFlag>
);

export const FlagZH = (props: any) => (
  <SvgFlag {...props}>
    <rect width="640" height="480" fill="#ee1c25"/>
    <path fill="#ff0" d="M106.7 173.3l21.4-65.7 55.9 40.6-69-50.1h85.3l-69 50.1 21.4 65.7L106.7 173.3zM250 82.5l27.1-12.7 15.3 25.5-29.6-6-8.9-28.7 18.2 24.1L250 82.5zM286.7 151l29.4-4.8 7.3 28.9-26.2-14.5-20.2-22.3 28 9.9-18.2-17.1zm-8 74.3l27.3 12.2-9 28.6-17.7-24.5-23.7 19.3 14.8-26-27.1-12.8h29.8zM216.7 302l14.8 25.9-29.5-6.5-7.7-29.1 17.5 24.6-26.6-13.8 29.8.7z"/>
  </SvgFlag>
);

export const FlagKU = (props: any) => (
  <SvgFlag {...props}>
    <rect width="640" height="160" fill="#ed1c24"/>
    <rect y="160" width="640" height="160" fill="#fff"/>
    <rect y="320" width="640" height="160" fill="#279e68"/>
    <circle cx="320" cy="240" r="50" fill="#fdb913"/>
  </SvgFlag>
);

export const FlagDE = (props: any) => (
  <SvgFlag {...props}>
    <rect width="640" height="160" fill="#000"/>
    <rect y="160" width="640" height="160" fill="#d00"/>
    <rect y="320" width="640" height="160" fill="#ffce00"/>
  </SvgFlag>
);

export const FlagFR = (props: any) => (
  <SvgFlag {...props}>
    <rect width="213.3" height="480" fill="#002395"/>
    <rect x="213.3" width="213.4" height="480" fill="#fff"/>
    <rect x="426.7" width="213.3" height="480" fill="#ed2939"/>
  </SvgFlag>
);

export const FlagHI = (props: any) => (
  <SvgFlag {...props}>
    <rect width="640" height="160" fill="#f93"/>
    <rect y="160" width="640" height="160" fill="#fff"/>
    <rect y="320" width="640" height="160" fill="#128807"/>
    <circle cx="320" cy="240" r="60" fill="#000080"/>
    <circle cx="320" cy="240" r="50" fill="#fff"/>
    <circle cx="320" cy="240" r="10" fill="#000080"/>
  </SvgFlag>
);

export const FlagRU = (props: any) => (
  <SvgFlag {...props}>
    <rect width="640" height="160" fill="#fff"/>
    <rect y="160" width="640" height="160" fill="#0039a6"/>
    <rect y="320" width="640" height="160" fill="#d52b1e"/>
  </SvgFlag>
);

export const FlagAF = (props: any) => (
  <SvgFlag {...props}>
    <rect width="213.3" height="480" fill="#000"/>
    <rect x="213.3" width="213.4" height="480" fill="#d32011"/>
    <rect x="426.7" width="213.3" height="480" fill="#007a36"/>
  </SvgFlag>
);

export const FlagIcon = ({ lang, className }: { lang: string, className?: string }) => {
  switch (lang?.toLowerCase()) {
    case 'en': return <FlagEN className={className} />;
    case 'fa': return <FlagFA className={className} />;
    case 'ar': return <FlagAR className={className} />;
    case 'zh': return <FlagZH className={className} />;
    case 'ku': return <FlagKU className={className} />;
    case 'de': return <FlagDE className={className} />;
    case 'fr': return <FlagFR className={className} />;
    case 'hi': return <FlagHI className={className} />;
    case 'ru': return <FlagRU className={className} />;
    case 'af': return <FlagAF className={className} />;
    default: return <FlagEN className={className} />;
  }
};
