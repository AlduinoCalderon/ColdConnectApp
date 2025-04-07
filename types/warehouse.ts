export interface User {
  userId: number;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'owner' | 'customer';
  status: 'active' | 'inactive' | 'suspended';
}

export interface Warehouse {
  warehouseId: number;
  name: string;
  address: string;
  status: 'active' | 'maintenance' | 'closed';
  amenities: Array<{
    type: string;
    available: boolean;
    description: string;
  }>;
  operatingHours: {
    weekdays: Array<{
      day: string;
      open: string;
      close: string;
    }>;
  };
  location: {
    x: number;
    y: number;
  };
  storageUnits: StorageUnit[];
}

export interface StorageUnit {
  unitId: number;
  warehouseId: number;
  name: string;
  width: number;
  height: number;
  depth: number;
  costPerHour: number;
  minTemp: number;
  maxTemp: number;
  minHumidity: number;
  maxHumidity: number;
  status: 'available' | 'occupied' | 'maintenance' | 'reserved';
}

export interface Booking {
  bookingId: number;
  customerId: number;
  warehouseId: number;
  startDate: string;
  endDate: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  units: BookingUnit[];
}

export interface BookingUnit {
  bookingId: number;
  unitId: number;
  pricePerHour: number;
}

export interface WarehouseListProps {
  warehouses: Warehouse[];
  onWarehouseSelect: (warehouse: Warehouse) => void;
}

export interface MapViewProps {
  userLocation: {
    latitude: number;
    longitude: number;
  };
  warehouses: Warehouse[];
  selectedWarehouse?: Warehouse;
}

export interface BookingFormProps {
  warehouse: Warehouse;
  onBookingSubmit: (booking: Omit<Booking, 'bookingId' | 'status'>) => void;
} 