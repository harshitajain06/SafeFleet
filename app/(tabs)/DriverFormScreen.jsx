import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { db, auth } from '../../config/firebase';
import { doc, setDoc } from 'firebase/firestore';
import * as Location from 'expo-location';

export default function DriverFormScreen() {
  const [name, setName] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [locationStarted, setLocationStarted] = useState(false);

  const startLocationTracking = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'Location permission is required.');
      return;
    }

    setLocationStarted(true);

    await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 10000, // every 10 seconds
        distanceInterval: 20, // or every 20 meters
      },
      async (loc) => {
        const uid = auth.currentUser.uid;
        const { latitude, longitude } = loc.coords;
        await setDoc(doc(db, 'vehicles', vehicleNumber), {
          userId: uid,
          name,
          vehicleNumber,
          currentLocation: {
            lat: latitude,
            lng: longitude,
            timestamp: new Date().toISOString(),
          },
        });
      }
    );
  };

  const handleSubmit = async () => {
    if (!name || !vehicleNumber) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    await startLocationTracking();
    Alert.alert('Started Tracking', 'Your vehicle is now being tracked.');
  };

  return (
    <View style={styles.container}>
      <TextInput style={styles.input} placeholder="Your Name" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Vehicle Number" value={vehicleNumber} onChangeText={setVehicleNumber} />
      <Button title={locationStarted ? "Tracking…" : "Start Tracking"} onPress={handleSubmit} disabled={locationStarted} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1, justifyContent: 'center' },
  input: { borderBottomWidth: 1, marginBottom: 15, fontSize: 16 },
});
