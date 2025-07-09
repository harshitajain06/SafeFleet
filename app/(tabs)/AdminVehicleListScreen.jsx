import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useNavigation } from '@react-navigation/native';

export default function AdminVehicleListScreen() {
  const [vehicles, setVehicles] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchData = async () => {
      const snapshot = await getDocs(collection(db, 'vehicles'));
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setVehicles(list);
    };
    fetchData();
  }, []);

  return (
    <FlatList
      data={vehicles}
      keyExtractor={item => item.vehicleNumber}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('VehicleTrackingScreen', { vehicle: item })}
        >
          <Text style={styles.name}>{item.name}</Text>
          <Text>{item.vehicleNumber}</Text>
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  card: { padding: 20, borderBottomWidth: 1, backgroundColor: '#f1f1f1' },
  name: { fontSize: 18, fontWeight: 'bold' },
});
