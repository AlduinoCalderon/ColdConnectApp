import React from 'react';
import { StyleSheet, FlatList, TouchableOpacity, Text, View } from 'react-native';
import { WarehouseListProps } from '../../types/warehouse';

const WarehouseList: React.FC<WarehouseListProps> = ({
  warehouses,
  onWarehouseSelect,
}) => {
  const renderItem = ({ item }: { item: Warehouse }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => onWarehouseSelect(item)}
    >
      <Text style={styles.title}>{item.name}</Text>
      <Text style={styles.address}>{item.address}</Text>
      <Text style={styles.space}>
        Espacio disponible: {item.availableSpace} / {item.capacity}
      </Text>
      <Text
        style={[
          styles.status,
          { color: item.status === 'available' ? 'green' : 'red' },
        ]}
      >
        {item.status === 'available' ? 'Disponible' : 'No disponible'}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={warehouses}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        style={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  list: {
    flex: 1,
  },
  item: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  address: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  space: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  status: {
    fontSize: 14,
    marginTop: 5,
  },
});

export default WarehouseList; 