import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { db, auth } from '../../config/firebase';
import { doc, setDoc } from 'firebase/firestore';
import * as Location from 'expo-location';

export default function DriverFormScreen() {
  const [name, setName] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [goodsType, setGoodsType] = useState('');
  const [goodsAmount, setGoodsAmount] = useState('');
  const [locationStarted, setLocationStarted] = useState(false);
  const [locationSubscription, setLocationSubscription] = useState(null);

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
        timeInterval: 10000,
        distanceInterval: 20,
      },
      async (loc) => {
        const uid = auth.currentUser.uid;
        const { latitude, longitude } = loc.coords;

        try {
          await setDoc(doc(db, 'vehicles', vehicleNumber), {
            userId: uid,
            name,
            vehicleNumber,
            goodsType,
            goodsAmount,
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
    if (!name || !vehicleNumber || !goodsType || !goodsAmount) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    await startLocationTracking();
    Alert.alert('Started Tracking', 'Your vehicle is now being tracked.');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>🚛 Driver Information</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Driver Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Your Name"
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Vehicle Number</Text>
          <TextInput
            style={styles.input}
            placeholder="Vehicle Number"
            autoCapitalize="characters"
            value={vehicleNumber}
            onChangeText={(text) => setVehicleNumber(text.toUpperCase())}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Type of Goods</Text>
          <TextInput
            style={styles.input}
            placeholder="E.g., Fruits, Electronics"
            value={goodsType}
            onChangeText={setGoodsType}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Amount of Goods</Text>
          <TextInput
            style={styles.input}
            placeholder="E.g., 500 kg, 20 boxes"
            value={goodsAmount}
            onChangeText={setGoodsAmount}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, locationStarted && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={locationStarted}
        >
          <Text style={styles.buttonText}>
            {locationStarted ? 'Tracking Started…' : 'Start Tracking'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#f0f4f8',
    flexGrow: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 24,
    textAlign: 'center',
    color: '#333',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#555',
    marginBottom: 6,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 20,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
