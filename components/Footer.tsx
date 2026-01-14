'use client';

import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { MessageCircle } from 'lucide-react';

export default function Footer() {
  const { locale } = useLanguage();

  return (
    <footer className="border-t bg-gray-50">
      <div className="container py-8 md:py-12 px-4 md:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 md:gap-12 max-w-3xl mx-auto">
          <div>
            <h3 className="font-bold mb-4 text-gray-900 text-base md:text-lg">
              {locale === 'fr' ? 'Nos Marques' : 'علاماتنا التجارية'}
            </h3>
            <ul className="space-y-2 text-sm md:text-base text-gray-600">
              <li>Edo&apos;s Footwear</li>
              <li>Eleman Shoes</li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-4 text-gray-900 text-base md:text-lg">
              {locale === 'fr' ? 'Contact' : 'اتصل بنا'}
            </h3>
            <div className="space-y-2 text-sm md:text-base">
              <a
                href="https://wa.me/213542936103"
                className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="h-5 w-5" />
                <span>+213 542 93 61 03</span>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-gray-600">
          <p>
            &copy; {new Date().getFullYear()}{' '}
            {locale === 'fr'
              ? 'Edo\'s Footwear & Eleman Shoes. Tous droits réservés.'
              : 'إدوز فوتوير وإلمان شوز. جميع الحقوق محفوظة.'}
          </p>
        </div>
      </div>
    </footer>
  );
}
