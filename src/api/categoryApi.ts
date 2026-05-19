import type { Category } from "../types/auction";
import apiClient from "./client";
import { endpoints } from "./endpoints";

type CategoriesResponse = {
  data: Category[];
};

export const categoryApi = {
  async getCategories(): Promise<Category[]> {
    const response = await apiClient.get<CategoriesResponse>(
      endpoints.categories,
    );

    return response.data.data;
  },
};
