import React from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { MapViewProps } from '../../types/warehouse';

const MapViewComponent: React.FC<MapViewProps> = ({
  userLocation,
  warehouses,
  selectedWarehouse,
}) => {
  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        <Marker
          coordinate={{
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
          }}
          title="Tu ubicación"
          pinColor="blue"
        />
        {warehouses.map((warehouse) => (
          <Marker
            key={warehouse.id}
            coordinate={{
              latitude: warehouse.latitude,
              longitude: warehouse.longitude,
            }}
            title={warehouse.name}
            description={`Espacio disponible: ${warehouse.availableSpace}`}
            pinColor={warehouse.status === 'available' ? 'green' : 'red'}
          />
        ))}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default MapViewComponent; 