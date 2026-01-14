'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MessageCircle, ArrowRight } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { COLLECTIONS } from '@/lib/firebase/collections';
import { Settings } from '@/lib/firebase/types';
import Image from 'next/image';

export default function Home() {
  const { t, locale } = useLanguage();
  const [logo, setLogo] = useState('/whatsapp_image_2026-01-14_at_01.33.33 copy.jpeg');

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const settingsDoc = await getDoc(doc(db, COLLECTIONS.SETTINGS, 'general'));
        if (settingsDoc.exists()) {
          const data = settingsDoc.data() as Settings;
          setLogo(data.edosFootwearLogo || '/whatsapp_image_2026-01-14_at_01.33.33 copy.jpeg');
        }
      } catch (error) {
        console.error('Error fetching logo:', error);
      }
    };

    fetchLogo();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1">
        <section className="relative bg-gradient-to-b from-amber-50 to-white py-20 md:py-32">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                {locale === 'fr'
                  ? 'Chaussures en Cuir Premium'
                  : 'أحذية جلدية فاخرة'}
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 mb-10 leading-relaxed">
                {locale === 'fr'
                  ? 'Excellence artisanale et design raffiné pour les professionnels exigeants'
                  : 'حرفية متميزة وتصميم راقي للمحترفين المميزين'}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/brands">
                  <Button size="lg" className="bg-amber-700 hover:bg-amber-800 text-white px-8 py-6 text-lg">
                    {locale === 'fr' ? 'Découvrir nos collections' : 'اكتشف مجموعاتنا'}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button size="lg" variant="outline" className="border-2 border-amber-700 text-amber-700 hover:bg-amber-50 px-8 py-6 text-lg">
                    <MessageCircle className="mr-2 h-5 w-5" />
                    {locale === 'fr' ? 'Nous contacter' : 'اتصل بنا'}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
                {locale === 'fr' ? 'Nos Marques' : 'علاماتنا التجارية'}
              </h2>
              <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
                {locale === 'fr'
                  ? 'Deux marques dédiées à l\'excellence'
                  : 'علامتان تجاريتان مكرستان للتميز'}
              </p>
            </div>

            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
              <div className="group">
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-6 shadow-2xl">
                  <Image
                    src="/img_20260107_145445.jpg"
                    alt="Edo's Footwear"
                    width={800}
                    height={600}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h3 className="text-3xl md:text-4xl font-bold mb-2">Edo&apos;s Footwear</h3>
                    <p className="text-base md:text-lg opacity-90">
                      {locale === 'fr' ? 'Qualité Premium' : 'جودة فاخرة'}
                    </p>
                  </div>
                </div>
                <Link href="/brands?brand=edos">
                  <Button size="lg" className="w-full bg-amber-700 hover:bg-amber-800 text-white text-lg py-6">
                    {locale === 'fr' ? 'Voir la collection' : 'عرض المجموعة'}
                  </Button>
                </Link>
              </div>

              <div className="group">
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-6 shadow-2xl">
                  <Image
                    src="/img_20260107_183421.jpg"
                    alt="Eleman Shoes"
                    width={800}
                    height={600}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h3 className="text-3xl md:text-4xl font-bold mb-2">Eleman Shoes</h3>
                    <p className="text-base md:text-lg opacity-90">
                      {locale === 'fr' ? 'Design Élégant' : 'تصميم أنيق'}
                    </p>
                  </div>
                </div>
                <Link href="/brands?brand=eleman">
                  <Button size="lg" className="w-full bg-amber-700 hover:bg-amber-800 text-white text-lg py-6">
                    {locale === 'fr' ? 'Voir la collection' : 'عرض المجموعة'}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16 bg-gradient-to-br from-amber-700 to-amber-800 text-white">
          <div className="container text-center px-4 md:px-6">
            <h2 className="text-2xl md:text-4xl font-bold mb-4 md:mb-6">
              {locale === 'fr' ? 'Prêt à commander ?' : 'جاهز للطلب؟'}
            </h2>
            <p className="text-lg md:text-xl mb-6 md:mb-8 max-w-2xl mx-auto">
              {locale === 'fr'
                ? 'Contactez-nous pour découvrir nos collections'
                : 'اتصل بنا لاكتشاف مجموعاتنا'}
            </p>
            <Link href="/contact">
              <Button size="lg" variant="secondary" className="w-full md:w-auto bg-white text-amber-700 hover:bg-gray-50">
                <MessageCircle className="mr-2 h-5 w-5" />
                {locale === 'fr' ? 'Nous contacter' : 'اتصل بنا'}
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
