export interface Warehouse {
  warehouseId: number;
  name: string;
  address: string;
  status: string;
  amenities: Amenity[];
  operatingHours: OperatingHours;
  location: Location;
  storageUnits: StorageUnit[];
  ownerId: number;
}

interface Amenity {
  type: string;
  available: boolean;
  description: string;
}

interface OperatingHours {
  weekdays: Weekday[];
}

interface Weekday {
  day: string;
  open: string;
  close: string;
}

interface Location {
  x: number;
  y: number;
}

interface StorageUnit {
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
  status: string;
} 