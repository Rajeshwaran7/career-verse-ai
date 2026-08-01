import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/shared/theme-provider';
import { QueryProvider } from '@/components/shared/query-provider';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: {
    default: 'CareerVerse AI – AI-Powered Talent Discovery',
    template: '%s | CareerVerse AI',
  },
  description:
    'Connect students with startups through AI-powered talent discovery. Build your AI Talent Passport and get discovered by top companies.',
  keywords: ['talent discovery', 'internship', 'AI recruitment', 'student jobs', 'startup hiring'],
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    other: [{ rel: 'manifest', url: '/site.webmanifest' }],
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://careerverse.ai',
    title: 'CareerVerse AI',
    description: 'AI-Powered Talent Discovery Platform',
    siteName: 'CareerVerse AI',
    images: [{ url: '/android-chrome-512x512.png', width: 512, height: 512, alt: 'CareerVerse AI' }],
  },
  twitter: {
    card: 'summary',
    title: 'CareerVerse AI',
    description: 'AI-Powered Talent Discovery Platform',
    images: ['/android-chrome-512x512.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <QueryProvider>
            {children}
            <Toaster />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
