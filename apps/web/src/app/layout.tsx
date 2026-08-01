import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/shared/theme-provider';
import { QueryProvider } from '@/components/shared/query-provider';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: {
    default: 'CareerVerse AI – AI-Powered Talent Discovery',
    template: '%s | CareerVerse AI',
  },
  description:
    'Connect students with startups through AI-powered talent discovery. Build your AI Talent Passport and get discovered by top companies.',
  keywords: ['talent discovery', 'internship', 'AI recruitment', 'student jobs', 'startup hiring'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://careerverse.ai',
    title: 'CareerVerse AI',
    description: 'AI-Powered Talent Discovery Platform',
    siteName: 'CareerVerse AI',
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
