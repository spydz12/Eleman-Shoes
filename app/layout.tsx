import './globals.css';
import type { Metadata } from 'next';
import { Cairo } from 'next/font/google';
import { AuthProvider } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { Toaster } from '@/components/ui/sonner';

const cairo = Cairo({ subsets: ['latin', 'arabic'] });

export const metadata: Metadata = {
  title: 'B2B Wholesale Footwear | Edo\'s & Eleman Shoes',
  description: 'Professional B2B wholesale footwear platform featuring Edo\'s Footwear and Eleman Shoes brands',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={cairo.className}>
        <AuthProvider>
          <LanguageProvider>
            {children}
            <Toaster />
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
