import { Noto_Sans_JP } from 'next/font/google';
import { cn } from '@udecode/cn';

import { siteConfig } from '@/config/site';
import { TooltipProvider } from '@/components/plate-ui/tooltip';
import { SiteHeader } from '@/components/site/site-header';
import { TailwindIndicator } from '@/components/site/tailwind-indicator';
import { ThemeProvider } from '@/components/site/theme-provider';

import '@/styles/globals.css';

import { Metadata, Viewport } from 'next';

import AuthProvider from '@/components/context/auth';
import AuthRedirect from '@/components/context/auth-redirect';
import { EditorContextProvider } from '@/components/context/editor';

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
};

interface RootLayoutProps {
  children: React.ReactNode;
}

const noto = Noto_Sans_JP({
  variable: '--font-noto',
  subsets: ['latin'],
});

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <>
      <html lang="ja" suppressHydrationWarning>
        <head>
          <meta name="google" content="notranslate" />
        </head>
        <body
          className={cn(
            `min-h-screen bg-background ${noto.className} antialiased`,
            '[&_.slate-selected]:!bg-primary/20 [&_.slate-selection-area]:border [&_.slate-selection-area]:border-primary [&_.slate-selection-area]:bg-primary/10'
          )}
        >
          <AuthProvider>
            <AuthRedirect>
              <ThemeProvider attribute="class" defaultTheme="light">
                <EditorContextProvider>
                  <TooltipProvider
                    disableHoverableContent
                    delayDuration={500}
                    skipDelayDuration={0}
                  >
                    <div className="relative flex min-h-screen flex-col">
                      <SiteHeader />
                      <div className="flex-1">{children}</div>
                    </div>
                    <TailwindIndicator />
                  </TooltipProvider>
                </EditorContextProvider>
              </ThemeProvider>
            </AuthRedirect>
          </AuthProvider>
        </body>
      </html>
    </>
  );
}
