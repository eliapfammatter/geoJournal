import { useState, useCallback, useEffect } from 'react';
import { useFocusEffect } from 'expo-router';
import {
  StyleSheet, View, Text, TouchableOpacity,
  FlatList, Dimensions, ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import * as MediaLibrary from 'expo-media-library';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
const THUMB_SIZE = (width - 4) / 3;

export default function JournalScreen() {
  const [view, setView] = useState('grid');
  const [photos, setPhotos] = useState([]);
  const [geoPhotos, setGeoPhotos] = useState([]);
  const [loadingGeo, setLoadingGeo] = useState(false);
  const [permission, requestPermission] = MediaLibrary.usePermissions();

  const loadGeoPhotos = useCallback(async (assets) => {
    setLoadingGeo(true);
    const stored = JSON.parse(await AsyncStorage.getItem('photoLocations') || '{}');
    console.log('AsyncStorage keys:', Object.keys(stored));
    console.log('Asset IDs:', assets.map(a => a.id));
    const withLocation = [];
    for (const photo of assets) {
      if (stored[photo.id]) {
        withLocation.push({ ...photo, location: stored[photo.id] });
      } else {
        try {
          const info = await MediaLibrary.getAssetInfoAsync(photo);
          if (info.location?.latitude && info.location?.longitude) {
            withLocation.push({ ...photo, location: info.location });
          }
        } catch {}
      }
    }
    setGeoPhotos(withLocation);
    setLoadingGeo(false);
  }, []);

  // Reload photos every time the tab is focused
  useFocusEffect(useCallback(() => {
    (async () => {
      if (!permission?.granted) await requestPermission();
      const { assets } = await MediaLibrary.getAssetsAsync({
        mediaType: 'photo',
        first: 50,
        sortBy: 'creationTime',
      });
      setPhotos(assets);
      setGeoPhotos([]);
      if (view === 'map') await loadGeoPhotos(assets);
    })();
  }, [permission, view, loadGeoPhotos]));

  // When switching to map view, load location data if not yet loaded
  useEffect(() => {
    if (view !== 'map' || geoPhotos.length > 0 || photos.length === 0) return;
    loadGeoPhotos(photos);
  }, [view]);

  // Default map region: first geotagged photo, or fallback
  const mapRegion = geoPhotos.length > 0
    ? {
        latitude: geoPhotos[0].location.latitude,
        longitude: geoPhotos[0].location.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }
    : { latitude: 46.8, longitude: 8.2, latitudeDelta: 2, longitudeDelta: 2 };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Journal</Text>
        <View style={styles.toggle}>
          <TouchableOpacity
            style={[styles.toggleBtn, view === 'grid' && styles.toggleActive]}
            onPress={() => setView('grid')}
          >
            <Ionicons name="grid" size={16} color={view === 'grid' ? '#fff' : '#888'} />
            <Text style={[styles.toggleText, view === 'grid' && styles.toggleTextActive]}>Grid</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, view === 'map' && styles.toggleActive]}
            onPress={() => setView('map')}
          >
            <Ionicons name="map" size={16} color={view === 'map' ? '#fff' : '#888'} />
            <Text style={[styles.toggleText, view === 'map' && styles.toggleTextActive]}>Map</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Grid view */}
      {view === 'grid' && (
        photos.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="images-outline" size={64} color="#444" />
            <Text style={styles.emptyText}>No photos yet.</Text>
            <Text style={styles.emptySubText}>Use the Camera tab to capture memories!</Text>
          </View>
        ) : (
          <FlatList
            data={photos}
            keyExtractor={(item) => item.id}
            numColumns={3}
            renderItem={({ item }) => (
              <Image source={{ uri: item.uri }} style={styles.thumb} />
            )}
          />
        )
      )}

      {/* Map view */}
      {view === 'map' && (
        loadingGeo ? (
          <View style={styles.empty}>
            <ActivityIndicator size="large" color="#4ECDC4" />
            <Text style={styles.emptyText}>Loading photo locations…</Text>
          </View>
        ) : (
          <View style={{ flex: 1 }}>
            <MapView
              style={styles.map}
              provider={PROVIDER_DEFAULT}
              initialRegion={mapRegion}
              showsUserLocation
            >
              {geoPhotos.map((photo) => (
                <Marker
                  key={photo.id}
                  coordinate={{
                    latitude: photo.location.latitude,
                    longitude: photo.location.longitude,
                  }}
                >
                  <Image
                    source={{ uri: photo.uri }}
                    style={styles.markerThumb}
                  />
                </Marker>
              ))}
            </MapView>
            {geoPhotos.length === 0 && (
              <View style={styles.mapOverlayMsg}>
                <Text style={styles.mapOverlayText}>
                  No geotagged photos yet. Take photos with GPS enabled.
                </Text>
              </View>
            )}
          </View>
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 16, paddingTop: 54,
  },
  title: { color: '#fff', fontSize: 22, fontWeight: '700' },

  toggle: { flexDirection: 'row', backgroundColor: '#0f3460', borderRadius: 20, overflow: 'hidden' },
  toggleBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 6, paddingHorizontal: 14 },
  toggleActive: { backgroundColor: '#4ECDC4' },
  toggleText: { color: '#888', fontSize: 13 },
  toggleTextActive: { color: '#fff', fontWeight: '600' },

  thumb: { width: THUMB_SIZE, height: THUMB_SIZE, margin: 0.5 },

  markerThumb: {
    width: 48, height: 48, borderRadius: 8,
    borderWidth: 2, borderColor: '#4ECDC4',
  },

  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 8 },
  emptyText: { color: '#ccc', fontSize: 18, fontWeight: '600' },
  emptySubText: { color: '#666', fontSize: 13 },

  map: { flex: 1 },

  mapOverlayMsg: {
    position: 'absolute', bottom: 24, left: 16, right: 16,
    backgroundColor: '#16213e', borderRadius: 12, padding: 14,
  },
  mapOverlayText: { color: '#aaa', textAlign: 'center', fontSize: 13 },
});
