import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Alert,
  Platform
} from 'react-native';
import { ChevronLeft, User, Shield, Briefcase, LogOut, Mail, Award } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API from '../services/api';
import COLORS from '../constants/colors';

export default function DoctorProfileScreen({ navigation }) {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({ total_reviewed: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDoctorData();
  }, []);

  const loadDoctorData = async () => {
    try {
      setLoading(true);
      const storedUser = await AsyncStorage.getItem("user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        console.log("Profile Data Found:", parsedUser); // Debug to see if email exists
        setProfile(parsedUser);
      }
      
      const res = await API.get('/doctor/stats'); 
      setStats(res.data);
    } catch (err) {
      console.error("Profile Load Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert("Sign Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.clear();
          navigation.reset({ index: 0, routes: [{ name: 'Landing' }] });
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft color="#1e293b" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Professional Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarLarge}>
            <User color="white" size={40} />
          </View>
          <Text style={styles.doctorName}>Dr. {profile?.name || 'Practitioner'}</Text>
          <View style={styles.roleBadge}>
            <Shield size={12} color="#4f46e5" />
            <Text style={styles.roleText}>Verified Clinician</Text>
          </View>
        </View>

        {/* Professional Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Award color={COLORS.primary} size={24} />
            <Text style={styles.statNumber}>{stats.total_reviewed}</Text>
            <Text style={styles.statLabel}>Cases Reviewed</Text>
          </View>
          <View style={styles.statBox}>
            <Briefcase color="#10b981" size={24} />
            <Text style={styles.statNumber}>Active</Text>
            <Text style={styles.statLabel}>Duty Status</Text>
          </View>
        </View>

        {/* Credentials Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>ACCOUNT CREDENTIALS</Text>
          
          <View style={styles.infoRow}>
            <Mail size={18} color="#94a3b8" />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Registered Email</Text>
              <Text style={styles.infoValue}>{profile?.email || 'N/A'}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Shield size={18} color="#94a3b8" />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Doctor Secret Code</Text>
              <Text style={styles.infoValue}>MED-2026-####</Text>
            </View>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <LogOut color="#ef4444" size={20} />
          <Text style={styles.logoutText}>Sign Out of Portal</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>Doctor Patient Room v1.4.2</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    height: Platform.OS === 'ios' ? 110 : 80,
    paddingTop: Platform.OS === 'ios' ? 45 : 20,
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9'
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e293b' },
  scrollContent: { padding: 20 },
  profileCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 30,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    marginBottom: 20
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15
  },
  doctorName: { fontSize: 22, fontWeight: 'bold', color: '#1e293b' },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eef2ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 10,
    gap: 6
  },
  roleText: { color: '#4f46e5', fontWeight: 'bold', fontSize: 12 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  statBox: {
    backgroundColor: 'white',
    width: '48%',
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9'
  },
  statNumber: { fontSize: 20, fontWeight: 'bold', color: '#1e293b', marginTop: 10 },
  statLabel: { fontSize: 12, color: '#94a3b8', marginTop: 4 },
  section: { backgroundColor: 'white', borderRadius: 20, padding: 20, marginBottom: 25 },
  sectionLabel: { fontSize: 11, fontWeight: 'bold', color: '#94a3b8', marginBottom: 20, letterSpacing: 1 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 15 },
  infoTextContainer: { flex: 1 },
  infoLabel: { fontSize: 12, color: '#94a3b8' },
  infoValue: { fontSize: 15, fontWeight: '500', color: '#1e293b', marginTop: 2 },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff1f2',
    padding: 18,
    borderRadius: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: '#ffe4e6'
  },
  logoutText: { color: '#ef4444', fontWeight: 'bold', fontSize: 16 },
  versionText: { textAlign: 'center', color: '#cbd5e1', fontSize: 12, marginTop: 30, marginBottom: 20 }
});