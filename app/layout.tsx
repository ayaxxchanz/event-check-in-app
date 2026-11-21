import type { Metadata } from 'next';
import { Cormorant_Garamond, Manrope } from 'next/font/google';
import './globals.css';

const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['400', '500', '600', '700'], style: ['normal', 'italic'], variable: '--font-cormorant', display: 'swap' });
const manrope = Manrope({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-manrope', display: 'swap' });

export const metadata: Metadata = {
  title: 'Event Check-In App | Sistem Pendaftaran Acara & Kehadiran',
  description:
    'Sistem Pendaftaran Acara & Kehadiran — Fast front-desk event registration, walk-in entry, and live attendance check-in dashboard.',
  openGraph: {
    title: 'Event Check-In App | Sistem Pendaftaran Acara & Kehadiran',
    description:
      'Sistem Pendaftaran Acara & Kehadiran — Fast front-desk event registration, walk-in entry, and live attendance check-in dashboard.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Event Check-In App | Sistem Pendaftaran Acara & Kehadiran',
    description:
      'Sistem Pendaftaran Acara & Kehadiran — Fast front-desk event registration, walk-in entry, and live attendance check-in dashboard.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ms"
      className={`${cormorant.variable} ${manrope.variable}`}
    >
      <body className="min-h-screen antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
