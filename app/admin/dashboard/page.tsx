'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import {
  Package,
  ShoppingCart,
  Users,
  FileText,
  Settings,
  LogOut,
  Menu,
  Tag,
  FolderOpen,
} from 'lucide-react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { COLLECTIONS } from '@/lib/firebase/collections';

export default function AdminDashboardPage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    pendingOrders: 0,
    brands: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/admin/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [productsSnap, ordersSnap, pendingOrdersSnap, brandsSnap] = await Promise.all([
          getDocs(collection(db, COLLECTIONS.PRODUCTS)),
          getDocs(collection(db, COLLECTIONS.ORDERS)),
          getDocs(query(collection(db, COLLECTIONS.ORDERS), where('status', '==', 'pending'))),
          getDocs(collection(db, COLLECTIONS.BRANDS)),
        ]);

        setStats({
          products: productsSnap.size,
          orders: ordersSnap.size,
          pendingOrders: pendingOrdersSnap.size,
          brands: brandsSnap.size,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoadingStats(false);
      }
    };

    if (user) {
      fetchStats();
    }
  }, [user]);

  const handleLogout = async () => {
    await signOut();
    router.push('/admin/login');
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
            <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{user.email}</span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h2>
          <p className="text-gray-600">Welcome back, manage your B2B wholesale platform</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Products</CardTitle>
              <Package className="w-4 h-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loadingStats ? '...' : stats.products}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Orders</CardTitle>
              <ShoppingCart className="w-4 h-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loadingStats ? '...' : stats.orders}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Pending Orders</CardTitle>
              <FileText className="w-4 h-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {loadingStats ? '...' : stats.pendingOrders}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Active Brands</CardTitle>
              <Tag className="w-4 h-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loadingStats ? '...' : stats.brands}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition cursor-pointer">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
                <Tag className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle>Brands</CardTitle>
              <CardDescription>Manage Edo&apos;s and Eleman brands</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/brands">
                <Button className="w-full">Manage Brands</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition cursor-pointer">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-2">
                <FolderOpen className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle>Divisions</CardTitle>
              <CardDescription>Manage product divisions</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/divisions">
                <Button className="w-full">Manage Divisions</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition cursor-pointer">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-2">
                <Package className="w-6 h-6 text-purple-600" />
              </div>
              <CardTitle>Products</CardTitle>
              <CardDescription>Add and manage products</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/products">
                <Button className="w-full">Manage Products</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition cursor-pointer">
            <CardHeader>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-2">
                <ShoppingCart className="w-6 h-6 text-orange-600" />
              </div>
              <CardTitle>Orders</CardTitle>
              <CardDescription>View and manage quotation requests</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/orders">
                <Button className="w-full">View Orders</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition cursor-pointer">
            <CardHeader>
              <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-2">
                <Users className="w-6 h-6 text-pink-600" />
              </div>
              <CardTitle>Clients</CardTitle>
              <CardDescription>Manage B2B client relationships</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/clients">
                <Button className="w-full">View Clients</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition cursor-pointer">
            <CardHeader>
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-2">
                <Settings className="w-6 h-6 text-gray-600" />
              </div>
              <CardTitle>Settings</CardTitle>
              <CardDescription>Configure platform settings</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/settings">
                <Button className="w-full" variant="outline">
                  Settings
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
