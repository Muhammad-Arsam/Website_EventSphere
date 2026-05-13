import API from '@/api/api.config';
import { Category } from '@/types/category.types';

export const categoryService = {
  getActiveCategories: async (): Promise<Category[]> => {
    const response = await API.get<Category[]>('/api/categories/get-active-categories');
    return response.data;
  }
};