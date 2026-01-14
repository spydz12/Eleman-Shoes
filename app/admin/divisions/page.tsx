'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Plus, Edit, Trash2, Loader2, Check } from 'lucide-react';
import Link from 'next/link';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { COLLECTIONS } from '@/lib/firebase/collections';
import { Division } from '@/lib/firebase/types';

export default function AdminDivisionsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingDivision, setEditingDivision] = useState<Division | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    nameAr: '',
    slug: '',
    order: 0,
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/admin/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchDivisions();
    }
  }, [user]);

  const fetchDivisions = async () => {
    try {
      const divisionsSnap = await getDocs(collection(db, COLLECTIONS.DIVISIONS));
      const divisionsData = divisionsSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Division[];
      setDivisions(divisionsData.sort((a, b) => a.order - b.order));
    } catch (error) {
      console.error('Error fetching divisions:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.nameAr || !formData.slug) {
      alert('Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      const divisionData = {
        name: formData.name,
        nameAr: formData.nameAr,
        slug: formData.slug.toLowerCase().replace(/\s+/g, '-'),
        order: formData.order,
        updatedAt: serverTimestamp(),
      };

      if (editingDivision) {
        await updateDoc(doc(db, COLLECTIONS.DIVISIONS, editingDivision.id), divisionData);
      } else {
        await addDoc(collection(db, COLLECTIONS.DIVISIONS), {
          ...divisionData,
          createdAt: serverTimestamp(),
        });
      }

      setFormData({
        name: '',
        nameAr: '',
        slug: '',
        order: 0,
      });
      setShowForm(false);
      setEditingDivision(null);
      fetchDivisions();
    } catch (error) {
      console.error('Error saving division:', error);
      alert('Failed to save division');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (division: Division) => {
    setFormData({
      name: division.name,
      nameAr: division.nameAr,
      slug: division.slug,
      order: division.order,
    });
    setEditingDivision(division);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this division?')) return;

    try {
      await deleteDoc(doc(db, COLLECTIONS.DIVISIONS, id));
      setDivisions(divisions.filter((d) => d.id !== id));
    } catch (error) {
      console.error('Error deleting division:', error);
      alert('Failed to delete division');
    }
  };

  const cancelForm = () => {
    setFormData({
      name: '',
      nameAr: '',
      slug: '',
      order: 0,
    });
    setShowForm(false);
    setEditingDivision(null);
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
              <h1 className="text-2xl font-bold text-gray-900">Manage Divisions</h1>
            </div>
            {!showForm && (
              <Button onClick={() => setShowForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Division
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {showForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>{editingDivision ? 'Edit Division' : 'Add New Division'}</CardTitle>
              <CardDescription>
                {editingDivision ? 'Update division information' : 'Create a new product division'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Division Name (French) *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Men's Shoes"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="nameAr">Division Name (Arabic) *</Label>
                    <Input
                      id="nameAr"
                      value={formData.nameAr}
                      onChange={(e) => setFormData((prev) => ({ ...prev, nameAr: e.target.value }))}
                      placeholder="e.g., أحذية رجالية"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="slug">Slug (URL-friendly) *</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                      placeholder="e.g., mens-shoes"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="order">Display Order</Label>
                    <Input
                      id="order"
                      type="number"
                      value={formData.order}
                      onChange={(e) => setFormData((prev) => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                      placeholder="0"
                    />
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
                        {editingDivision ? 'Update Division' : 'Create Division'}
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
            <p className="text-gray-600">Loading divisions...</p>
          </div>
        ) : divisions.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-gray-600 mb-4">No divisions found</p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Division
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {divisions.map((division) => (
              <Card key={division.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                        {division.order}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{division.name}</CardTitle>
                        <CardDescription>{division.nameAr}</CardDescription>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(division)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(division.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    <strong>Slug:</strong> {division.slug}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
