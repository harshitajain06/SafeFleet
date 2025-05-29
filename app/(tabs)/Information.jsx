import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';

const LocationTracker = () => {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [address, setAddress] = useState(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      const locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000, // Update every 5 seconds
          distanceInterval: 10, // Update every 10 meters
        },
        async (newLocation) => {
          setLocation(newLocation.coords);
          try {
            let reverseGeocode = await Location.reverseGeocodeAsync({
              latitude: newLocation.coords.latitude,
              longitude: newLocation.coords.longitude,
            });
            if (reverseGeocode.length > 0) {
              setAddress(
                `${reverseGeocode[0].name}, ${reverseGeocode[0].street}, ${reverseGeocode[0].district}, ${reverseGeocode[0].city}, ${reverseGeocode[0].region}, ${reverseGeocode[0].country}`
              );
            }
          } catch (error) {
            console.error('Error fetching address:', error);
          }
        }
      );

      return () => locationSubscription.remove();
    })();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>User Location Tracker</Text>
      {errorMsg ? (
        <Text style={styles.errorText}>{errorMsg}</Text>
      ) : location ? (
        <View style={styles.infoContainer}>
          <Text style={styles.label}>Latitude:</Text>
          <Text style={styles.value}>{location.latitude}</Text>
          <Text style={styles.label}>Longitude:</Text>
          <Text style={styles.value}>{location.longitude}</Text>
          <Text style={styles.label}>Altitude:</Text>
          <Text style={styles.value}>{location.altitude || 'N/A'}</Text>
          <Text style={styles.label}>Address:</Text>
          <Text style={styles.value}>{address ? address : 'Fetching address...'}</Text>
        </View>
      ) : (
        <ActivityIndicator size="large" color="#0000ff" />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  infoContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    width: '90%',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
  },
  value: {
    fontSize: 16,
    marginBottom: 10,
    color: '#333',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default LocationTracker;
