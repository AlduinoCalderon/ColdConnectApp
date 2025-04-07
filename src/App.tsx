import React, { useEffect, useState, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { Warehouse } from './types/warehouse';
import { api } from './services/api';
import './App.css';

// API URL desde el archivo .env
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

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

  // Cargar la API de Google Maps
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: 'AIzaSyBDaeWicvigtP9xPv919E-RNoxfvC-Hqik' // Tu API key de Google Maps
  });

  // Obtener la ubicación del usuario
  useEffect(() => {
    requestLocationPermission();
    fetchWarehouses();
  }, []);

  const requestLocationPermission = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          setError('Error al obtener la ubicación: ' + error.message);
          // Usar ubicación por defecto
          setUserLocation(defaultCenter);
        }
      );
    } else {
      setError('La geolocalización no está soportada en este navegador');
      // Usar ubicación por defecto
      setUserLocation(defaultCenter);
    }
  };

  const fetchWarehouses = async () => {
    try {
      const data = await api.getWarehouses();
      // Convertir el formato de las coordenadas para Google Maps
      const formattedWarehouses = data.map(warehouse => ({
        ...warehouse,
        position: {
          lat: warehouse.latitude,
          lng: warehouse.longitude
        }
      }));
      setWarehouses(formattedWarehouses);
    } catch (error) {
      setError('Error al cargar los almacenes');
      console.error('Error fetching warehouses:', error);
    }
  };

  const onMapLoad = useCallback(() => {
    setMapLoaded(true);
  }, []);

  const handleMarkerClick = (warehouse: Warehouse) => {
    setSelectedWarehouse(warehouse);
  };

  const handleInfoWindowClose = () => {
    setSelectedWarehouse(null);
  };

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
                key={warehouse.id}
                position={{ lat: warehouse.latitude, lng: warehouse.longitude }}
                onClick={() => handleMarkerClick(warehouse)}
              />
            ))}

            {/* Ventana de información al hacer clic en un marcador */}
            {selectedWarehouse && (
              <InfoWindow
                position={{ lat: selectedWarehouse.latitude, lng: selectedWarehouse.longitude }}
                onCloseClick={handleInfoWindowClose}
              >
                <div className="info-window">
                  <h3>{selectedWarehouse.name}</h3>
                  <p>{selectedWarehouse.address}</p>
                  <p>Estado: {selectedWarehouse.status}</p>
                  {selectedWarehouse.temperature && (
                    <p>Temperatura: {selectedWarehouse.temperature}°C</p>
                  )}
                  {selectedWarehouse.humidity && (
                    <p>Humedad: {selectedWarehouse.humidity}%</p>
                  )}
                </div>
              </InfoWindow>
            )}
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
            warehouses.map((warehouse) => (
              <div
                key={warehouse.id}
                className={`warehouse-item ${selectedWarehouse?.id === warehouse.id ? 'selected' : ''}`}
                onClick={() => handleMarkerClick(warehouse)}
              >
                <h3>{warehouse.name}</h3>
                <p>{warehouse.address}</p>
                <p>Estado: {warehouse.status}</p>
                {warehouse.temperature && (
                  <p>Temperatura: {warehouse.temperature}°C</p>
                )}
                {warehouse.humidity && (
                  <p>Humedad: {warehouse.humidity}%</p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default App; 