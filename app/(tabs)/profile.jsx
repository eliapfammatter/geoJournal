import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import { useAuth } from '../../context/AuthContext';

const STATS = [
  { label: 'Places Visited', value: '24', icon: 'location' },
  { label: 'Photos Taken',   value: '138', icon: 'camera' },
  { label: 'Km Walked',      value: '47',  icon: 'walk' },
  { label: 'Countries',      value: '6',   icon: 'earth' },
];

const RECENT = [
  { id: '1', place: 'City Museum',   date: 'Apr 12, 2026', icon: 'business' },
  { id: '2', place: 'Central Park',  date: 'Apr 10, 2026', icon: 'leaf' },
  { id: '3', place: 'Old Cathedral', date: 'Apr 8, 2026',  icon: 'home' },
];

export default function ProfileScreen() {
  const { user } = useAuth();

  const handleSignOut = async () => {
    await signOut(auth);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* Avatar + name */}
      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={48} color="#4ECDC4" />
        </View>
        <Text style={styles.name}>{user?.email ?? ''}</Text>
        <Text style={styles.sub}>Travel Explorer</Text>
      </View>

      {/* Big stat cards */}
      <View style={styles.statsGrid}>
        {STATS.map((stat) => (
          <View key={stat.label} style={styles.statCard}>
            <Ionicons name={stat.icon} size={24} color="#4ECDC4" />
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Recent activity */}
      <Text style={styles.sectionTitle}>Recent Activity</Text>
      {RECENT.map((item) => (
        <View key={item.id} style={styles.activityRow}>
          <View style={styles.activityIcon}>
            <Ionicons name={item.icon} size={20} color="#4ECDC4" />
          </View>
          <View>
            <Text style={styles.activityPlace}>{item.place}</Text>
            <Text style={styles.activityDate}>{item.date}</Text>
          </View>
        </View>
      ))}

      {/* Sign out button */}
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

  statsGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: 16, gap: 12,
  },
  statCard: {
    width: '47%', backgroundColor: '#16213e',
    borderRadius: 16, padding: 20, alignItems: 'center', gap: 6,
  },
  statValue: { color: '#fff', fontSize: 32, fontWeight: '800' },
  statLabel: { color: '#888', fontSize: 12, textAlign: 'center' },

  sectionTitle: {
    color: '#fff', fontWeight: '700', fontSize: 16,
    marginHorizontal: 16, marginTop: 28, marginBottom: 12,
  },
  activityRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingVertical: 10,
  },
  activityIcon: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#16213e', justifyContent: 'center', alignItems: 'center',
  },
  activityPlace: { color: '#fff', fontWeight: '600' },
  activityDate: { color: '#666', fontSize: 12, marginTop: 2 },

  signOutBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginTop: 24, marginHorizontal: 16, padding: 14,
    backgroundColor: '#16213e', borderRadius: 12,
  },
  signOutText: { color: '#FF6B6B', fontWeight: '600' },
});
