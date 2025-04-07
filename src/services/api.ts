import axios from 'axios';
import { Warehouse } from '../types/warehouse';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = {
  async getWarehouses(): Promise<Warehouse[]> {
    try {
      const response = await axios.get<Warehouse[]>(`${BASE_URL}/warehouses`);
      return response.data;
    } catch (error) {
      console.error('Error fetching warehouses:', error);
      return [];
    }
  },

  async getWarehouseDetails(id: string): Promise<Warehouse | null> {
    try {
      const response = await axios.get<Warehouse>(`${BASE_URL}/warehouses/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching warehouse ${id}:`, error);
      return null;
    }
  }
};

export { api }; 