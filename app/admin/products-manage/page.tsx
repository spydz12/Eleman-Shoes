'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Upload, Loader2, Check, X, Plus, Trash2, Edit2, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';
import { collection, addDoc, serverTimestamp, doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase/config';
import { COLLECTIONS } from '@/lib/firebase/collections';
import { Product, ColorVariant } from '@/lib/firebase/types';
import Image from 'next/image';

export default function ProductManagePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [productId, setProductId] = useState<string | null>(null);
  const [expandedColorIndex, setExpandedColorIndex] = useState<number | null>(0);
  const [uploadingColorIndex, setUploadingColorIndex] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    brand: 'edos' as 'edos' | 'eleman',
    category: '',
    reference: '',
    nameFr: '',
    descriptionFr: '',
    status: 'active' as 'active' | 'hidden',
    colorVariants: [] as ColorVariant[],
  });

  const [editingColorIndex, setEditingColorIndex] = useState<number | null>(null);
  const [editColorData, setEditColorData] = useState({ name: '', nameAr: '', hexCode: '' });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/admin/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const id = searchParams.get('id');
    if (id) {
      setProductId(id);
      loadProduct(id);
    }
  }, []);

  const loadProduct = async (id: string) => {
    try {
      const productDoc = await getDoc(doc(db, COLLECTIONS.PRODUCTS, id));
      if (productDoc.exists()) {
        const data = productDoc.data() as Product;
        setFormData({
          brand: data.brand,
          category: data.category || '',
          reference: data.reference,
          nameFr: data.nameFr,
          descriptionFr: data.descriptionFr || '',
          status: data.status,
          colorVariants: data.colorVariants || [],
        });
      }
    } catch (error) {
      console.error('Error loading product:', error);
    }
  };

  const addNewColor = () => {
    const newColor: ColorVariant = {
      name: 'New Color',
      nameAr: 'لون جديد',
      hexCode: '',
      images: [],
      mainImageIndex: 0,
    };
    setFormData((prev) => ({
      ...prev,
      colorVariants: [...prev.colorVariants, newColor],
    }));
    setExpandedColorIndex(formData.colorVariants.length);
  };

  const removeColor = (index: number) => {
    if (confirm('Are you sure you want to delete this color and all its images?')) {
      setFormData((prev) => ({
        ...prev,
        colorVariants: prev.colorVariants.filter((_, i) => i !== index),
      }));
      if (expandedColorIndex === index) {
        setExpandedColorIndex(null);
      }
    }
  };

  const startEditingColor = (index: number) => {
    const color = formData.colorVariants[index];
    setEditColorData({
      name: color.name,
      nameAr: color.nameAr,
      hexCode: color.hexCode || '',
    });
    setEditingColorIndex(index);
  };

  const saveColorEdit = () => {
    if (editingColorIndex === null) return;
    if (!editColorData.name.trim()) {
      alert('Color name (French) is required');
      return;
    }

    setFormData((prev) => {
      const newVariants = [...prev.colorVariants];
      newVariants[editingColorIndex] = {
        ...newVariants[editingColorIndex],
        name: editColorData.name,
        nameAr: editColorData.nameAr,
        hexCode: editColorData.hexCode,
      };
      return { ...prev, colorVariants: newVariants };
    });
    setEditingColorIndex(null);
  };

  const handleColorImageUpload = async (colorIndex: number, files: FileList) => {
    if (!files || files.length === 0) return;

    const currentColor = formData.colorVariants[colorIndex];
    const remainingSlots = 5 - currentColor.images.length;

    if (remainingSlots === 0) {
      alert('Maximum 5 images per color');
      return;
    }

    const validFiles: File[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (!file.type.startsWith('image/')) {
        alert(`File "${file.name}" is not an image`);
        continue;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert(`File "${file.name}" is too large. Maximum size is 5MB`);
        continue;
      }

      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    setUploadingColorIndex(colorIndex);
    try {
      const uploadedUrls: string[] = [];
      const filesToUpload = validFiles.slice(0, remainingSlots);

      for (const file of filesToUpload) {
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(7);
        const storageRef = ref(storage, `products/${timestamp}_${randomId}_${file.name}`);
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);
        uploadedUrls.push(downloadURL);
      }

      setFormData((prev) => {
        const newVariants = [...prev.colorVariants];
        newVariants[colorIndex] = {
          ...newVariants[colorIndex],
          images: [...newVariants[colorIndex].images, ...uploadedUrls],
        };
        return { ...prev, colorVariants: newVariants };
      });
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Failed to upload images. Please try again.');
    } finally {
      setUploadingColorIndex(null);
    }
  };

  const removeColorImage = (colorIndex: number, imageIndex: number) => {
    setFormData((prev) => {
      const newVariants = [...prev.colorVariants];
      const color = newVariants[colorIndex];
      const newImages = color.images.filter((_, i) => i !== imageIndex);

      let newMainIndex = color.mainImageIndex;
      if (imageIndex === color.mainImageIndex) {
        newMainIndex = 0;
      } else if (imageIndex < color.mainImageIndex) {
        newMainIndex = color.mainImageIndex - 1;
      }

      if (newMainIndex >= newImages.length) {
        newMainIndex = Math.max(0, newImages.length - 1);
      }

      newVariants[colorIndex] = {
        ...color,
        images: newImages,
        mainImageIndex: newMainIndex,
      };

      return { ...prev, colorVariants: newVariants };
    });
  };

  const setColorMainImage = (colorIndex: number, imageIndex: number) => {
    setFormData((prev) => {
      const newVariants = [...prev.colorVariants];
      newVariants[colorIndex] = {
        ...newVariants[colorIndex],
        mainImageIndex: imageIndex,
      };
      return { ...prev, colorVariants: newVariants };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nameFr || !formData.reference) {
      alert('Please fill in required fields: Product Name and Reference');
      return;
    }

    if (formData.colorVariants.length === 0) {
      alert('Please add at least one color variant');
      return;
    }

    for (let i = 0; i < formData.colorVariants.length; i++) {
      const color = formData.colorVariants[i];
      if (color.images.length < 4) {
        alert(`Color "${color.name}" needs at least 4 images (currently has ${color.images.length})`);
        return;
      }
      if (color.images.length > 5) {
        alert(`Color "${color.name}" has too many images. Maximum is 5.`);
        return;
      }
    }

    setSaving(true);
    setSaved(false);

    try {
      const productData = {
        brand: formData.brand,
        category: formData.category || '',
        reference: formData.reference,
        nameFr: formData.nameFr,
        descriptionFr: formData.descriptionFr || '',
        status: formData.status,
        colorVariants: formData.colorVariants,
        updatedAt: serverTimestamp(),
      };

      if (productId) {
        await updateDoc(doc(db, COLLECTIONS.PRODUCTS, productId), productData);
      } else {
        await addDoc(collection(db, COLLECTIONS.PRODUCTS), {
          ...productData,
          createdAt: serverTimestamp(),
        });
      }

      setSaved(true);
      setTimeout(() => {
        router.push('/admin/products');
      }, 1500);
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Failed to save product. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user) {
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
              <Link href="/admin/products">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">
                {productId ? 'Edit Product' : 'Add Product'}
              </h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Product details and identification</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="brand">Brand *</Label>
                  <Select
                    value={formData.brand}
                    onValueChange={(value: 'edos' | 'eleman') =>
                      setFormData((prev) => ({ ...prev, brand: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="edos">Edo&apos;s Footwear</SelectItem>
                      <SelectItem value="eleman">Eleman Shoes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="reference">Reference / SKU *</Label>
                  <Input
                    id="reference"
                    value={formData.reference}
                    onChange={(e) => setFormData((prev) => ({ ...prev, reference: e.target.value }))}
                    placeholder="e.g., EDO-2024-001"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="nameFr">Product Name (French) *</Label>
                <Input
                  id="nameFr"
                  value={formData.nameFr}
                  onChange={(e) => setFormData((prev) => ({ ...prev, nameFr: e.target.value }))}
                  placeholder="e.g., Chaussure en cuir classique"
                  required
                />
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                  placeholder="e.g., Formal, Casual, Sport"
                />
              </div>

              <div>
                <Label htmlFor="descriptionFr">Description (French)</Label>
                <Textarea
                  id="descriptionFr"
                  value={formData.descriptionFr}
                  onChange={(e) => setFormData((prev) => ({ ...prev, descriptionFr: e.target.value }))}
                  placeholder="Product description..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: 'active' | 'hidden') =>
                    setFormData((prev) => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="hidden">Hidden</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Color Variants</CardTitle>
              <CardDescription>
                Each color must have 4-5 images. Images are unique to each color.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.colorVariants.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="mb-4">No colors added yet</p>
                  <Button type="button" onClick={addNewColor} variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Color
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {formData.colorVariants.map((color, colorIndex) => (
                    <div key={colorIndex} className="border border-gray-200 rounded-lg bg-white">
                      <div
                        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                        onClick={() =>
                          setExpandedColorIndex(expandedColorIndex === colorIndex ? null : colorIndex)
                        }
                      >
                        <div className="flex items-center gap-3">
                          {color.hexCode && (
                            <div
                              className="w-8 h-8 rounded-full border-2 border-gray-300"
                              style={{ backgroundColor: color.hexCode }}
                            />
                          )}
                          <div>
                            <p className="font-semibold text-gray-900">{color.name}</p>
                            <p className="text-sm text-gray-600">
                              {color.nameAr} • {color.images.length} image(s)
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              startEditingColor(colorIndex);
                            }}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeColor(colorIndex);
                            }}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                          {expandedColorIndex === colorIndex ? (
                            <ChevronUp className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                      </div>

                      {expandedColorIndex === colorIndex && (
                        <div className="border-t border-gray-200 p-4 space-y-4">
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                            {color.images.map((url, imageIndex) => (
                              <div key={imageIndex} className="relative group">
                                <div
                                  className={`relative aspect-square rounded-lg overflow-hidden border-4 cursor-pointer ${
                                    imageIndex === color.mainImageIndex
                                      ? 'border-amber-500'
                                      : 'border-gray-200'
                                  }`}
                                  onClick={() => setColorMainImage(colorIndex, imageIndex)}
                                >
                                  <Image src={url} alt={`${color.name} ${imageIndex + 1}`} fill className="object-cover" />
                                  {imageIndex === color.mainImageIndex && (
                                    <div className="absolute top-1 left-1 bg-amber-500 text-white px-2 py-0.5 rounded text-xs font-bold">
                                      MAIN
                                    </div>
                                  )}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeColorImage(colorIndex, imageIndex)}
                                  className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>

                          {color.images.length < 5 && (
                            <div>
                              <Label htmlFor={`color-images-${colorIndex}`}>
                                Upload Images ({color.images.length}/5) - Minimum 4 required
                              </Label>
                              <Input
                                id={`color-images-${colorIndex}`}
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={(e) => {
                                  if (e.target.files) handleColorImageUpload(colorIndex, e.target.files);
                                }}
                                disabled={uploadingColorIndex === colorIndex}
                              />
                              {uploadingColorIndex === colorIndex && (
                                <p className="text-sm text-gray-500 mt-2">
                                  <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                                  Uploading...
                                </p>
                              )}
                            </div>
                          )}

                          {color.images.length < 4 && (
                            <p className="text-sm text-amber-600 font-medium">
                              ⚠ This color needs at least {4 - color.images.length} more image(s)
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {formData.colorVariants.length > 0 && (
                <Button type="button" onClick={addNewColor} variant="outline" className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Another Color
                </Button>
              )}
            </CardContent>
          </Card>

          <div className="flex items-center justify-end gap-4">
            {saved && (
              <div className="flex items-center gap-2 text-green-600">
                <Check className="w-4 h-4" />
                <span className="text-sm font-medium">Product saved successfully</span>
              </div>
            )}
            <Button type="submit" disabled={saving || uploadingColorIndex !== null} size="lg">
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Product'
              )}
            </Button>
          </div>
        </form>
      </div>

      {editingColorIndex !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Edit Color</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="edit-color-name">Color Name (French) *</Label>
                <Input
                  id="edit-color-name"
                  value={editColorData.name}
                  onChange={(e) => setEditColorData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Noir"
                />
              </div>
              <div>
                <Label htmlFor="edit-color-nameAr">Color Name (Arabic)</Label>
                <Input
                  id="edit-color-nameAr"
                  value={editColorData.nameAr}
                  onChange={(e) => setEditColorData((prev) => ({ ...prev, nameAr: e.target.value }))}
                  placeholder="e.g., أسود"
                />
              </div>
              <div>
                <Label htmlFor="edit-color-hex">Hex Code (optional)</Label>
                <Input
                  id="edit-color-hex"
                  value={editColorData.hexCode}
                  onChange={(e) => setEditColorData((prev) => ({ ...prev, hexCode: e.target.value }))}
                  placeholder="#000000"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setEditingColorIndex(null)}>
                  Cancel
                </Button>
                <Button type="button" onClick={saveColorEdit}>
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
