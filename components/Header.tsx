'use client';

import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Globe, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { COLLECTIONS } from '@/lib/firebase/collections';
import { Settings } from '@/lib/firebase/types';
import Image from 'next/image';

export default function Header() {
  const { locale, setLocale, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logos, setLogos] = useState<{ edos: string; eleman: string }>({
    edos: '',
    eleman: '',
  });

  useEffect(() => {
    const fetchLogos = async () => {
      try {
        const settingsDoc = await getDoc(doc(db, COLLECTIONS.SETTINGS, 'general'));
        if (settingsDoc.exists()) {
          const data = settingsDoc.data() as Settings;
          setLogos({
            edos: data.edosFootwearLogo || '/whatsapp_image_2026-01-14_at_01.33.33 copy.jpeg',
            eleman: data.elemanShoesLogo || '/whatsapp_image_2026-01-14_at_01.33.33 copy.jpeg',
          });
        } else {
          setLogos({
            edos: '/whatsapp_image_2026-01-14_at_01.33.33 copy.jpeg',
            eleman: '/whatsapp_image_2026-01-14_at_01.33.33 copy.jpeg',
          });
        }
      } catch (error) {
        console.error('Error fetching logos:', error);
        setLogos({
          edos: '/whatsapp_image_2026-01-14_at_01.33.33 copy.jpeg',
          eleman: '/whatsapp_image_2026-01-14_at_01.33.33 copy.jpeg',
        });
      }
    };

    fetchLogos();
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="container flex h-20 md:h-24 items-center justify-between px-4">
        <Link href="/" className="flex flex-col md:flex-row items-center gap-2 md:gap-4 hover:opacity-80 transition-opacity">
          {logos.edos && (
            <div className="relative h-12 w-28 sm:h-14 sm:w-36 md:h-16 md:w-40">
              <Image
                src={logos.edos}
                alt="Edo's Footwear & Eleman Shoes"
                fill
                className="object-contain"
                priority
              />
            </div>
          )}
          <div className="text-center md:text-left">
            <div className="text-xs sm:text-sm md:text-base font-bold text-gray-900">
              {locale === 'fr' ? 'Wholesale Shoes Group' : 'مجموعة الأحذية بالجملة'}
            </div>
            <div className="text-[10px] sm:text-xs text-gray-600">
              Edo&apos;s Footwear & Eleman Shoes
            </div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-sm font-medium hover:text-amber-700 transition-colors">
            {t.nav.home}
          </Link>
          <Link href="/brands" className="text-sm font-medium hover:text-amber-700 transition-colors">
            {t.nav.catalog}
          </Link>
          <Link href="/contact" className="text-sm font-medium hover:text-amber-700 transition-colors">
            {t.nav.contact}
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="border-amber-200 hover:bg-amber-50">
                <Globe className="h-4 w-4 mr-2" />
                {locale === 'fr' ? 'FR' : 'AR'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setLocale('fr')}>
                Français
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLocale('ar')}>
                العربية
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-white">
          <nav className="container py-4 space-y-3 px-4">
            <Link
              href="/"
              className="block py-3 text-base font-medium hover:text-amber-700 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t.nav.home}
            </Link>
            <Link
              href="/brands"
              className="block py-3 text-base font-medium hover:text-amber-700 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t.nav.catalog}
            </Link>
            <Link
              href="/contact"
              className="block py-3 text-base font-medium hover:text-amber-700 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t.nav.contact}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
