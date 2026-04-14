import { useState, useEffect, useRef } from 'react';
import {
  StyleSheet, View, Text, TouchableOpacity,
  ScrollView, ActivityIndicator, Dimensions,
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';

const { height } = Dimensions.get('window');

// Sample nearby places (replace with real API later)
const SAMPLE_PLACES = [
  { id: '1', name: 'City Museum', category: 'Museum', distance: '0.3 km', lat: 0.001, lng: 0.001 },
  { id: '2', name: 'Central Park',  category: 'Park',   distance: '0.5 km', lat: -0.002, lng: 0.002 },
  { id: '3', name: 'Old Cathedral', category: 'Church', distance: '0.8 km', lat: 0.003, lng: -0.001 },
];

export default function ExploreScreen() {
  const mapRef = useRef(null);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [panelOpen, setPanelOpen] = useState(false);

  // Ask for location permission and get current position
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') { setLoading(false); return; }
      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
      setLoading(false);
    })();
  }, []);

  // Center map on user location
  const centerMap = () => {
    if (!location || !mapRef.current) return;
    mapRef.current.animateToRegion({
      latitude: location.latitude,
      longitude: location.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
  };

  const openPlace = (place) => {
    setSelectedPlace(place);
    setPanelOpen(true);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4ECDC4" />
        <Text style={styles.loadingText}>Getting your location…</Text>
      </View>
    );
  }

  // Default region (fallback if location denied)
  const region = location
    ? { latitude: location.latitude, longitude: location.longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 }
    : { latitude: 46.8, longitude: 8.2, latitudeDelta: 0.1, longitudeDelta: 0.1 };

  return (
    <View style={styles.container}>
      {/* Full-screen map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={region}
        showsUserLocation
        showsCompass
      >
        {/* Pins for nearby places */}
        {location && SAMPLE_PLACES.map((place) => (
          <Marker
            key={place.id}
            coordinate={{
              latitude: location.latitude + place.lat,
              longitude: location.longitude + place.lng,
            }}
            pinColor="#4ECDC4"
            title={place.name}
            onPress={() => openPlace(place)}
          />
        ))}
      </MapView>

      {/* Re-center button */}
      <TouchableOpacity style={styles.centerBtn} onPress={centerMap}>
        <Ionicons name="locate" size={22} color="#fff" />
      </TouchableOpacity>

      {/* Slide-up panel */}
      {panelOpen && selectedPlace && (
        <View style={styles.panel}>
          <TouchableOpacity style={styles.panelClose} onPress={() => setPanelOpen(false)}>
            <Ionicons name="chevron-down" size={20} color="#888" />
          </TouchableOpacity>
          <Text style={styles.panelTitle}>{selectedPlace.name}</Text>
          <Text style={styles.panelSub}>{selectedPlace.category} · {selectedPlace.distance}</Text>
          <TouchableOpacity style={styles.directionsBtn}>
            <Ionicons name="navigate" size={16} color="#fff" />
            <Text style={styles.directionsBtnText}>Get Walking Directions</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Nearby places horizontal list at bottom */}
      {!panelOpen && (
        <View style={styles.listContainer}>
          <Text style={styles.listTitle}>Nearby Places</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {SAMPLE_PLACES.map((place) => (
              <TouchableOpacity key={place.id} style={styles.placeCard} onPress={() => openPlace(place)}>
                <Text style={styles.placeName}>{place.name}</Text>
                <Text style={styles.placeMeta}>{place.category} · {place.distance}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  map: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a1a2e' },
  loadingText: { color: '#ccc', marginTop: 12 },

  // Re-center button
  centerBtn: {
    position: 'absolute', top: 50, right: 16,
    backgroundColor: '#4ECDC4', borderRadius: 24,
    padding: 10, elevation: 4,
  },

  // Slide-up panel
  panel: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#16213e', borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 20, paddingBottom: 36,
  },
  panelClose: { alignSelf: 'center', marginBottom: 8 },
  panelTitle: { color: '#fff', fontSize: 20, fontWeight: '700' },
  panelSub: { color: '#aaa', marginTop: 4, marginBottom: 16 },
  directionsBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#4ECDC4', borderRadius: 12,
    paddingVertical: 12, paddingHorizontal: 20, alignSelf: 'flex-start',
  },
  directionsBtnText: { color: '#fff', fontWeight: '600' },

  // Nearby places list
  listContainer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#16213e', borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 16, paddingBottom: 24,
  },
  listTitle: { color: '#fff', fontWeight: '700', fontSize: 16, marginBottom: 10 },
  placeCard: {
    backgroundColor: '#0f3460', borderRadius: 12,
    padding: 12, marginRight: 10, width: 140,
  },
  placeName: { color: '#fff', fontWeight: '600' },
  placeMeta: { color: '#aaa', fontSize: 12, marginTop: 4 },
});
