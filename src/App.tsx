import React, { useEffect, useState, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, DirectionsRenderer } from '@react-google-maps/api';
import { Warehouse } from './types/warehouse';
import { getWarehouses } from './services/api';
import './App.css';

// Centro por defecto (caso que no se permita geolocalización)
const defaultCenter = {
  lat: 19.4326,
  lng: -99.1332
};

// Estilos para el mapa
const mapContainerStyle = {
  width: '100%',
  height: '100%'
};

// Opciones del mapa
const options = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false
};

function App(): React.JSX.Element {
  const [userLocation, setUserLocation] = useState(defaultCenter);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

  // Cargar la API de Google Maps
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ['places', 'directions']
  });

  // Obtener la ubicación del usuario y los almacenes
  useEffect(() => {
    const initializeApp = async () => {
      try {
        setIsLoading(true);
        await requestLocationPermission();
        await fetchWarehouses();
      } catch (error) {
        console.error('Error initializing app:', error);
        setError('Error al inicializar la aplicación: ' + (error as Error).message);
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  const requestLocationPermission = () => {
    return new Promise<void>((resolve, reject) => {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            });
            resolve();
          },
          (error) => {
            setError('Error al obtener la ubicación: ' + error.message);
            setUserLocation(defaultCenter);
            resolve();
          }
        );
      } else {
        setError('La geolocalización no está soportada en este navegador');
        setUserLocation(defaultCenter);
        resolve();
      }
    });
  };

  const fetchWarehouses = async () => {
    try {
      const data = await getWarehouses();
      if (Array.isArray(data)) {
        // Ordenar almacenes por distancia
        const sortedWarehouses = data.sort((a, b) => {
          const distanceA = calculateDistance(
            userLocation.lat,
            userLocation.lng,
            a.location.y,
            a.location.x
          );
          const distanceB = calculateDistance(
            userLocation.lat,
            userLocation.lng,
            b.location.y,
            b.location.x
          );
          return distanceA - distanceB;
        });
        setWarehouses(sortedWarehouses);
      } else {
        setError('Error: Los datos de los almacenes no son válidos');
      }
    } catch (error) {
      console.error('Error fetching warehouses:', error);
      setError('Error al cargar los almacenes: ' + (error as Error).message);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radio de la Tierra en km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const toRad = (value: number): number => {
    return value * Math.PI / 180;
  };

  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    setMapLoaded(true);
  }, []);

  const handleMarkerClick = async (warehouse: Warehouse) => {
    setSelectedWarehouse(warehouse);
    setDirections(null);

    if (mapRef.current) {
      const directionsService = new google.maps.DirectionsService();
      const origin = new google.maps.LatLng(userLocation.lat, userLocation.lng);
      const destination = new google.maps.LatLng(warehouse.location.y, warehouse.location.x);

      try {
        const result = await directionsService.route({
          origin,
          destination,
          travelMode: google.maps.TravelMode.DRIVING,
        });
        setDirections(result);
      } catch (error) {
        console.error('Error al calcular la ruta:', error);
        setError('Error al calcular la ruta');
      }
    }
  };

  const handleInfoWindowClose = () => {
    setSelectedWarehouse(null);
    setDirections(null);
  };

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Cargando aplicación...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="error-screen">
        <h2>Error al cargar Google Maps</h2>
        <p>{loadError.message}</p>
      </div>
    );
  }

  return (
    <div className="app">
      {error && <div className="error-message">{error}</div>}
      
      <div className="map-container">
        {isLoaded ? (
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={userLocation}
            zoom={14}
            options={options}
            onLoad={onMapLoad}
          >
            {/* Marcador de la ubicación del usuario */}
            <Marker
              position={userLocation}
              icon={{
                url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                scaledSize: new window.google.maps.Size(40, 40)
              }}
            />

            {/* Marcadores de los almacenes */}
            {warehouses.map((warehouse) => (
              <Marker
                key={warehouse.warehouseId}
                position={{ lat: warehouse.location.y, lng: warehouse.location.x }}
                onClick={() => handleMarkerClick(warehouse)}
              />
            ))}

            {/* Ventana de información al hacer clic en un marcador */}
            {selectedWarehouse && (
              <InfoWindow
                position={{ lat: selectedWarehouse.location.y, lng: selectedWarehouse.location.x }}
                onCloseClick={handleInfoWindowClose}
              >
                <div className="info-window">
                  <h3>{selectedWarehouse.name}</h3>
                  <p>{selectedWarehouse.address}</p>
                  <p>Estado: {selectedWarehouse.status}</p>
                  <p>Unidades disponibles: {selectedWarehouse.storageUnits.filter(u => u.status === 'available').length}</p>
                </div>
              </InfoWindow>
            )}

            {/* Renderizar la ruta */}
            {directions && <DirectionsRenderer directions={directions} />}
          </GoogleMap>
        ) : (
          <div className="loading-map">Cargando mapa...</div>
        )}
      </div>

      <div className="list-container">
        <h2>Almacenes</h2>
        <div className="warehouse-list">
          {warehouses.length === 0 ? (
            <p>Cargando almacenes...</p>
          ) : (
            warehouses.map((warehouse) => {
              const distance = calculateDistance(
                userLocation.lat,
                userLocation.lng,
                warehouse.location.y,
                warehouse.location.x
              );
              return (
                <div
                  key={warehouse.warehouseId}
                  className={`warehouse-item ${selectedWarehouse?.warehouseId === warehouse.warehouseId ? 'selected' : ''}`}
                  onClick={() => handleMarkerClick(warehouse)}
                >
                  <h3>{warehouse.name}</h3>
                  <p>{warehouse.address}</p>
                  <p>Estado: {warehouse.status}</p>
                  <p>Distancia: {distance.toFixed(1)} km</p>
                  <p>Unidades disponibles: {warehouse.storageUnits.filter(u => u.status === 'available').length}</p>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default App; 