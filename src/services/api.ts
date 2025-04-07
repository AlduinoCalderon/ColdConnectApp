import axios from 'axios';
import { Warehouse } from '../types/warehouse';

const API_BASE_URL = 'https://coldstoragehub.onrender.com/API';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

// Generic CRUD operations
export const create = async <T>(endpoint: string, data: any): Promise<ApiResponse<T>> => {
  try {
    console.log('Making POST request to:', `${API_BASE_URL}${endpoint}`);
    console.log('Request data:', data);
    const response = await api.post<ApiResponse<T>>(endpoint, data);
    console.log('Response status:', response.status);
    console.log('Response data:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error in create:', error);
    throw error;
  }
};

export const getAll = async <T>(endpoint: string): Promise<ApiResponse<T>> => {
  try {
    console.log('Making GET request to:', `${API_BASE_URL}${endpoint}`);
    const response = await api.get<ApiResponse<T>>(endpoint);
    console.log('Response status:', response.status);
    console.log('Response data:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error in getAll:', error);
    throw error;
  }
};

export const getById = async <T>(endpoint: string, id: number): Promise<ApiResponse<T>> => {
  try {
    console.log('Making GET request to:', `${API_BASE_URL}${endpoint}/${id}`);
    const response = await api.get<ApiResponse<T>>(`${endpoint}/${id}`);
    console.log('Response status:', response.status);
    console.log('Response data:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error in getById:', error);
    throw error;
  }
};

export const update = async <T>(endpoint: string, id: number, data: any): Promise<ApiResponse<T>> => {
  try {
    console.log('Making PUT request to:', `${API_BASE_URL}${endpoint}/${id}`);
    console.log('Request data:', data);
    const response = await api.put<ApiResponse<T>>(`${endpoint}/${id}`, data);
    console.log('Response status:', response.status);
    console.log('Response data:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error in update:', error);
    throw error;
  }
};

export const remove = async (endpoint: string, id: number): Promise<void> => {
  try {
    console.log('Making DELETE request to:', `${API_BASE_URL}${endpoint}/${id}`);
    const response = await api.delete(`${endpoint}/${id}`);
    console.log('Response status:', response.status);
    console.log('Response data:', response.data);
  } catch (error) {
    console.error('Error in remove:', error);
    throw error;
  }
};

// Funciones específicas para warehouses
export const getWarehouses = async (): Promise<Warehouse[]> => {
  try {
    console.log('Making request to:', `${API_BASE_URL}/warehouses`);
    const response = await api.get('/warehouses');
    console.log('Raw response:', response);
    
    // Verificar si la respuesta tiene la estructura esperada
    if (response.data && Array.isArray(response.data)) {
      return response.data;
    } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
      return response.data.data;
    } else {
      console.error('Unexpected response structure:', response.data);
      throw new Error('La estructura de la respuesta no es la esperada');
    }
  } catch (error) {
    console.error('Error fetching warehouses:', error);
    if (axios.isAxiosError(error)) {
      console.error('Axios error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
    }
    throw error;
  }
};

export default api; 