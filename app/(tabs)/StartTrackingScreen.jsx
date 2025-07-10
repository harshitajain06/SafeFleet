import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import * as Location from 'expo-location';
import { doc, setDoc, query, where, collection, getDocs } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';

export default function StartTrackingScreen() {
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [tracking, setTracking] = useState(false);

  useEffect(() => {
    // Fetch vehicle document created by current user
    const fetchVehicle = async () => {
      const uid = auth.currentUser.uid;
      const q = query(collection(db, 'vehicles'), where('userId', '==', uid));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const vehicleData = snapshot.docs[0].data();
        setVehicleNumber(vehicleData.vehicleNumber);
      } else {
        Alert.alert('Error', 'Vehicle not found. Please fill the form first.');
      }
    };

    fetchVehicle();
  }, []);

  const startTracking = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Location access is required.');
      return;
    }

    setTracking(true);

    await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 10000,
        distanceInterval: 20,
      },
      async (location) => {
        const { latitude, longitude } = location.coords;

        try {
          await setDoc(
            doc(db, 'vehicles', vehicleNumber),
            {
              currentLocation: {
                lat: latitude,
                lng: longitude,
                timestamp: new Date().toISOString(),
              },
            },
            { merge: true }
          );
        } catch (err) {
          console.error('Failed to update location:', err);
        }
      }
    );

    Alert.alert('Success', 'Location tracking started');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Start Tracking</Text>
      <Text style={styles.label}>Vehicle: {vehicleNumber || 'Loading...'}</Text>
      <TouchableOpacity style={styles.button} onPress={startTracking} disabled={tracking}>
        <Text style={styles.buttonText}>{tracking ? 'Tracking...' : 'Start Tracking'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  label: { fontSize: 16, marginBottom: 30 },
  button: {
    backgroundColor: '#007bff',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 10,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
