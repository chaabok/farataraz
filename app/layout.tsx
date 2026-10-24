import React from 'react';
import type {Metadata, Viewport} from 'next';
import './globals.css';
import { Providers } from '@/components/Providers';
import ActivationModal from '@/components/layout/ActivationModal';
import { AiChatWidget } from '@/components/ai/AiChatWidget';

export const metadata: Metadata = {
  title: 'Parsa ERP Dashboard',
  description: 'Parsa ERP Dashboard',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  // Let the Providers set the dir and lang dynamically via use-effect/client component
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body>
        <Providers>
          {/* <ActivationModal /> */}
          {/* <AiChatWidget /> */}
          {children}
        </Providers>
      </body>
    </html>
  );
}
