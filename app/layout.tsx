import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const viewport: Viewport = {
  themeColor: '#1d4ed8',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: 'Analisador de Preço · iPhone',
  description: 'Cole a lista do fornecedor, aplique sua margem, compare com o concorrente e gere a lista de venda pronta para o WhatsApp.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${inter.variable} scroll-smooth`}>
      <body className="bg-[#f5f7fa] text-slate-900 font-sans antialiased min-h-screen selection:bg-blue-100 selection:text-blue-900" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
