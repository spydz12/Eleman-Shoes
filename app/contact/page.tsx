'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { COLLECTIONS } from '@/lib/firebase/collections';
import { Settings } from '@/lib/firebase/types';

export default function ContactPage() {
  const { locale } = useLanguage();
  const [whatsappNumber, setWhatsappNumber] = useState('+213542936103');

  useEffect(() => {
    const fetchWhatsapp = async () => {
      try {
        const settingsDoc = await getDoc(doc(db, COLLECTIONS.SETTINGS, 'general'));
        if (settingsDoc.exists()) {
          const data = settingsDoc.data() as Settings;
          setWhatsappNumber(data.primaryWhatsapp || '+213542936103');
        }
      } catch (error) {
        console.error('Error fetching WhatsApp:', error);
      }
    };

    fetchWhatsapp();
  }, []);

  const whatsappLink = whatsappNumber
    ? `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}`
    : 'https://wa.me/213542936103';

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1">
        <section className="relative bg-gradient-to-br from-amber-50 via-white to-stone-50 py-20 md:py-32">
          <div className="container text-center px-4 md:px-6">
            <div className="max-w-3xl mx-auto">
              <div className="mb-8 md:mb-12">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6 md:mb-8">
                  <MessageCircle className="w-10 h-10 md:w-12 md:h-12 text-green-600" />
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 md:mb-6 text-gray-900">
                  {locale === 'fr' ? 'Contactez-nous' : 'اتصل بنا'}
                </h1>
                <p className="text-base sm:text-lg md:text-xl text-gray-700 mb-8 md:mb-12 leading-relaxed">
                  {locale === 'fr'
                    ? 'Pour découvrir nos collections, obtenir plus d\'informations ou passer une commande, contactez-nous directement sur WhatsApp.'
                    : 'لاكتشاف مجموعاتنا، الحصول على مزيد من المعلومات أو تقديم طلب، اتصل بنا مباشرة عبر واتساب.'}
                </p>
              </div>

              <div className="space-y-4">
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="block">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-8 md:px-12 py-6 md:py-8 text-lg md:text-xl h-auto"
                  >
                    <MessageCircle className="mr-3 h-6 w-6 md:h-7 md:w-7" />
                    {locale === 'fr' ? 'Ouvrir WhatsApp' : 'فتح واتساب'}
                  </Button>
                </a>
                {whatsappNumber && (
                  <p className="text-sm sm:text-base text-gray-600">
                    {whatsappNumber}
                  </p>
                )}
              </div>

              <div className="mt-12 md:mt-16 pt-8 md:pt-12 border-t border-gray-200">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-gray-900">
                  {locale === 'fr' ? 'Pourquoi WhatsApp ?' : 'لماذا واتساب؟'}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 text-sm sm:text-base">
                  <div className="p-4 bg-white rounded-lg border border-gray-200">
                    <div className="font-semibold text-gray-900 mb-2">
                      {locale === 'fr' ? '💬 Réponse rapide' : '💬 رد سريع'}
                    </div>
                    <p className="text-gray-600">
                      {locale === 'fr'
                        ? 'Communication directe et instantanée'
                        : 'تواصل مباشر وفوري'}
                    </p>
                  </div>
                  <div className="p-4 bg-white rounded-lg border border-gray-200">
                    <div className="font-semibold text-gray-900 mb-2">
                      {locale === 'fr' ? '📸 Partage facile' : '📸 مشاركة سهلة'}
                    </div>
                    <p className="text-gray-600">
                      {locale === 'fr'
                        ? 'Envoyez des photos et documents'
                        : 'أرسل الصور والمستندات'}
                    </p>
                  </div>
                  <div className="p-4 bg-white rounded-lg border border-gray-200">
                    <div className="font-semibold text-gray-900 mb-2">
                      {locale === 'fr' ? '✅ Simple et efficace' : '✅ بسيط وفعال'}
                    </div>
                    <p className="text-gray-600">
                      {locale === 'fr'
                        ? 'Pas de formulaires compliqués'
                        : 'لا توجد استمارات معقدة'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
