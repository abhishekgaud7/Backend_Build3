# BUILD-SETU Frontend Implementation Guide

Complete guide for implementing all API integrations, custom hooks, dashboards, and component structures.

## Table of Contents

1. [API Client Setup](#api-client-setup)
2. [Custom Hooks for API Calls](#custom-hooks-for-api-calls)
3. [Authentication Flow](#authentication-flow)
4. [Dashboard Structure](#dashboard-structure)
5. [Page Routes Map](#page-routes-map)
6. [Component Architecture](#component-architecture)
7. [State Management](#state-management)
8. [Example Implementations](#example-implementations)

---

## API Client Setup

### 1. Create `client/lib/api.ts` - API Client Configuration

```typescript
// Base configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Store token in localStorage
const getToken = () => localStorage.getItem('accessToken');
const setToken = (token: string) => localStorage.setItem('accessToken', token);
const clearToken = () => localStorage.removeItem('accessToken');

// Fetch wrapper with auth
export async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'API Error');
  }

  return response.json();
}

// Auth endpoints
export const authApi = {
  register: (data: {
    name: string;
    email: string;
    phone: string;
    role: 'BUYER' | 'SELLER';
    password: string;
    confirmPassword: string;
  }) => apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  login: (email: string, password: string) =>
    apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  logout: () => apiFetch('/auth/logout', { method: 'POST' }),

  getCurrentUser: () => apiFetch('/auth/me'),
};

// Products endpoints
export const productsApi = {
  getAll: (search?: string, categorySlug?: string, page = 1, limit = 10) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (categorySlug) params.append('categorySlug', categorySlug);
    params.append('page', String(page));
    params.append('limit', String(limit));
    return apiFetch(`/products?${params.toString()}`);
  },

  getById: (id: string) => apiFetch(`/products/${id}`),

  create: (data: any) => apiFetch('/products', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  update: (id: string, data: any) => apiFetch(`/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  delete: (id: string) => apiFetch(`/products/${id}`, { method: 'DELETE' }),
};

// Categories endpoints
export const categoriesApi = {
  getAll: () => apiFetch('/categories'),

  getBySlug: (slug: string) => apiFetch(`/categories/${slug}`),

  create: (data: any) => apiFetch('/categories', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  update: (id: string, data: any) => apiFetch(`/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  delete: (id: string) => apiFetch(`/categories/${id}`, { method: 'DELETE' }),
};

// Orders endpoints
export const ordersApi = {
  getAll: (page = 1, limit = 10) =>
    apiFetch(`/orders?page=${page}&limit=${limit}`),

  getById: (id: string) => apiFetch(`/orders/${id}`),

  create: (items: any[], addressId: string) =>
    apiFetch('/orders', {
      method: 'POST',
      body: JSON.stringify({ items, addressId }),
    }),

  updateStatus: (id: string, status: string) =>
    apiFetch(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),
};

// Addresses endpoints
export const addressesApi = {
  getAll: () => apiFetch('/addresses'),

  getById: (id: string) => apiFetch(`/addresses/${id}`),

  create: (data: any) => apiFetch('/addresses', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  update: (id: string, data: any) => apiFetch(`/addresses/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  delete: (id: string) => apiFetch(`/addresses/${id}`, { method: 'DELETE' }),
};

// Support tickets endpoints
export const supportApi = {
  getAll: (page = 1, limit = 10) =>
    apiFetch(`/support?page=${page}&limit=${limit}`),

  getById: (id: string) => apiFetch(`/support/${id}`),

  create: (subject: string, description: string) =>
    apiFetch('/support', {
      method: 'POST',
      body: JSON.stringify({ subject, description }),
    }),

  addMessage: (ticketId: string, message: string) =>
    apiFetch(`/support/${ticketId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    }),

  updateStatus: (id: string, status: string) =>
    apiFetch(`/support/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),
};

export { getToken, setToken, clearToken };
```

---

## Custom Hooks for API Calls

### 1. Create `client/hooks/useAuth.ts` - Authentication Hook

```typescript
import { useState, useCallback, useEffect } from 'react';
import { authApi, setToken, getToken, clearToken } from '@/lib/api';
import { toast } from 'sonner';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: 'BUYER' | 'SELLER' | 'ADMIN';
  createdAt: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = getToken();
      if (token) {
        try {
          const response = await authApi.getCurrentUser();
          setUser(response.data);
        } catch (err) {
          clearToken();
          setUser(null);
        }
      }
    };
    checkAuth();
  }, []);

  const register = useCallback(async (data: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authApi.register(data);
      setToken(response.data.accessToken);
      setUser(response.data.user);
      toast.success('Registration successful!');
      return response.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authApi.login(email, password);
      setToken(response.data.accessToken);
      setUser(response.data.user);
      toast.success('Login successful!');
      return response.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
      clearToken();
      setUser(null);
      toast.success('Logged out successfully');
    } catch (err) {
      console.error('Logout error:', err);
    }
  }, []);

  const isAuthenticated = !!user;
  const isSeller = user?.role === 'SELLER' || user?.role === 'ADMIN';
  const isAdmin = user?.role === 'ADMIN';

  return {
    user,
    loading,
    error,
    register,
    login,
    logout,
    isAuthenticated,
    isSeller,
    isAdmin,
  };
}
```

### 2. Create `client/hooks/useProducts.ts` - Products Hook

```typescript
import { useState, useCallback, useEffect } from 'react';
import { productsApi } from '@/lib/api';
import { toast } from 'sonner';

export function useProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const fetchProducts = useCallback(
    async (search?: string, categorySlug?: string, page = 1) => {
      setLoading(true);
      try {
        const response = await productsApi.getAll(search, categorySlug, page);
        setProducts(response.data);
        setPagination(response.pagination);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch products';
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const getProduct = useCallback(async (id: string) => {
    try {
      const response = await productsApi.getById(id);
      return response.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch product';
      toast.error(message);
      throw err;
    }
  }, []);

  const createProduct = useCallback(async (data: any) => {
    try {
      const response = await productsApi.create(data);
      toast.success('Product created successfully!');
      await fetchProducts();
      return response.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create product';
      toast.error(message);
      throw err;
    }
  }, [fetchProducts]);

  const updateProduct = useCallback(async (id: string, data: any) => {
    try {
      const response = await productsApi.update(id, data);
      toast.success('Product updated successfully!');
      await fetchProducts();
      return response.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update product';
      toast.error(message);
      throw err;
    }
  }, [fetchProducts]);

  const deleteProduct = useCallback(async (id: string) => {
    try {
      await productsApi.delete(id);
      toast.success('Product deleted successfully!');
      await fetchProducts();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete product';
      toast.error(message);
      throw err;
    }
  }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    pagination,
    fetchProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
  };
}
```

### 3. Create `client/hooks/useOrders.ts` - Orders Hook

```typescript
import { useState, useCallback, useEffect } from 'react';
import { ordersApi } from '@/lib/api';
import { toast } from 'sonner';

export function useOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const fetchOrders = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const response = await ordersApi.getAll(page);
      setOrders(response.data);
      setPagination(response.pagination);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch orders';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const getOrder = useCallback(async (id: string) => {
    try {
      const response = await ordersApi.getById(id);
      return response.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch order';
      toast.error(message);
      throw err;
    }
  }, []);

  const createOrder = useCallback(async (items: any[], addressId: string) => {
    try {
      const response = await ordersApi.create(items, addressId);
      toast.success('Order placed successfully!');
      await fetchOrders();
      return response.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create order';
      toast.error(message);
      throw err;
    }
  }, [fetchOrders]);

  const updateOrderStatus = useCallback(async (id: string, status: string) => {
    try {
      const response = await ordersApi.updateStatus(id, status);
      toast.success('Order status updated!');
      await fetchOrders();
      return response.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update order';
      toast.error(message);
      throw err;
    }
  }, [fetchOrders]);

  return {
    orders,
    loading,
    error,
    pagination,
    fetchOrders,
    getOrder,
    createOrder,
    updateOrderStatus,
  };
}
```

### 4. Create `client/hooks/useAddresses.ts` - Addresses Hook

```typescript
import { useState, useCallback, useEffect } from 'react';
import { addressesApi } from '@/lib/api';
import { toast } from 'sonner';

export function useAddresses() {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAddresses = useCallback(async () => {
    setLoading(true);
    try {
      const response = await addressesApi.getAll();
      setAddresses(response.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch addresses';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const createAddress = useCallback(async (data: any) => {
    try {
      const response = await addressesApi.create(data);
      toast.success('Address added successfully!');
      await fetchAddresses();
      return response.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add address';
      toast.error(message);
      throw err;
    }
  }, [fetchAddresses]);

  const updateAddress = useCallback(async (id: string, data: any) => {
    try {
      const response = await addressesApi.update(id, data);
      toast.success('Address updated successfully!');
      await fetchAddresses();
      return response.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update address';
      toast.error(message);
      throw err;
    }
  }, [fetchAddresses]);

  const deleteAddress = useCallback(async (id: string) => {
    try {
      await addressesApi.delete(id);
      toast.success('Address deleted successfully!');
      await fetchAddresses();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete address';
      toast.error(message);
      throw err;
    }
  }, [fetchAddresses]);

  return {
    addresses,
    loading,
    error,
    fetchAddresses,
    createAddress,
    updateAddress,
    deleteAddress,
  };
}
```

### 5. Create `client/hooks/useCategories.ts` - Categories Hook

```typescript
import { useState, useCallback, useEffect } from 'react';
import { categoriesApi } from '@/lib/api';
import { toast } from 'sonner';

export function useCategories() {
  const [categories, setCa] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const response = await categoriesApi.getAll();
      setCategories(response.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch categories';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const getCategory = useCallback(async (slug: string) => {
    try {
      const response = await categoriesApi.getBySlug(slug);
      return response.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch category';
      toast.error(message);
      throw err;
    }
  }, []);

  return {
    categories,
    loading,
    error,
    fetchCategories,
    getCategory,
  };
}
```

---

## Authentication Flow

### 1. Create `client/context/AuthContext.tsx` - Auth Provider

```typescript
import React, { createContext, useContext } from 'react';
import { useAuth } from '@/hooks/useAuth';

const AuthContext = createContext<any>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
}
```

### 2. Create `client/components/ProtectedRoute.tsx`

```typescript
import { Navigate } from 'react-router-dom';
import { useAuthContext } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'BUYER' | 'SELLER' | 'ADMIN';
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthContext();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole && user?.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
```

---

## Dashboard Structure

### Buyer Dashboard Pages

```
client/pages/
├── dashboard/
│   ├── BuyerDashboard.tsx
│   ├── MyOrders.tsx
│   ├── OrderDetails.tsx
│   ├── MyAddresses.tsx
│   ├── Profile.tsx
│   └── SupportTickets.tsx
```

### Seller Dashboard Pages

```
client/pages/
├── seller/
│   ├── SellerDashboard.tsx
│   ├── MyProducts.tsx
│   ├── CreateProduct.tsx
│   ├── EditProduct.tsx
│   ├── Orders.tsx
│   └── Analytics.tsx
```

### Public Pages

```
client/pages/
├── Index.tsx (Home/Browse)
├── ProductDetails.tsx
├── Category.tsx
├── Login.tsx
├── Register.tsx
├── NotFound.tsx
```

---

## Page Routes Map

Update `client/App.tsx`:

```typescript
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';

// Public pages
import Index from '@/pages/Index';
import ProductDetails from '@/pages/ProductDetails';
import Category from '@/pages/Category';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import NotFound from '@/pages/NotFound';

// Buyer pages
import BuyerDashboard from '@/pages/dashboard/BuyerDashboard';
import MyOrders from '@/pages/dashboard/MyOrders';
import OrderDetails from '@/pages/dashboard/OrderDetails';
import MyAddresses from '@/pages/dashboard/MyAddresses';
import Profile from '@/pages/dashboard/Profile';
import SupportTickets from '@/pages/dashboard/SupportTickets';

// Seller pages
import SellerDashboard from '@/pages/seller/SellerDashboard';
import MyProducts from '@/pages/seller/MyProducts';
import CreateProduct from '@/pages/seller/CreateProduct';
import EditProduct from '@/pages/seller/EditProduct';
import SellerOrders from '@/pages/seller/Orders';
import Analytics from '@/pages/seller/Analytics';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Index />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/category/:slug" element={<Category />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Buyer Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <BuyerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/orders"
            element={
              <ProtectedRoute>
                <MyOrders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/orders/:id"
            element={
              <ProtectedRoute>
                <OrderDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/addresses"
            element={
              <ProtectedRoute>
                <MyAddresses />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/support"
            element={
              <ProtectedRoute>
                <SupportTickets />
              </ProtectedRoute>
            }
          />

          {/* Seller Routes */}
          <Route
            path="/seller"
            element={
              <ProtectedRoute requiredRole="SELLER">
                <SellerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/seller/products"
            element={
              <ProtectedRoute requiredRole="SELLER">
                <MyProducts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/seller/products/new"
            element={
              <ProtectedRoute requiredRole="SELLER">
                <CreateProduct />
              </ProtectedRoute>
            }
          />
          <Route
            path="/seller/products/:id/edit"
            element={
              <ProtectedRoute requiredRole="SELLER">
                <EditProduct />
              </ProtectedRoute>
            }
          />
          <Route
            path="/seller/orders"
            element={
              <ProtectedRoute requiredRole="SELLER">
                <SellerOrders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/seller/analytics"
            element={
              <ProtectedRoute requiredRole="SELLER">
                <Analytics />
              </ProtectedRoute>
            }
          />

          {/* Catch all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
```

---

## Component Architecture

### Layout Components

```
client/components/
├── layout/
│   ├── Header.tsx (Navigation, auth status)
│   ├── Footer.tsx
│   ├── Sidebar.tsx (For dashboards)
│   └── MainLayout.tsx (Wrapper component)
```

### Shared Components

```
client/components/
├── shared/
│   ├── ProductCard.tsx
│   ├── OrderCard.tsx
│   ├── AddressForm.tsx
│   ├── SearchBar.tsx
│   ├── Pagination.tsx
│   └── LoadingSpinner.tsx
```

### Form Components

```
client/components/
├── forms/
│   ├── LoginForm.tsx
│   ├── RegisterForm.tsx
│   ├── ProductForm.tsx
│   ├── AddressForm.tsx
│   └── SupportTicketForm.tsx
```

---

## State Management

### Cart Context (for Buyers)

```typescript
// client/context/CartContext.tsx
import React, { createContext, useContext, useState } from 'react';

interface CartItem {
  productId: string;
  quantity: number;
  price: string;
}

const CartContext = createContext<any>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const addToCart = (item: CartItem) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.productId === item.productId);
      if (existing) {
        return prev.map(i =>
          i.productId === item.productId
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }
      return [...prev, item];
    });
  };

  const removeFromCart = (productId: string) => {
    setCartItems(prev => prev.filter(i => i.productId !== productId));
  };

  const clearCart = () => setCartItems([]);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
```

---

## Example Implementations

### Example 1: Login Page

```typescript
// client/pages/Login.tsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthContext } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { login, loading, error } = useAuthContext();
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>Sign in to your BUILD-SETU account</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <Input
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
          <p className="text-sm text-gray-600 mt-4 text-center">
            Don't have an account?{' '}
            <Link to="/register" className="text-indigo-600 hover:underline">
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
```

### Example 2: Product Listing (Buyer Dashboard)

```typescript
// client/pages/Index.tsx
import { useState } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { ProductCard } from '@/components/shared/ProductCard';
import { SearchBar } from '@/components/shared/SearchBar';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

export default function Index() {
  const { products, loading, pagination, fetchProducts } = useProducts();
  const { categories } = useCategories();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const handleSearch = async (query: string) => {
    setSearch(query);
    await fetchProducts(query, selectedCategory, 1);
  };

  const handleCategoryFilter = async (slug: string) => {
    setSelectedCategory(slug);
    await fetchProducts(search, slug, 1);
  };

  if (loading && products.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Construction Materials Marketplace</h1>
          <p className="text-lg opacity-90">Find quality materials at the best prices</p>
        </div>
      </section>

      {/* Search & Filter */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <SearchBar value={search} onChange={handleSearch} />

        {/* Category Filter */}
        <div className="mt-6 flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === '' ? 'default' : 'outline'}
            onClick={() => handleCategoryFilter('')}
          >
            All Categories
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat.id}
              variant={selectedCategory === cat.slug ? 'default' : 'outline'}
              onClick={() => handleCategoryFilter(cat.slug)}
            >
              {cat.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No products found</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-12 flex justify-center gap-2">
              {Array.from({ length: pagination.totalPages }).map((_, i) => (
                <Button
                  key={i + 1}
                  variant={pagination.page === i + 1 ? 'default' : 'outline'}
                  onClick={() => fetchProducts(search, selectedCategory, i + 1)}
                >
                  {i + 1}
                </Button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
```

### Example 3: Seller Dashboard - My Products

```typescript
// client/pages/seller/MyProducts.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2 } from 'lucide-react';

export default function MyProducts() {
  const { products, loading, deleteProduct, pagination, fetchProducts } = useProducts();

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      await deleteProduct(id);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Products</h1>
        <Link to="/seller/products/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </Link>
      </div>

      <div className="space-y-4">
        {products.map((product) => (
          <Card key={product.id}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{product.name}</h3>
                  <p className="text-gray-600 text-sm mt-1">{product.description}</p>
                  <div className="mt-2 flex gap-4 text-sm">
                    <span>Price: ₹{product.price}</span>
                    <span>Stock: {product.stockQuantity}</span>
                    <span className={product.isActive ? 'text-green-600' : 'text-red-600'}>
                      {product.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link to={`/seller/products/${product.id}/edit`}>
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(product.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

### Example 4: Buyer Dashboard - My Orders

```typescript
// client/pages/dashboard/MyOrders.tsx
import { useOrders } from '@/hooks/useOrders';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';

export default function MyOrders() {
  const { orders, loading } = useOrders();

  if (loading) {
    return <div className="text-center py-12">Loading orders...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">My Orders</h1>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <p className="text-gray-500 mb-4">You haven't placed any orders yet</p>
            <Link to="/">
              <Button>Browse Products</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">Order #{order.id.slice(0, 8)}</h3>
                    <div className="text-sm text-gray-600 mt-2 space-y-1">
                      <p>Items: {order.items.length}</p>
                      <p>Total: ₹{order.total}</p>
                      <p className="mt-2">
                        <span className="inline-block px-2 py-1 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: getStatusColor(order.status).bg,
                            color: getStatusColor(order.status).text,
                          }}
                        >
                          {order.status}
                        </span>
                      </p>
                    </div>
                  </div>
                  <Link to={`/dashboard/orders/${order.id}`}>
                    <Button variant="outline">
                      View Details
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function getStatusColor(status: string) {
  const colors: any = {
    PENDING: { bg: '#fef3c7', text: '#92400e' },
    CONFIRMED: { bg: '#dbeafe', text: '#1e40af' },
    SHIPPED: { bg: '#d1e7dd', text: '#1a4d2e' },
    DELIVERED: { bg: '#d1e7dd', text: '#1a4d2e' },
    CANCELLED: { bg: '#fee2e2', text: '#991b1b' },
  };
  return colors[status] || { bg: '#f3f4f6', text: '#374151' };
}
```

---

## Next Steps

1. **Create all API hooks** in `client/hooks/`
2. **Set up Auth Context** in `client/context/`
3. **Create Layout components** (Header, Footer, Sidebar)
4. **Implement all pages** following the structure above
5. **Test all API integrations** with the backend
6. **Add shopping cart functionality** for buyers
7. **Implement order checkout flow**
8. **Add product image uploads** (if needed)
9. **Build seller analytics dashboard**
10. **Add support ticket system**

---

## Configuration

Update `.env.local`:

```env
VITE_API_URL=http://localhost:3001/api
```

---

This guide provides everything needed to build a complete, production-ready frontend for BUILD-SETU!
