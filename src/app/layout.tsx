import type { Metadata, Viewport } from 'next';
import { Press_Start_2P, VT323 } from 'next/font/google';
import Link from 'next/link';
import type { ReactNode } from 'react';

import './globals.css';

// 8-bit type: a blocky display face for headings, numbers and buttons, and a
// readable terminal face for body text. next/font downloads them at build
// time and serves them with the static site, so nothing loads from Google
// at runtime.
const pixel = Press_Start_2P({ weight: '400', subsets: ['latin'], variable: '--font-pixel', display: 'swap' });
const terminal = VT323({ weight: '400', subsets: ['latin'], variable: '--font-terminal', display: 'swap' });

export const metadata: Metadata = {
  title: 'The Voyage',
  description: "A daily rare-answer trivia game that flies you along Voyager 1's real journey.",
};

export const viewport: Viewport = {
  themeColor: '#0b0e24',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${pixel.variable} ${terminal.variable}`}>
      <body>
        <nav className="site-nav">
          <Link href="/" className="site-nav__brand">
            ▶ The Voyage
          </Link>
          <Link href="/log">Log</Link>
        </nav>
        {children}
      </body>
    </html>
  );
}
