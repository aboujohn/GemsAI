import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import EnvironmentInfo from '@/components/ui/EnvironmentInfo';
import { ThemeProvider } from '@/components/ui/ThemeProvider';
import { LanguageProvider } from '@/components/providers/LanguageProvider';
import { AuthProvider } from '@/lib/contexts/AuthContext';
import { config } from '@/lib/config';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const viewport: Viewport = {
  colorScheme: 'dark light',
};

export const metadata: Metadata = {
  title: {
    default: 'GemsAI - Emotionally Intelligent Jewelry',
    template: '%s | GemsAI',
  },
  description: 'Transform your stories into meaningful jewelry with AI',
  metadataBase: new URL(config.app.url || 'http://localhost:3000'),
  keywords: ['jewelry', 'AI', 'stories', 'emotional', 'custom', 'gemstones'],
  authors: [{ name: 'GemsAI Team' }],
  creator: 'GemsAI',
  openGraph: {
    type: 'website',
    locale: 'he_IL',
    url: config.app.url || 'http://localhost:3000',
    siteName: 'GemsAI',
    title: 'GemsAI - Emotionally Intelligent Jewelry',
    description: 'Transform your stories into meaningful jewelry with AI',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GemsAI - Emotionally Intelligent Jewelry',
    description: 'Transform your stories into meaningful jewelry with AI',
    creator: '@gemsai',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-background font-sans antialiased`}
      >
        <LanguageProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <AuthProvider>
              <div className="relative flex min-h-screen flex-col">
                <main className="flex-1">{children}</main>
              </div>
              <EnvironmentInfo />
            </AuthProvider>
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
