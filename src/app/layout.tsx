import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#ffffff',
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),

  // Default title template
  title: {
    default: 'Portfolio | Full Stack Developer',
    template: '%s | Portfolio',
  },

  // Default description
  description:
    'Full-stack developer specializing in React, Node.js, and modern web technologies. View my projects and read my technical blog.',

  // Keywords
  keywords: ['portfolio', 'developer', 'react', 'nextjs', 'nodejs', 'typescript', 'full-stack'],

  // Authors
  authors: [{ name: 'Your Name', url: 'https://yourdomain.com' }],
  creator: 'Your Name',
  publisher: 'Your Name',

  // Robots
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

  // Open Graph
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'Portfolio',
    title: 'Portfolio | Full Stack Developer',
    description:
      'Full-stack developer specializing in React, Node.js, and modern web technologies.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Portfolio Preview',
      },
    ],
  },

  // Twitter
  twitter: {
    card: 'summary_large_image',
    title: 'Portfolio | Full Stack Developer',
    description:
      'Full-stack developer specializing in React, Node.js, and modern web technologies.',
    images: ['/og-image.jpg'],
    creator: '@yourhandle',
  },

  // Verification (add your codes)
  verification: {
    google: 'your-google-verification-code',
  },

  // Alternates
  alternates: {
    canonical: '/',
  },

  // Icons
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },

  // Manifest
  manifest: '/site.webmanifest',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} data-scroll-behavior="smooth">
      <body className="min-h-screen bg-white text-black antialiased">{children}</body>
    </html>
  );
}
