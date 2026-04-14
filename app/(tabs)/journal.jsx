import { useState, useEffect } from 'react';
import {
  StyleSheet, View, Text, TouchableOpacity,
  FlatList, Dimensions, ScrollView,
} from 'react-native';
import { Image } from 'expo-image';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import * as MediaLibrary from 'expo-media-library';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const THUMB_SIZE = (width - 4) / 3; // 3-column grid

export default function JournalScreen() {
  const [view, setView] = useState('grid'); // 'grid' | 'map'
  const [photos, setPhotos] = useState([]);
  const [permission, requestPermission] = MediaLibrary.usePermissions();

  // Load photos from the media library
  useEffect(() => {
    (async () => {
      if (!permission?.granted) await requestPermission();
      const { assets } = await MediaLibrary.getAssetsAsync({
        mediaType: 'photo',
        first: 50,
        sortBy: 'creationTime',
      });
      setPhotos(assets);
    })();
  }, []);

  return (
    <View style={styles.container}>
      {/* Header with toggle */}
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
        <MapView
          style={styles.map}
          provider={PROVIDER_DEFAULT}
          initialRegion={{ latitude: 46.8, longitude: 8.2, latitudeDelta: 2, longitudeDelta: 2 }}
          showsUserLocation
        >
          {/* Photos with location data would show as markers here */}
          {/* TODO: filter photos that have GPS coords and place markers */}
        </MapView>
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

  // Grid / Map toggle
  toggle: {
    flexDirection: 'row', backgroundColor: '#0f3460',
    borderRadius: 20, overflow: 'hidden',
  },
  toggleBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingVertical: 6, paddingHorizontal: 14,
  },
  toggleActive: { backgroundColor: '#4ECDC4' },
  toggleText: { color: '#888', fontSize: 13 },
  toggleTextActive: { color: '#fff', fontWeight: '600' },

  // Photo grid
  thumb: { width: THUMB_SIZE, height: THUMB_SIZE, margin: 0.5 },

  // Empty state
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 8 },
  emptyText: { color: '#ccc', fontSize: 18, fontWeight: '600' },
  emptySubText: { color: '#666', fontSize: 13 },

  map: { flex: 1 },
});
