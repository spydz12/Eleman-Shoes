'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ImageLightbox from '@/components/ImageLightbox';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MessageCircle, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { COLLECTIONS } from '@/lib/firebase/collections';
import { Product } from '@/lib/firebase/types';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';

function ProductCard({ product, locale }: { product: Product; locale: string }) {
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const selectedColor = product.colorVariants[selectedColorIndex];
  const images = selectedColor?.images || [];

  const handleColorSelect = (index: number) => {
    setSelectedColorIndex(index);
    setCurrentImageIndex(0);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleImageClick = () => {
    setLightboxOpen(true);
  };

  const generateWhatsAppMessage = () => {
    const currentImage = images[currentImageIndex] || '';
    const whatsappNumber = '213542936103';

    let message = '';
    if (locale === 'fr') {
      message = `Bonjour, je voudrais connaître le prix de ce produit :
• Produit : ${product.nameFr}
• Réf : ${product.reference}
• Couleur : ${selectedColor.name}
• Image : ${currentImage}`;
    } else {
      message = `سلام، نحب نعرف ثمن هذا المنتوج:
• المنتج: ${product.nameFr}
• المرجع: ${product.reference}
• اللون: ${selectedColor.nameAr || selectedColor.name}
• الصورة: ${currentImage}`;
    }

    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
  };

  const handleContactClick = () => {
    window.open(generateWhatsAppMessage(), '_blank');
  };

  if (!product.colorVariants || product.colorVariants.length === 0) {
    return (
      <Card className="overflow-hidden hover:shadow-xl transition-shadow">
        <div className="aspect-square relative bg-gray-100 flex items-center justify-center">
          <p className="text-gray-400">{locale === 'fr' ? 'Aucune image' : 'لا توجد صورة'}</p>
        </div>
        <CardContent className="p-4">
          <h3 className="font-bold text-lg mb-2 line-clamp-2">{product.nameFr}</h3>
          <p className="text-sm text-gray-600 mb-3">Ref: {product.reference}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="overflow-hidden hover:shadow-xl transition-shadow group">
        <div className="aspect-square relative bg-gray-100">
          {images.length > 0 ? (
            <>
              <div
                className="absolute inset-0 cursor-pointer"
                onClick={handleImageClick}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleImageClick();
                  }
                }}
              >
                <Image
                  src={images[currentImageIndex]}
                  alt={`${product.nameFr} - ${selectedColor.name}`}
                  fill
                  className="object-cover"
                />
              </div>
              {images.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      prevImage();
                    }}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    type="button"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      nextImage();
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    type="button"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
                    {images.map((_, idx) => (
                      <div
                        key={idx}
                        className={`w-1.5 h-1.5 rounded-full transition-all ${
                          idx === currentImageIndex ? 'bg-white w-4' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              {locale === 'fr' ? 'Aucune image' : 'لا توجد صورة'}
            </div>
          )}
          <div className="absolute top-2 left-2 z-10">
            <Badge variant="secondary" className="bg-white/90">
              {product.brand === 'edos' ? "Edo's" : 'Eleman'}
            </Badge>
          </div>
        </div>
      <CardContent className="p-4">
        <h3 className="font-bold text-lg mb-2 line-clamp-2">{product.nameFr}</h3>
        <p className="text-sm text-gray-600 mb-2">Ref: {product.reference}</p>

        {product.colorVariants.length > 0 && (
          <div className="mb-3">
            <p className="text-xs text-gray-500 mb-2">
              {locale === 'fr' ? 'Couleur:' : 'اللون:'} {selectedColor.name}
              {selectedColor.nameAr && ` / ${selectedColor.nameAr}`}
            </p>
            <div className="flex flex-wrap gap-2">
              {product.colorVariants.map((color, idx) => (
                <button
                  key={idx}
                  onClick={() => handleColorSelect(idx)}
                  className={`relative w-8 h-8 rounded-full border-2 transition-all ${
                    idx === selectedColorIndex
                      ? 'border-amber-600 ring-2 ring-amber-200'
                      : 'border-gray-300 hover:border-amber-400'
                  }`}
                  style={{ backgroundColor: color.hexCode || '#ccc' }}
                  title={`${color.name}${color.nameAr ? ` / ${color.nameAr}` : ''}`}
                  type="button"
                >
                  {idx === selectedColorIndex && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full border border-gray-800" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        <Button
          size="sm"
          className="w-full bg-amber-700 hover:bg-amber-800"
          onClick={handleContactClick}
        >
          <MessageCircle className="w-3 h-3 mr-2" />
          {locale === 'fr' ? 'Contacter' : 'اتصل'}
        </Button>
      </CardContent>
    </Card>

      <ImageLightbox
        images={images}
        initialIndex={currentImageIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        productName={product.nameFr}
      />
    </>
  );
}

export default function BrandsPage() {
  const { locale } = useLanguage();
  const searchParams = useSearchParams();
  const brandFromUrl = searchParams.get('brand');

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterBrand, setFilterBrand] = useState<string>(brandFromUrl || 'all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterColor, setFilterColor] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (brandFromUrl) {
      setFilterBrand(brandFromUrl);
    }
  }, [brandFromUrl]);

  const fetchProducts = async () => {
    try {
      const productsSnap = await getDocs(
        query(collection(db, COLLECTIONS.PRODUCTS), where('status', '==', 'active'))
      );
      const productsData = productsSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[];

      setProducts(productsData);

      const uniqueCategories = Array.from(
        new Set(productsData.map((p) => p.category).filter(Boolean))
      ) as string[];
      setCategories(uniqueCategories);

      const uniqueColors = Array.from(
        new Set(productsData.flatMap((p) => p.colorVariants?.map((c) => c.name) || []))
      );
      setColors(uniqueColors);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.nameFr.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBrand = filterBrand === 'all' || product.brand === filterBrand;
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    const matchesColor =
      filterColor === 'all' || product.colorVariants?.some((c) => c.name === filterColor);

    return matchesSearch && matchesBrand && matchesCategory && matchesColor;
  });

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1">
        <section className="relative bg-gradient-to-b from-amber-50 to-white py-12 md:py-16">
          <div className="container mx-auto text-center px-4">
            <h1 className="text-3xl md:text-5xl font-bold mb-4 text-gray-900">
              {locale === 'fr' ? 'Notre Catalogue' : 'كتالوجنا'}
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              {locale === 'fr'
                ? 'Découvrez nos collections de chaussures en cuir premium'
                : 'اكتشف مجموعاتنا من الأحذية الجلدية الفاخرة'}
            </p>
          </div>
        </section>

        <section className="py-8 md:py-12">
          <div className="container mx-auto px-4">
            <Card className="mb-8">
              <CardContent className="p-4 md:p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder={locale === 'fr' ? 'Rechercher...' : 'بحث...'}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <Select value={filterBrand} onValueChange={setFilterBrand}>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={locale === 'fr' ? 'Toutes les marques' : 'جميع العلامات'}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        {locale === 'fr' ? 'Toutes les marques' : 'جميع العلامات'}
                      </SelectItem>
                      <SelectItem value="edos">Edo&apos;s Footwear</SelectItem>
                      <SelectItem value="eleman">Eleman Shoes</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={locale === 'fr' ? 'Toutes catégories' : 'جميع الفئات'}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        {locale === 'fr' ? 'Toutes catégories' : 'جميع الفئات'}
                      </SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={filterColor} onValueChange={setFilterColor}>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={locale === 'fr' ? 'Toutes couleurs' : 'جميع الألوان'}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        {locale === 'fr' ? 'Toutes couleurs' : 'جميع الألوان'}
                      </SelectItem>
                      {colors.map((color) => (
                        <SelectItem key={color} value={color}>
                          {color}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {loading ? (
              <div className="text-center py-12">
                <p className="text-gray-600">
                  {locale === 'fr' ? 'Chargement...' : 'جار التحميل...'}
                </p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-4">
                  {locale === 'fr' ? 'Aucun produit trouvé' : 'لم يتم العثور على منتجات'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} locale={locale} />
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="py-12 md:py-16 bg-gradient-to-br from-amber-700 to-amber-800 text-white">
          <div className="container mx-auto text-center px-4">
            <h2 className="text-2xl md:text-4xl font-bold mb-4">
              {locale === 'fr' ? 'Intéressé par nos produits ?' : 'مهتم بمنتجاتنا؟'}
            </h2>
            <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
              {locale === 'fr'
                ? "Contactez-nous sur WhatsApp pour plus d'informations"
                : 'اتصل بنا عبر واتساب لمزيد من المعلومات'}
            </p>
            <Link href="/contact">
              <Button
                size="lg"
                variant="secondary"
                className="bg-white text-amber-700 hover:bg-gray-50"
              >
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
