import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useRoute } from '@react-navigation/native';

export default function VehicleTrackingScreen() {
  const route = useRoute();
  const { vehicle } = route.params;

  const [liveVehicle, setLiveVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [address, setAddress] = useState('Fetching address...');
  const [addressNumber, setAddressNumber] = useState('');

  useEffect(() => {
    const vehicleRef = doc(db, 'vehicles', vehicle.vehicleNumber);

    const unsubscribe = onSnapshot(vehicleRef, async (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setLiveVehicle(data);
        setLoading(false);

        if (data.currentLocation?.lat && data.currentLocation?.lng) {
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${data.currentLocation.lat}&lon=${data.currentLocation.lng}`
            );

            const geoData = await response.json();

            if (geoData?.display_name) {
              setAddress(geoData.display_name);
              const houseNumber =
                geoData.address?.house_number ||
                geoData.address?.building ||
                geoData.address?.road ||
                '';
              setAddressNumber(houseNumber);
            } else {
              setAddress('Address not found');
            }
          } catch (err) {
            console.error(err);
            setAddress('Failed to fetch address');
          }
        } else {
          setAddress('Location not available');
        }
      }
    });

    return () => unsubscribe();
  }, [vehicle.vehicleNumber]);

  if (loading || !liveVehicle) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10 }}>Loading vehicle data...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.header}>🚚 Vehicle Tracking</Text>
        <Text style={styles.label}>Vehicle Number:</Text>
        <Text style={styles.value}>{liveVehicle.vehicleNumber}</Text>

        <Text style={styles.label}>Driver Name:</Text>
        <Text style={styles.value}>{liveVehicle.name}</Text>

        <Text style={styles.label}>Coordinates:</Text>
        <Text style={styles.value}>
          {liveVehicle.currentLocation
            ? `${liveVehicle.currentLocation.lat.toFixed(5)}, ${liveVehicle.currentLocation.lng.toFixed(5)}`
            : 'N/A'}
        </Text>

        {addressNumber ? (
          <>
            <Text style={styles.label}>Address Number:</Text>
            <Text style={styles.value}>{addressNumber}</Text>
          </>
        ) : null}

        <Text style={styles.label}>Full Address:</Text>
        <Text style={styles.value}>{address}</Text>

        <Text style={styles.label}>Last Updated:</Text>
        <Text style={styles.value}>
          {liveVehicle.currentLocation?.timestamp
            ? new Date(liveVehicle.currentLocation.timestamp).toLocaleString()
            : 'N/A'}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: '#f5f5f5',
    flexGrow: 1,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  label: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
  },
  value: {
    fontSize: 16,
    color: '#222',
    marginTop: 4,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
