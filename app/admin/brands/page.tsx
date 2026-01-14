'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Plus, Edit, Trash2, Loader2, Check } from 'lucide-react';
import Link from 'next/link';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { COLLECTIONS } from '@/lib/firebase/collections';
import { Brand } from '@/lib/firebase/types';

export default function AdminBrandsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    nameAr: '',
    description: '',
    descriptionAr: '',
    whatsappNumber: '',
    status: 'active' as 'active' | 'disabled',
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/admin/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchBrands();
    }
  }, [user]);

  const fetchBrands = async () => {
    try {
      const brandsSnap = await getDocs(collection(db, COLLECTIONS.BRANDS));
      const brandsData = brandsSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Brand[];
      setBrands(brandsData);
    } catch (error) {
      console.error('Error fetching brands:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.nameAr) {
      alert('Please fill in required fields');
      return;
    }

    setSaving(true);
    try {
      const brandData = {
        name: formData.name,
        nameAr: formData.nameAr,
        description: formData.description,
        descriptionAr: formData.descriptionAr,
        whatsappNumber: formData.whatsappNumber,
        status: formData.status,
        updatedAt: serverTimestamp(),
      };

      if (editingBrand) {
        await updateDoc(doc(db, COLLECTIONS.BRANDS, editingBrand.id), brandData);
      } else {
        await addDoc(collection(db, COLLECTIONS.BRANDS), {
          ...brandData,
          createdAt: serverTimestamp(),
        });
      }

      setFormData({
        name: '',
        nameAr: '',
        description: '',
        descriptionAr: '',
        whatsappNumber: '',
        status: 'active',
      });
      setShowForm(false);
      setEditingBrand(null);
      fetchBrands();
    } catch (error) {
      console.error('Error saving brand:', error);
      alert('Failed to save brand');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (brand: Brand) => {
    setFormData({
      name: brand.name,
      nameAr: brand.nameAr,
      description: brand.description || '',
      descriptionAr: brand.descriptionAr || '',
      whatsappNumber: brand.whatsappNumber || '',
      status: brand.status,
    });
    setEditingBrand(brand);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this brand?')) return;

    try {
      await deleteDoc(doc(db, COLLECTIONS.BRANDS, id));
      setBrands(brands.filter((b) => b.id !== id));
    } catch (error) {
      console.error('Error deleting brand:', error);
      alert('Failed to delete brand');
    }
  };

  const cancelForm = () => {
    setFormData({
      name: '',
      nameAr: '',
      description: '',
      descriptionAr: '',
      whatsappNumber: '',
      status: 'active',
    });
    setShowForm(false);
    setEditingBrand(null);
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
              <Link href="/admin/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Manage Brands</h1>
            </div>
            {!showForm && (
              <Button onClick={() => setShowForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Brand
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {showForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>{editingBrand ? 'Edit Brand' : 'Add New Brand'}</CardTitle>
              <CardDescription>
                {editingBrand ? 'Update brand information' : 'Create a new brand'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Brand Name (French) *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Edo's Footwear"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="nameAr">Brand Name (Arabic) *</Label>
                    <Input
                      id="nameAr"
                      value={formData.nameAr}
                      onChange={(e) => setFormData((prev) => ({ ...prev, nameAr: e.target.value }))}
                      placeholder="e.g., أحذية إيدو"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="description">Description (French)</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                      placeholder="Brand description in French"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="descriptionAr">Description (Arabic)</Label>
                    <Textarea
                      id="descriptionAr"
                      value={formData.descriptionAr}
                      onChange={(e) => setFormData((prev) => ({ ...prev, descriptionAr: e.target.value }))}
                      placeholder="Brand description in Arabic"
                      rows={3}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="whatsappNumber">WhatsApp Number</Label>
                    <Input
                      id="whatsappNumber"
                      value={formData.whatsappNumber}
                      onChange={(e) => setFormData((prev) => ({ ...prev, whatsappNumber: e.target.value }))}
                      placeholder="+213XXXXXXXXX"
                    />
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <select
                      id="status"
                      value={formData.status}
                      onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value as 'active' | 'disabled' }))}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    >
                      <option value="active">Active</option>
                      <option value="disabled">Disabled</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={cancelForm}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        {editingBrand ? 'Update Brand' : 'Create Brand'}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {loadingData ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading brands...</p>
          </div>
        ) : brands.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-gray-600 mb-4">No brands found</p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Brand
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {brands.map((brand) => (
              <Card key={brand.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{brand.name}</span>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        brand.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {brand.status}
                    </span>
                  </CardTitle>
                  <CardDescription>{brand.nameAr}</CardDescription>
                </CardHeader>
                <CardContent>
                  {brand.description && <p className="text-sm text-gray-600 mb-2">{brand.description}</p>}
                  {brand.whatsappNumber && (
                    <p className="text-sm text-gray-600 mb-4">
                      <strong>WhatsApp:</strong> {brand.whatsappNumber}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(brand)} className="flex-1">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(brand.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
