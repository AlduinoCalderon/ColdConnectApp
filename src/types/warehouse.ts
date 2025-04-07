export interface Warehouse {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  distance?: number;
  temperature?: number;
  humidity?: number;
  status: 'active' | 'inactive' | 'maintenance';
} 