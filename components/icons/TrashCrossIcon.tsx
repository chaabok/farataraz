import React from 'react';

export const TrashCrossIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" {...props}>
        <path d="M7 6l1 14h8l1-14H7z" fill="#e5e7eb" stroke="#6b7280" strokeWidth="1" strokeLinejoin="round"/>
        <path d="M5 6h14" stroke="#6b7280" strokeWidth="1"/>
        <path d="M9 6V4h6v2" fill="#d1d5db" stroke="#6b7280" strokeWidth="1" strokeLinejoin="round"/>
        <path d="M10 9v8M14 9v8" stroke="#9ca3af" strokeWidth="1"/>
        <rect x="13" y="13" width="9" height="9" rx="1" fill="#d4a39b" stroke="#78350f" strokeWidth="1" strokeLinejoin="round"/>
        <path d="M15 15l5 5M20 15l-5 5" stroke="#111" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
);
