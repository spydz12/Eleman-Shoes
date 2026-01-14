'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Upload, Loader2, Check } from 'lucide-react';
import Link from 'next/link';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase/config';
import { COLLECTIONS } from '@/lib/firebase/collections';
import { Settings } from '@/lib/firebase/types';
import Image from 'next/image';

export default function AdminSettingsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploadingEdos, setUploadingEdos] = useState(false);
  const [uploadingEleman, setUploadingEleman] = useState(false);

  const [formData, setFormData] = useState({
    primaryWhatsapp: '',
    primaryEmail: '',
    edosFootwearLogo: '',
    elemanShoesLogo: '',
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/admin/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settingsDoc = await getDoc(doc(db, COLLECTIONS.SETTINGS, 'general'));
        if (settingsDoc.exists()) {
          const data = settingsDoc.data() as Settings;
          setSettings(data);
          setFormData({
            primaryWhatsapp: data.primaryWhatsapp || '+213542936103',
            primaryEmail: data.primaryEmail || 'contact@edoseleman.com',
            edosFootwearLogo: data.edosFootwearLogo || '/whatsapp_image_2026-01-14_at_01.33.33 copy.jpeg',
            elemanShoesLogo: data.elemanShoesLogo || '/whatsapp_image_2026-01-14_at_01.33.33 copy.jpeg',
          });
        } else {
          await setDoc(doc(db, COLLECTIONS.SETTINGS, 'general'), {
            groupName: "Edo's Footwear & Eleman Shoes",
            groupNameAr: 'إدوز فوتوير وإلمان شوز',
            primaryWhatsapp: '+213542936103',
            primaryEmail: 'contact@edoseleman.com',
            edosFootwearLogo: '/whatsapp_image_2026-01-14_at_01.33.33 copy.jpeg',
            elemanShoesLogo: '/whatsapp_image_2026-01-14_at_01.33.33 copy.jpeg',
            heroImageUrl: '/img_20260107_145445.jpg',
            themeColor: '#b45309',
            updatedAt: serverTimestamp(),
          });
          setFormData({
            primaryWhatsapp: '+213542936103',
            primaryEmail: 'contact@edoseleman.com',
            edosFootwearLogo: '/whatsapp_image_2026-01-14_at_01.33.33 copy.jpeg',
            elemanShoesLogo: '/whatsapp_image_2026-01-14_at_01.33.33 copy.jpeg',
          });
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setLoadingSettings(false);
      }
    };

    if (user) {
      fetchSettings();
    }
  }, [user]);

  const handleLogoUpload = async (file: File, brand: 'edos' | 'eleman') => {
    try {
      if (brand === 'edos') {
        setUploadingEdos(true);
      } else {
        setUploadingEleman(true);
      }

      const storageRef = ref(storage, `logos/${brand}_${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      if (brand === 'edos') {
        setFormData((prev) => ({ ...prev, edosFootwearLogo: downloadURL }));
      } else {
        setFormData((prev) => ({ ...prev, elemanShoesLogo: downloadURL }));
      }
    } catch (error) {
      console.error('Error uploading logo:', error);
      alert('Failed to upload logo');
    } finally {
      if (brand === 'edos') {
        setUploadingEdos(false);
      } else {
        setUploadingEleman(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    try {
      await setDoc(
        doc(db, COLLECTIONS.SETTINGS, 'general'),
        {
          ...formData,
          groupName: 'Edo\'s & Eleman',
          groupNameAr: 'إدوز وإلمان',
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user || loadingSettings) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/admin/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Brand Logos</CardTitle>
              <CardDescription>Upload and manage logos for both brands</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edosLogo">Edo&apos;s Footwear Logo</Label>
                  <div className="mt-2 space-y-4">
                    {formData.edosFootwearLogo && (
                      <div className="relative w-48 h-24 border rounded-lg overflow-hidden">
                        <Image
                          src={formData.edosFootwearLogo}
                          alt="Edo's Footwear Logo"
                          fill
                          className="object-contain"
                        />
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Input
                        id="edosLogo"
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleLogoUpload(file, 'edos');
                        }}
                        disabled={uploadingEdos}
                      />
                      {uploadingEdos && <Loader2 className="w-4 h-4 animate-spin" />}
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="elemanLogo">Eleman Shoes Logo</Label>
                  <div className="mt-2 space-y-4">
                    {formData.elemanShoesLogo && (
                      <div className="relative w-48 h-24 border rounded-lg overflow-hidden">
                        <Image
                          src={formData.elemanShoesLogo}
                          alt="Eleman Shoes Logo"
                          fill
                          className="object-contain"
                        />
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Input
                        id="elemanLogo"
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleLogoUpload(file, 'eleman');
                        }}
                        disabled={uploadingEleman}
                      />
                      {uploadingEleman && <Loader2 className="w-4 h-4 animate-spin" />}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>Primary contact details for the platform</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="whatsapp">WhatsApp Number</Label>
                <Input
                  id="whatsapp"
                  type="tel"
                  placeholder="+212 6XX XXX XXX"
                  value={formData.primaryWhatsapp}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, primaryWhatsapp: e.target.value }))
                  }
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="contact@example.com"
                  value={formData.primaryEmail}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, primaryEmail: e.target.value }))
                  }
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-end gap-4">
            {saved && (
              <div className="flex items-center gap-2 text-green-600">
                <Check className="w-4 h-4" />
                <span className="text-sm font-medium">Settings saved</span>
              </div>
            )}
            <Button type="submit" disabled={saving || uploadingEdos || uploadingEleman}>
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Settings'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
