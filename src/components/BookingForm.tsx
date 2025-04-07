import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { BookingFormProps, StorageUnit } from '../../types/warehouse';
import { api } from '../services/api';

const BookingForm: React.FC<BookingFormProps> = ({
  warehouse,
  onBookingSubmit,
}) => {
  const [selectedUnits, setSelectedUnits] = useState<StorageUnit[]>([]);
  const [availableUnits, setAvailableUnits] = useState<StorageUnit[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadAvailableUnits();
  }, []);

  const loadAvailableUnits = async () => {
    try {
      const units = await api.getAvailableUnits(warehouse.warehouseId);
      setAvailableUnits(units);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar las unidades disponibles');
    }
  };

  const handleSubmit = () => {
    if (selectedUnits.length === 0 || !startDate || !endDate) {
      Alert.alert('Error', 'Por favor complete todos los campos');
      return;
    }

    const bookingUnits = selectedUnits.map(unit => ({
      unitId: unit.unitId,
      pricePerHour: unit.costPerHour,
    }));

    onBookingSubmit({
      warehouseId: warehouse.warehouseId,
      startDate,
      endDate,
      notes,
      units: bookingUnits,
    });
  };

  const toggleUnitSelection = (unit: StorageUnit) => {
    setSelectedUnits(prev => {
      const isSelected = prev.some(u => u.unitId === unit.unitId);
      if (isSelected) {
        return prev.filter(u => u.unitId !== unit.unitId);
      } else {
        return [...prev, unit];
      }
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nueva Reserva</Text>
      
      <Text style={styles.label}>Unidades Disponibles</Text>
      <View style={styles.unitsContainer}>
        {availableUnits.map((unit) => (
          <TouchableOpacity
            key={unit.unitId}
            style={[
              styles.unitButton,
              selectedUnits.some(u => u.unitId === unit.unitId) && styles.selectedUnit,
            ]}
            onPress={() => toggleUnitSelection(unit)}
          >
            <Text style={styles.unitName}>{unit.name}</Text>
            <Text style={styles.unitDetails}>
              {unit.width}m x {unit.height}m x {unit.depth}m
            </Text>
            <Text style={styles.unitDetails}>
              Temperatura: {unit.minTemp}°C - {unit.maxTemp}°C
            </Text>
            <Text style={styles.unitPrice}>
              ${unit.costPerHour}/hora
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Fecha de Inicio</Text>
      <TextInput
        style={styles.input}
        value={startDate}
        onChangeText={setStartDate}
        placeholder="YYYY-MM-DD HH:mm"
      />

      <Text style={styles.label}>Fecha de Fin</Text>
      <TextInput
        style={styles.input}
        value={endDate}
        onChangeText={setEndDate}
        placeholder="YYYY-MM-DD HH:mm"
      />

      <Text style={styles.label}>Notas</Text>
      <TextInput
        style={[styles.input, styles.notesInput]}
        value={notes}
        onChangeText={setNotes}
        placeholder="Notas adicionales"
        multiline
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
  notesInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  unitsContainer: {
    marginBottom: 15,
  },
  unitButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  selectedUnit: {
    borderColor: '#007AFF',
    backgroundColor: '#E6F2FF',
  },
  unitName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  unitDetails: {
    fontSize: 14,
    color: '#666',
  },
  unitPrice: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: 'bold',
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

export default BookingForm; 