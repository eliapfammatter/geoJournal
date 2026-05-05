import AsyncStorage from '@react-native-async-storage/async-storage';
import * as MediaLibrary from 'expo-media-library';

const STATS_KEY = 'geojournal_stats';

const DEFAULT = { placesVisited: [], kmWalked: 0 };

export async function getStats() {
  const raw = await AsyncStorage.getItem(STATS_KEY);
  const stored = raw ? JSON.parse(raw) : DEFAULT;

  let photoCount = 0;
  try {
    const { totalCount } = await MediaLibrary.getAssetsAsync({ mediaType: 'photo', first: 1 });
    photoCount = totalCount;
  } catch {}

  return {
    placesVisited: stored.placesVisited?.length ?? 0,
    photosTaken: photoCount,
    kmWalked: Math.round(stored.kmWalked ?? 0),
  };
}

export async function recordPlaceVisited(placeName) {
  const raw = await AsyncStorage.getItem(STATS_KEY);
  const stats = raw ? JSON.parse(raw) : DEFAULT;
  if (!stats.placesVisited.includes(placeName)) {
    stats.placesVisited.push(placeName);
    await AsyncStorage.setItem(STATS_KEY, JSON.stringify(stats));
  }
}

export async function addKmWalked(km) {
  const raw = await AsyncStorage.getItem(STATS_KEY);
  const stats = raw ? JSON.parse(raw) : DEFAULT;
  stats.kmWalked = (stats.kmWalked ?? 0) + km;
  await AsyncStorage.setItem(STATS_KEY, JSON.stringify(stats));
}
