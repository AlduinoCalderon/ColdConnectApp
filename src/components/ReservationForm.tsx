import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Picker,
} from 'react-native';
import { ReservationFormProps, TemperatureZone } from '../../types/warehouse';

const ReservationForm: React.FC<ReservationFormProps> = ({
  warehouse,
  onReservationSubmit,
}) => {
  const [selectedZone, setSelectedZone] = useState<TemperatureZone | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [spaceNeeded, setSpaceNeeded] = useState('');

  const handleSubmit = () => {
    if (!selectedZone || !startDate || !endDate || !spaceNeeded) {
      alert('Por favor complete todos los campos');
      return;
    }

    const space = parseFloat(spaceNeeded);
    if (space > selectedZone.availableSpace) {
      alert('No hay suficiente espacio disponible');
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const totalPrice = days * selectedZone.pricePerDay * space;

    onReservationSubmit({
      warehouseId: warehouse.id,
      temperatureZoneId: selectedZone.id,
      startDate,
      endDate,
      totalPrice,
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nueva Reserva</Text>
      
      <Text style={styles.label}>Zona de Temperatura</Text>
      <Picker
        selectedValue={selectedZone?.id}
        onValueChange={(value) => {
          const zone = warehouse.temperatureZones.find(z => z.id === value);
          setSelectedZone(zone || null);
        }}
        style={styles.picker}
      >
        <Picker.Item label="Seleccione una zona" value="" />
        {warehouse.temperatureZones.map((zone) => (
          <Picker.Item
            key={zone.id}
            label={`${zone.name} (${zone.temperature}°C) - $${zone.pricePerDay}/día`}
            value={zone.id}
          />
        ))}
      </Picker>

      <Text style={styles.label}>Espacio Necesario (m³)</Text>
      <TextInput
        style={styles.input}
        value={spaceNeeded}
        onChangeText={setSpaceNeeded}
        keyboardType="numeric"
        placeholder="Ingrese el espacio necesario"
      />

      <Text style={styles.label}>Fecha de Inicio</Text>
      <TextInput
        style={styles.input}
        value={startDate}
        onChangeText={setStartDate}
        placeholder="YYYY-MM-DD"
      />

      <Text style={styles.label}>Fecha de Fin</Text>
      <TextInput
        style={styles.input}
        value={endDate}
        onChangeText={setEndDate}
        placeholder="YYYY-MM-DD"
      />

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Crear Reserva</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
  },
  picker: {
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ReservationForm; 