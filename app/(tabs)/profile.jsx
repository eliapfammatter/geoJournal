import { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import { useAuth } from '../../context/AuthContext';
import { getStats } from '../../utils/stats';

const STAT_META = [
  { key: 'placesVisited', label: 'Places Visited', icon: 'location' },
  { key: 'photosTaken',   label: 'Photos Taken',   icon: 'camera'   },
  { key: 'kmWalked',      label: 'Km Walked',       icon: 'walk'     },
];

export default function ProfileScreen() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);

  const loadStats = useCallback(async () => {
    const s = await getStats();
    setStats(s);
  }, []);

  // Reload stats every time the tab is focused
  useFocusEffect(useCallback(() => { loadStats(); }, [loadStats]));

  const handleSignOut = async () => {
    await signOut(auth);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* Avatar */}
      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={48} color="#4ECDC4" />
        </View>
        <Text style={styles.name}>{user?.email ?? ''}</Text>
        <Text style={styles.sub}>Travel Explorer</Text>
      </View>

      {/* Stats */}
      {stats === null ? (
        <ActivityIndicator color="#4ECDC4" style={{ marginTop: 24 }} />
      ) : (
        <View style={styles.statsGrid}>
          {STAT_META.map((meta) => (
            <View key={meta.key} style={styles.statCard}>
              <Ionicons name={meta.icon} size={24} color="#4ECDC4" />
              <Text style={styles.statValue}>{stats[meta.key]}</Text>
              <Text style={styles.statLabel}>{meta.label}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Sign out */}
      <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
        <Ionicons name="log-out-outline" size={18} color="#FF6B6B" />
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  content: { paddingBottom: 40 },

  avatarSection: { alignItems: 'center', paddingTop: 60, paddingBottom: 24 },
  avatar: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: '#16213e', justifyContent: 'center', alignItems: 'center',
    borderWidth: 3, borderColor: '#4ECDC4',
  },
  name: { color: '#fff', fontSize: 16, fontWeight: '700', marginTop: 12 },
  sub: { color: '#888', marginTop: 4 },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 12 },
  statCard: {
    width: '47%', backgroundColor: '#16213e',
    borderRadius: 16, padding: 20, alignItems: 'center', gap: 6,
  },
  statValue: { color: '#fff', fontSize: 32, fontWeight: '800' },
  statLabel: { color: '#888', fontSize: 12, textAlign: 'center' },

  signOutBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginTop: 24, marginHorizontal: 16, padding: 14,
    backgroundColor: '#16213e', borderRadius: 12,
  },
  signOutText: { color: '#FF6B6B', fontWeight: '600' },
});
