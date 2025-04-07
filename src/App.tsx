import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Warehouse } from './types/warehouse';
import { api } from './services/api';
import 'leaflet/dist/leaflet.css';
import './utils/leafletIcons';
import './App.css';

function App(): React.JSX.Element {
  const [userLocation, setUserLocation] = useState({
    latitude: 0,
    longitude: 0,
  });
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse>();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    requestLocationPermission();
    fetchWarehouses();
  }, []);

  const requestLocationPermission = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          setError('Error al obtener la ubicación: ' + error.message);
        }
      );
    } else {
      setError('La geolocalización no está soportada en este navegador');
    }
  };

  const fetchWarehouses = async () => {
    try {
      const data = await api.getWarehouses();
      setWarehouses(data);
    } catch (error) {
      setError('Error al cargar los almacenes');
      console.error('Error fetching warehouses:', error);
    }
  };

  const handleWarehouseSelect = (warehouse: Warehouse) => {
    setSelectedWarehouse(warehouse);
  };

  return (
    <div className="app">
      {error && <div className="error-message">{error}</div>}
      
      <div className="map-container">
        {userLocation.latitude !== 0 && userLocation.longitude !== 0 ? (
          <MapContainer
            center={[userLocation.latitude, userLocation.longitude]}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <Marker position={[userLocation.latitude, userLocation.longitude]}>
              <Popup>Tu ubicación actual</Popup>
            </Marker>
            {warehouses.map((warehouse) => (
              <Marker
                key={warehouse.id}
                position={[warehouse.latitude, warehouse.longitude]}
                eventHandlers={{
                  click: () => handleWarehouseSelect(warehouse),
                }}
              >
                <Popup>
                  <div>
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
                </Popup>
              </Marker>
            ))}
          </MapContainer>
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
                onClick={() => handleWarehouseSelect(warehouse)}
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