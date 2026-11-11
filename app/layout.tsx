import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const viewport: Viewport = {
  themeColor: '#004ac6',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: 'NextMobile | Flagship Experience',
  description: 'Comércio mobile premium de smartphones flagship e dispositivos conectados de última geração. Condições exclusivas Pix e entrega expressa.',
  openGraph: {
    title: 'NextMobile | Flagship Experience',
    description: 'Comércio mobile premium de smartphones flagship e dispositivos conectados de última geração.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NextMobile | Flagship Experience',
    description: 'Comércio mobile premium de smartphones flagship e dispositivos conectados de última geração.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${inter.variable} scroll-smooth`}>
      <body className="bg-[#f7f9fb] text-[#191c1e] font-sans antialiased min-h-screen selection:bg-blue-100 selection:text-blue-900" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
