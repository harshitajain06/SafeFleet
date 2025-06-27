import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../config/firebase';

const GOOGLE_API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY'; // 🔐 Replace this

export default function VehicleTrackingScreen({ route }) {
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
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${data.currentLocation.lat},${data.currentLocation.lng}&key=${GOOGLE_API_KEY}`
            );
            const geoData = await response.json();
            if (geoData.status === 'OK' && geoData.results.length > 0) {
              setAddress(geoData.results[0].formatted_address);
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
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Tracking: {liveVehicle.vehicleNumber}</Text>
      <Text>Driver: {liveVehicle.name}</Text>
      <Text>
        Coordinates:{' '}
        {liveVehicle.currentLocation
          ? `${liveVehicle.currentLocation.lat}, ${liveVehicle.currentLocation.lng}`
          : 'N/A'}
      </Text>
      <Text>Address: {address}</Text>
      <Text>
        Last Updated:{' '}
        {liveVehicle.currentLocation?.timestamp
          ? new Date(liveVehicle.currentLocation.timestamp).toLocaleTimeString()
          : 'N/A'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  header: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
