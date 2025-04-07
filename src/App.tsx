import { useEffect, useState, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, DirectionsRenderer, Libraries } from '@react-google-maps/api';
import { getWarehouses } from './services/api';
import { Warehouse } from './types/warehouse';
import './App.css';

const containerStyle = {
  width: '100%',
  height: '100vh'
};

const libraries: Libraries = ['places'];

function App() {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries
  });

  const onMapLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onMapUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const calculateRoute = useCallback((destination: { lat: number; lng: number }) => {
    if (!userLocation || !map) return;

    const directionsService = new google.maps.DirectionsService();
    directionsService.route(
      {
        origin: userLocation,
        destination: destination,
        travelMode: google.maps.TravelMode.DRIVING
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
          setDirections(result);
        } else {
          console.error('Error al calcular la ruta:', status);
        }
      }
    );
  }, [userLocation, map]);

  useEffect(() => {
    // Obtener ubicación del usuario
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
          // Centrar el mapa en la ubicación del usuario
          if (map) {
            map.panTo(location);
          }
        },
        (error) => {
          console.error('Error al obtener la ubicación:', error);
          setError('No se pudo obtener tu ubicación. Por favor, asegúrate de que la geolocalización esté activada.');
        }
      );
    } else {
      setError('Tu navegador no soporta geolocalización.');
    }

    // Obtener almacenes
    const fetchWarehouses = async () => {
      try {
        setLoading(true);
        const data = await getWarehouses();
        console.log('Datos de almacenes recibidos:', data);
        setWarehouses(data);
      } catch (err) {
        console.error('Error al obtener almacenes:', err);
        setError('Error al cargar los almacenes. Por favor, intenta de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchWarehouses();
  }, [map]);

  if (loadError) {
    return <div>Error al cargar Google Maps</div>;
  }

  if (!isLoaded) {
    return <div>Cargando...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="App">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={userLocation || { lat: 0, lng: 0 }}
        zoom={12}
        onLoad={onMapLoad}
        onUnmount={onMapUnmount}
      >
        {userLocation && (
          <Marker
            position={userLocation}
            icon={{
              url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
            }}
          />
        )}

        {warehouses.map((warehouse) => (
          <Marker
            key={warehouse.warehouseId}
            position={{
              lat: warehouse.location.y,
              lng: warehouse.location.x
            }}
            onClick={() => {
              setSelectedWarehouse(warehouse);
              calculateRoute({
                lat: warehouse.location.y,
                lng: warehouse.location.x
              });
            }}
          />
        ))}

        {selectedWarehouse && (
          <InfoWindow
            position={{
              lat: selectedWarehouse.location.y,
              lng: selectedWarehouse.location.x
            }}
            onCloseClick={() => {
              setSelectedWarehouse(null);
              setDirections(null);
            }}
          >
            <div>
              <h2>{selectedWarehouse.name}</h2>
              <p>{selectedWarehouse.address}</p>
              <p>Estado: {selectedWarehouse.status}</p>
              <p>Unidades disponibles: {
                selectedWarehouse.storageUnits.filter(unit => unit.status === 'available').length
              }</p>
            </div>
          </InfoWindow>
        )}

        {directions && <DirectionsRenderer directions={directions} />}
      </GoogleMap>
    </div>
  );
}

export default App; 