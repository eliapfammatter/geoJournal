import { useState, useEffect, useRef } from 'react';
import {
  StyleSheet, View, Text, TouchableOpacity,
  ScrollView, ActivityIndicator, Linking, Platform,
} from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import * as Location from 'expo-location';
import { Magnetometer } from 'expo-sensors';
import { Ionicons } from '@expo/vector-icons';
import { fetchNearbyPlaces } from '../../utils/places';
import { startGeofencing, stopGeofencing } from '../../utils/geofencing';

function magnetometerToDegrees({ x, y }) {
  let angle = Math.atan2(y, x) * (180 / Math.PI);
  if (angle < 0) angle += 360;
  return Math.round(angle);
}

function compassLabel(deg) {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(deg / 45) % 8];
}

function openDirections(latitude, longitude) {
  const url = Platform.OS === 'ios'
    ? `maps://?daddr=${latitude},${longitude}&dirflg=w`
    : `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=walking`;
  Linking.openURL(url);
}

export default function ExploreScreen() {
  const mapRef = useRef(null);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [places, setPlaces] = useState([]);
  const [placesLoading, setPlacesLoading] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [heading, setHeading] = useState(0);

  // Location
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') { setLoading(false); return; }
      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
      setLoading(false);
    })();
  }, []);

  // Fetch real nearby places once we have location
  useEffect(() => {
    if (!location) return;
    setPlacesLoading(true);
    fetchNearbyPlaces(location.latitude, location.longitude)
      .then((results) => {
        setPlaces(results);
        if (results.length > 0) {
          startGeofencing(results).catch(() => {});
        }
      })
      .catch(() => {})
      .finally(() => setPlacesLoading(false));
    return () => { stopGeofencing().catch(() => {}); };
  }, [location]);

  // Compass
  useEffect(() => {
    Magnetometer.setUpdateInterval(300);
    const sub = Magnetometer.addListener((data) => setHeading(magnetometerToDegrees(data)));
    return () => sub.remove();
  }, []);

  const centerMap = () => {
    if (!location || !mapRef.current) return;
    mapRef.current.animateToRegion({
      latitude: location.latitude,
      longitude: location.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4ECDC4" />
        <Text style={styles.loadingText}>Getting your location…</Text>
      </View>
    );
  }

  const region = location
    ? { latitude: location.latitude, longitude: location.longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 }
    : { latitude: 46.8, longitude: 8.2, latitudeDelta: 0.1, longitudeDelta: 0.1 };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={region}
        showsUserLocation
        showsCompass
      >
        {places.map((place) => (
          <Marker
            key={place.id}
            coordinate={{ latitude: place.latitude, longitude: place.longitude }}
            pinColor="#4ECDC4"
            title={place.name}
            onPress={() => { setSelectedPlace(place); setPanelOpen(true); }}
          />
        ))}
      </MapView>

      {/* Compass */}
      <View style={styles.compass}>
        <View style={[styles.compassNeedle, { transform: [{ rotate: `${heading}deg` }] }]}>
          <View style={styles.needleNorth} />
          <View style={styles.needleSouth} />
        </View>
        <Text style={styles.compassLabel}>{compassLabel(heading)}</Text>
      </View>

      {/* Re-center */}
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
          <TouchableOpacity
            style={styles.directionsBtn}
            onPress={() => openDirections(selectedPlace.latitude, selectedPlace.longitude)}
          >
            <Ionicons name="navigate" size={16} color="#fff" />
            <Text style={styles.directionsBtnText}>Get Walking Directions</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Nearby list */}
      {!panelOpen && (
        <View style={styles.listContainer}>
          <Text style={styles.listTitle}>
            Nearby Places {placesLoading ? '…' : `(${places.length})`}
          </Text>
          {placesLoading ? (
            <ActivityIndicator color="#4ECDC4" style={{ marginVertical: 8 }} />
          ) : places.length === 0 ? (
            <Text style={styles.emptyText}>No places found nearby.</Text>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {places.map((place) => (
                <TouchableOpacity
                  key={place.id}
                  style={styles.placeCard}
                  onPress={() => { setSelectedPlace(place); setPanelOpen(true); }}
                >
                  <Text style={styles.placeName} numberOfLines={2}>{place.name}</Text>
                  <Text style={styles.placeMeta}>{place.category} · {place.distance}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
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
  emptyText: { color: '#666', fontSize: 13, paddingVertical: 8 },

  compass: {
    position: 'absolute', top: 50, left: 16,
    backgroundColor: '#16213e', borderRadius: 36,
    width: 56, height: 56,
    justifyContent: 'center', alignItems: 'center',
    elevation: 4, borderWidth: 1, borderColor: '#0f3460',
  },
  compassNeedle: { width: 4, height: 28, alignItems: 'center', justifyContent: 'center' },
  needleNorth: { width: 4, height: 14, backgroundColor: '#FF6B6B', borderRadius: 2 },
  needleSouth: { width: 4, height: 14, backgroundColor: '#888', borderRadius: 2 },
  compassLabel: { color: '#fff', fontSize: 10, fontWeight: '700', marginTop: 2 },

  centerBtn: {
    position: 'absolute', top: 50, right: 16,
    backgroundColor: '#4ECDC4', borderRadius: 24,
    padding: 10, elevation: 4,
  },

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
