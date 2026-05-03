import api from '../lib/api';

export interface BackendProduct {
  product_id?: string | number;
  id?: string | number;
  name: string;
  description?: string;
  base_price?: string | number;
  price?: string | number;
  stock_quantity?: string | number;
  category_id?: string | number;
  category_name?: string;
  categories?: string[];
}

export interface Category {
  category_id: number;
  name: string;
}

export const productService = {
  // --- PRODUCTS ---
  getAllProducts: async () => {
    const res = await api.get('/products');
    return Array.isArray(res.data) ? res.data : res.data.products || [];
  },

  createProduct: async (productData: unknown) => {
    const res = await api.post('/products', productData);
    return res.data;
  },

  updateProduct: async (id: number, productData: unknown) => {
    const res = await api.put(`/products/${id}`, productData);
    return res.data;
  },

  deleteProduct: async (id: number) => {
    const res = await api.delete(`/products/${id}`);
    return res.data;
  },

  // --- CATEGORIES ---
  getAllCategories: async () => {
    const res = await api.get('/categories');
    return res.data;
  },

  createCategory: async (name: string) => {
    const res = await api.post('/categories', {name});
    return res.data;
  },

  updateCategory: async (id: number, name: string) => {
    const res = await api.put(`/categories/${id}`, {name});
    return res.data;
  },

  deleteCategory: async (id: number) => {
    const res = await api.delete(`/categories/${id}`);
    return res.data;
  },
};
