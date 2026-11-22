import type { Metadata, Viewport } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';

import './globals.css';

export const metadata: Metadata = {
  title: 'The Voyage',
  description: "A daily rare-answer trivia game that flies you along Voyager 1's real journey.",
};

export const viewport: Viewport = {
  themeColor: '#05070d',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <nav className="site-nav">
          <Link href="/" className="site-nav__brand">
            The Voyage
          </Link>
          <Link href="/log">Log</Link>
        </nav>
        {children}
      </body>
    </html>
  );
}
