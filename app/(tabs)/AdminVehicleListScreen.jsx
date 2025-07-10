import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Platform,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useNavigation } from '@react-navigation/native';

export default function AdminVehicleListScreen() {
  const [vehicles, setVehicles] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  const fetchData = async () => {
    const snapshot = await getDocs(collection(db, 'vehicles'));
    const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setVehicles(list);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, []);

  return (
    <View style={styles.container}>
      {Platform.OS === 'web' && (
        <View style={styles.topBar}>
          <Text style={styles.heading}>Vehicle List</Text>
          <Pressable style={styles.refreshBtn} onPress={onRefresh}>
            <Ionicons name="refresh" size={20} color="#fff" />
            <Text style={styles.refreshText}>Refresh</Text>
          </Pressable>
        </View>
      )}

      <FlatList
        data={vehicles}
        keyExtractor={item => item.vehicleNumber}
        refreshControl={
          Platform.OS !== 'web' ? (
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          ) : null
        }
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.8}
            onPress={() =>
              navigation.navigate('VehicleTrackingScreen', { vehicle: item })
            }
          >
            <Text style={styles.title}>🚚 Driver: {item.name}</Text>
            <Text style={styles.subtitle}>Vehicle Number: {item.vehicleNumber}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f6ff',
    padding: 16,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4a90e2',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.2,
    elevation: 3,
  },
  refreshText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 6,
    fontSize: 14,
  },
  card: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    borderLeftWidth: 5,
    borderLeftColor: '#4a90e2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: '#666666',
  },
});
