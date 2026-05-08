/**
 * @fileoverview Product Service.
 * Handles API communications for product catalog management, categories, and cursor-based pagination.
 */

import api from '../lib/api';

export interface BackendProduct {
  id?: number | string;
  product_id?: number | string;
  name: string;
  description?: string;
  base_price?: number | string;
  price?: number | string;
  stock_quantity?: number | string;
  categories?: string[];
  category_name?: string;
}

export interface Category {
  category_id: number;
  name: string;
}

export interface ProductInput {
  name: string;
  description?: string;
  price: number;
  stock: number;
  categories: string[];
}

export const productService = {
  /**
   * Retrieves a paginated list of products using cursor pagination.
   * Supports an optional search string for filtering by name.
   */
  getAllProducts: async (
    cursor: number | string = 0,
    limit: number = 24,
    search?: string
  ) => {
    const params: Record<string, unknown> = {cursor, limit};
    if (search) params.search = search;

    const res = await api.get('/products/cursor', {params});
    return res.data;
  },

  /**
   * Retrieves all available product categories.
   */
  getAllCategories: async (): Promise<Category[]> => {
    const res = await api.get('/categories');
    return res.data;
  },

  /**
   * Creates a new product in the catalog.
   */
  createProduct: async (productData: ProductInput) => {
    const res = await api.post('/products', productData);
    return res.data;
  },

  /**
   * Updates an existing product's details.
   */
  updateProduct: async (
    productId: number | string,
    productData: ProductInput
  ) => {
    const res = await api.put(`/products/${productId}`, productData);
    return res.data;
  },

  /**
   * Deletes a product from the catalog.
   */
  deleteProduct: async (productId: number | string) => {
    const res = await api.delete(`/products/${productId}`);
    return res.data;
  },

  /**
   * Creates a new product category.
   */
  createCategory: async (name: string) => {
    const res = await api.post('/categories', {name});
    return res.data;
  },

  /**
   * Updates an existing category's name.
   */
  updateCategory: async (categoryId: number, name: string) => {
    const res = await api.put(`/categories/${categoryId}`, {name});
    return res.data;
  },

  /**
   * Deletes a category.
   */
  deleteCategory: async (categoryId: number) => {
    const res = await api.delete(`/categories/${categoryId}`);
    return res.data;
  },
};
