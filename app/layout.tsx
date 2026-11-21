import type { Metadata } from 'next';
import { JetBrains_Mono, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-jakarta',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-jetbrains',
  display: 'swap',
});

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
      className={`${plusJakartaSans.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-blue-100 selection:text-blue-900" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
