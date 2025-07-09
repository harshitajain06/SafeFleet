import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { db, auth } from '../../config/firebase';
import { doc, setDoc } from 'firebase/firestore';
import * as Location from 'expo-location';

export default function DriverFormScreen() {
  const [name, setName] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [locationStarted, setLocationStarted] = useState(false);
  const [locationSubscription, setLocationSubscription] = useState(null);

  // Stop tracking when component unmounts
  useEffect(() => {
    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, [locationSubscription]);

  const startLocationTracking = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'Location permission is required.');
      return;
    }

    setLocationStarted(true);

    const subscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 10000,       // every 10 seconds
        distanceInterval: 20,      // or every 20 meters
      },
      async (loc) => {
        const uid = auth.currentUser.uid;
        const { latitude, longitude } = loc.coords;

        try {
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
        } catch (error) {
          console.error('Error writing to Firestore:', error);
        }
      }
    );

    setLocationSubscription(subscription);
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
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <TextInput
        style={styles.input}
        placeholder="Your Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Vehicle Number"
        autoCapitalize="characters"
        value={vehicleNumber}
        onChangeText={(text) => setVehicleNumber(text.toUpperCase())}
      />
      <Button
        title={locationStarted ? 'Tracking…' : 'Start Tracking'}
        onPress={handleSubmit}
        disabled={locationStarted}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    justifyContent: 'center',
  },
  input: {
    borderBottomWidth: 1,
    marginBottom: 15,
    fontSize: 16,
  },
});
