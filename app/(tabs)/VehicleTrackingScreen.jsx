import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
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
  `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${data.currentLocation.lat}&lon=${data.currentLocation.lng}`,
  {
    headers: {
      'User-Agent': 'SafeFleet/1.0 (jainharshita0604@gmail.com)', // <- REQUIRED
      'Accept-Language': 'en',
    },
  }
);


            const geoData = await response.json();

            if (geoData && geoData.display_name) {
              setAddress(geoData.display_name);
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
        <ActivityIndicator size="large" color="#4a90e2" />
        <Text style={{ marginTop: 10 }}>Loading vehicle details...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.header}>🚛 Vehicle Tracking Details</Text>

        <View style={styles.infoBlock}>
          <Text style={styles.label}>Driver Name:</Text>
          <Text style={styles.value}>{liveVehicle.name}</Text>
        </View>

        <View style={styles.infoBlock}>
          <Text style={styles.label}>Vehicle Number:</Text>
          <Text style={styles.value}>{liveVehicle.vehicleNumber}</Text>
        </View>

        <View style={styles.infoBlock}>
          <Text style={styles.label}>Type of Goods:</Text>
          <Text style={styles.value}>{liveVehicle.goodsType || 'N/A'}</Text>
        </View>

        <View style={styles.infoBlock}>
          <Text style={styles.label}>Amount of Goods:</Text>
          <Text style={styles.value}>{liveVehicle.goodsAmount || 'N/A'}</Text>
        </View>

        <View style={styles.infoBlock}>
          <Text style={styles.label}>Coordinates:</Text>
          <Text style={styles.value}>
            {liveVehicle.currentLocation
              ? `${liveVehicle.currentLocation.lat.toFixed(5)}, ${liveVehicle.currentLocation.lng.toFixed(5)}`
              : 'Not Available'}
          </Text>
        </View>

        <View style={styles.infoBlock}>
          <Text style={styles.label}>Address:</Text>
          <Text style={styles.addressBox}>{address}</Text>
        </View>

        <View style={styles.infoBlock}>
          <Text style={styles.label}>Last Updated:</Text>
          <Text style={styles.value}>
            {liveVehicle.currentLocation?.timestamp
              ? new Date(liveVehicle.currentLocation.timestamp).toLocaleString()
              : 'N/A'}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 50,
    padding: 20,
    backgroundColor: '#e8f0fe',
    flexGrow: 1,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 6,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  infoBlock: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4a90e2',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: '#333',
  },
  addressBox: {
    backgroundColor: '#f0f6ff',
    padding: 10,
    borderRadius: 8,
    fontSize: 15,
    color: '#333',
    fontStyle: 'italic',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eef5ff',
  },
});
