import type { Metadata } from 'next';
import { Archivo, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const archivo = Archivo({
  subsets: ['latin'],
  variable: '--font-archivo',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'DishAR — o prato na mesa, antes do pedido',
  description:
    'Cardápio em Realidade Aumentada para restaurantes. O cliente lê o QR code na mesa, toca no prato e vê o tamanho real sobre a própria mesa sem baixar aplicativo.',
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${archivo.variable} ${jetbrainsMono.variable} dark`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
