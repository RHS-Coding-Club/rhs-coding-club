import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/contexts/auth-context';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Toaster } from 'sonner';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'RHS Coding Club',
  description:
    'Join the RHS Coding Club - Learn programming, participate in challenges, build projects, and connect with fellow developers.',
  keywords: [
    'coding club',
    'programming',
    'RHS',
    'students',
    'technology',
    'development',
  ],
  authors: [{ name: 'RHS Coding Club' }],
  creator: 'RHS Coding Club',
  publisher: 'RHS Coding Club',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://rhscodingclub.com',
    title: 'RHS Coding Club',
    description:
      'Join the RHS Coding Club - Learn programming, participate in challenges, build projects, and connect with fellow developers.',
    siteName: 'RHS Coding Club',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RHS Coding Club',
    description:
      'Join the RHS Coding Club - Learn programming, participate in challenges, build projects, and connect with fellow developers.',
    creator: '@rhscodingclub',
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <Toaster position="bottom-right" />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
