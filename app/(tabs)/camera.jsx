import { useState, useEffect, useRef } from 'react';
import {
  StyleSheet, View, Text, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import * as MediaLibrary from 'expo-media-library';
import { Ionicons } from '@expo/vector-icons';
import { sendPhotoSavedNotification } from '../../utils/notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

async function fetchWeather(lat, lon) {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
    const res = await fetch(url);
    const data = await res.json();
    const code = data.current_weather.weathercode;
    const temp = Math.round(data.current_weather.temperature);
    const emoji = code === 0 ? '☀️' : code <= 3 ? '⛅' : code <= 67 ? '🌧️' : '❄️';
    return `${emoji} ${temp}°C`;
  } catch {
    return '—';
  }
}

export default function CameraScreen() {
  const cameraRef = useRef(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [mediaPermission, requestMediaPermission] = MediaLibrary.usePermissions();
  const [location, setLocation] = useState(null);
  const [weather, setWeather] = useState('…');
  const [facing, setFacing] = useState('back');
  const [capturing, setCapturing] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
      const w = await fetchWeather(loc.coords.latitude, loc.coords.longitude);
      setWeather(w);
    })();
  }, []);

  if (!permission) return <View style={styles.center}><ActivityIndicator color="#4ECDC4" /></View>;
  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.permText}>Camera access is required.</Text>
        <TouchableOpacity style={styles.btn} onPress={requestPermission}>
          <Text style={styles.btnText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePhoto = async () => {
    if (!cameraRef.current || capturing) return;
    setCapturing(true);
    try {
      if (!mediaPermission?.granted) await requestMediaPermission();
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
      const asset = await MediaLibrary.createAssetAsync(photo.uri);

      if (location) {
        const stored = JSON.parse(await AsyncStorage.getItem('photoLocations') || '{}');
        stored[asset.id] = { latitude: location.latitude, longitude: location.longitude };
        await AsyncStorage.setItem('photoLocations', JSON.stringify(stored));
        console.log('Saved location for asset ID:', asset.id, location.latitude, location.longitude);
      } else {
        console.log('No location available when taking photo');
      }

      const locationStr = location
        ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`
        : null;
      await sendPhotoSavedNotification(locationStr);
    } catch (e) {
      console.error('Photo error:', e);
    } finally {
      setCapturing(false);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing={facing}>

        <View style={styles.overlay}>
          <View style={styles.infoRow}>
            <Ionicons name="location" size={14} color="#4ECDC4" />
            <Text style={styles.infoText}>
              {location
                ? `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`
                : 'Locating…'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoText}>{weather}</Text>
          </View>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.flipBtn}
            onPress={() => setFacing(f => f === 'back' ? 'front' : 'back')}
          >
            <Ionicons name="camera-reverse" size={28} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.shutterBtn, capturing && styles.shutterBtnDisabled]}
            onPress={takePhoto}
            disabled={capturing}
          >
            <View style={styles.shutterInner} />
          </TouchableOpacity>

          <View style={{ width: 56 }} />
        </View>

      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1, justifyContent: 'flex-end' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a1a2e' },
  permText: { color: '#ccc', marginBottom: 16 },
  btn: { backgroundColor: '#4ECDC4', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 24 },
  btnText: { color: '#fff', fontWeight: '600' },

  overlay: {
    position: 'absolute', bottom: 120, left: 0, right: 0,
    alignItems: 'center', gap: 4,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  infoText: {
    color: '#fff', fontSize: 12, fontWeight: '500',
    backgroundColor: 'rgba(0,0,0,0.45)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6,
  },

  controls: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 40, paddingBottom: 40,
  },
  flipBtn: { padding: 8 },
  shutterBtn: {
    width: 72, height: 72, borderRadius: 36,
    borderWidth: 4, borderColor: '#fff',
    justifyContent: 'center', alignItems: 'center',
  },
  shutterBtnDisabled: { opacity: 0.5 },
  shutterInner: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#fff' },
});
