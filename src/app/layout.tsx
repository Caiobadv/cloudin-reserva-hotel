import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CloudIn - Reserva de Sala de Reunião',
  description: 'Plataforma de reserva de salas de reunião online. Encontre, reserve e pague sua sala perfeita.',
  keywords: ['sala de reunião', 'reserva de sala', 'salas de conferência', 'espaço para reunião'],
  openGraph: {
    title: 'CloudIn - Reserva de Sala de Reunião',
    description: 'Plataforma de reserva de salas de reunião online.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
