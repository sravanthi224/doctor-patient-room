import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  SafeAreaView,
  ActivityIndicator
} from 'react-native';

import {
  User,
  MapPin,
  Hash,
  ChevronLeft,
  Save,
  Clock,
  CheckCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import API from '../services/api';
import COLORS from '../constants/colors';

export default function PatientProfileScreen({ navigation }) {

  const [profile, setProfile] = useState({
    id: '',
    patient_uid: '',
    name: '',
    age: '',
    place: ''
  });

  const [history, setHistory] = useState([]);
  const [showFullHistory, setShowFullHistory] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const storedUser = await AsyncStorage.getItem("user");

      if (!storedUser) {
        console.log("No user found in storage");
        return;
      }

      const parsed = JSON.parse(storedUser);
      console.log("Loaded User Identity:", parsed);

      setProfile({
        id: parsed?.id ?? "",
        patient_uid: parsed?.patient_uid ?? "",
        name: parsed?.name ?? "",
        age: parsed?.age ? String(parsed.age) : "",
        place: parsed?.place ?? ""
      });

      // After loading identity, fetch clinical history
      fetchHistory();

    } catch (err) {
      console.log("Profile Load Error:", err);
      Alert.alert("Error", "Unable to load identity profile.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * RESOLVES 404 ERROR: 
   * Ensure this URL matches your FastAPI 'prefix' in main.py
   */
  const fetchHistory = async () => {
    try {
      // Logic: Changed from /my-reports to /my-history to match backend routes
      const res = await API.get("/report/my-history");

      if (res?.data) {
        // Sort history: Most recent clinical cases at the top
        const sortedData = res.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setHistory(sortedData);
      }

    } catch (err) {
      // Enhanced logging to debug the 404 error
      console.log("--- HISTORY FETCH ERROR ---");
      console.log("Requested URL:", err.config?.url);
      console.log("Status Code:", err.response?.status);
      console.log("Error Message:", err.message);
    }
  };

  const handleUpdate = async () => {
    setSaving(true);
    try {
      // Sync clinical profile details to backend
      await API.put("/auth/update-profile", {
        name: profile.name,
        age: parseInt(profile.age),
        place: profile.place
      });

      const storedUser = await AsyncStorage.getItem("user");
      const parsed = JSON.parse(storedUser);

      // Preserve immutable fields (UID/Name) during local storage update
      const updatedUser = {
        ...parsed,
        age: profile.age,
        place: profile.place
      };

      await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
      Alert.alert("Success", "Medical identity updated.");

    } catch (err) {
      console.log("Update Sync Error:", err);
      Alert.alert("Error", "Server sync failed.");
    } finally {
      setSaving(false);
    }
  };

  // --- Clinical Triage Filtering ---
  const pendingReports = history.filter(r => r.status === "pending");
  const finalizedReports = history.filter(r => r.status === "approved" || r.status === "rejected");

  const displayPending = showFullHistory ? pendingReports : pendingReports.slice(0, 2);
  const displayFinalized = showFullHistory ? finalizedReports : finalizedReports.slice(0, 3);

  const ReportItem = ({ item }) => (
    <TouchableOpacity
      style={styles.historyCard}
      onPress={() => {
        if (item.status === "approved") {
          navigation.navigate("ReportReview", { reportId: item.id });
        }
      }}
    >
      <View
        style={[
          styles.statusIndicator,
          {
            backgroundColor:
              item.status === "approved"
                ? "#10b981"
                : item.status === "rejected"
                  ? "#ef4444"
                  : "#f59e0b"
          }
        ]}
      />

      <View style={styles.historyInfo}>
        <Text style={styles.caseId}>Case #{item.id}</Text>
        <Text style={styles.dateText}>
          {new Date(item.created_at).toLocaleDateString()}
        </Text>
      </View>

      <Text
        style={[
          styles.statusLabel,
          {
            color:
              item.status === "approved"
                ? "#10b981"
                : "#f59e0b"
          }
        ]}
      >
        {item.status?.toUpperCase()}
      </Text>
    </TouchableOpacity>
  );

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
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeft color="#1e293b" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Patient Identity</Text>
        <TouchableOpacity onPress={handleUpdate} disabled={saving}>
          {saving
            ? <ActivityIndicator size="small" />
            : <Save color={COLORS.primary} size={24} />
          }
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Identity Card */}
        <View style={styles.profileCard}>
          <View style={styles.cardHeader}>
            <View style={styles.avatarLarge}>
              <User color="white" size={30} />
            </View>
            <View style={styles.uidBadge}>
              <Hash size={12} color="#4f46e5" />
              <Text style={styles.uidText}>
                UID: {profile.patient_uid || `PAT-${profile.id}`}
              </Text>
            </View>
          </View>

          <Text style={styles.label}>FULL NAME</Text>
          <TextInput
            style={[styles.input, { backgroundColor: '#f1f5f9' }]}
            value={profile.name}
            editable={false}
          />

          <View style={styles.row}>
            <View style={{ flex: 0.3 }}>
              <Text style={styles.label}>AGE</Text>
              <TextInput
                style={styles.input}
                value={profile.age}
                keyboardType="numeric"
                onChangeText={(t) => setProfile({ ...profile, age: t })}
              />
            </View>
            <View style={{ flex: 0.65 }}>
              <Text style={styles.label}>LOCATION</Text>
              <View style={styles.locRow}>
                <MapPin size={14} color="#64748b" />
                <TextInput
                  style={styles.locInput}
                  value={profile.place}
                  onChangeText={(t) => setProfile({ ...profile, place: t })}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Clinical History Sections */}
        <View style={styles.historySection}>
          {pendingReports.length > 0 && (
            <View style={{ marginBottom: 24 }}>
              <View style={styles.sectionHeaderRow}>
                <Clock size={16} color="#d97706" />
                <Text style={styles.sectionTitlePending}>
                  Pending Doctor Review
                </Text>
              </View>
              {displayPending.map(item => (
                <ReportItem key={item.id} item={item} />
              ))}
            </View>
          )}

          <View style={{ marginBottom: 16 }}>
            <View style={styles.sectionHeaderRow}>
              <CheckCircle size={16} color="#10b981" />
              <Text style={styles.sectionTitleApproved}>
                Finalized Reports
              </Text>
            </View>
            {finalizedReports.length > 0
              ? displayFinalized.map(item => (
                <ReportItem key={item.id} item={item} />
              ))
              : <Text style={styles.emptyText}>No clinical records found</Text>
            }
          </View>

          {history.length > 3 && (
            <TouchableOpacity
              style={styles.toggleBtn}
              onPress={() => setShowFullHistory(!showFullHistory)}
            >
              <Text style={styles.toggleText}>
                {showFullHistory ? "Show Less" : "View Full History"}
              </Text>
              {showFullHistory
                ? <ChevronUp size={18} color="#4f46e5" />
                : <ChevronDown size={18} color="#4f46e5" />
              }
            </TouchableOpacity>
          )}
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20, backgroundColor: 'white' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1e293b' },
  scrollContent: { padding: 20 },
  profileCard: { backgroundColor: 'white', borderRadius: 24, padding: 20, elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, marginBottom: 25 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  avatarLarge: { width: 56, height: 56, borderRadius: 28, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  uidBadge: { backgroundColor: '#eef2ff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, flexDirection: 'row', alignItems: 'center', gap: 5 },
  uidText: { color: '#4f46e5', fontWeight: 'bold', fontSize: 12 },
  label: { fontSize: 10, fontWeight: 'bold', color: '#94a3b8', marginBottom: 8, letterSpacing: 1 },
  input: { backgroundColor: '#f8fafc', padding: 12, borderRadius: 12, color: '#1e293b', fontSize: 14, fontWeight: '500', borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 15 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  locRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', paddingHorizontal: 12, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', height: 48 },
  locInput: { flex: 1, marginLeft: 5, fontSize: 14, color: '#1e293b' },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 15, marginLeft: 5 },
  sectionTitlePending: { fontSize: 14, fontWeight: 'bold', color: '#b45309' },
  sectionTitleApproved: { fontSize: 14, fontWeight: 'bold', color: '#047857' },
  historyCard: { backgroundColor: 'white', padding: 16, borderRadius: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: '#f1f5f9' },
  statusIndicator: { width: 4, height: 32, borderRadius: 2 },
  historyInfo: { flex: 1, marginLeft: 15 },
  caseId: { fontWeight: 'bold', color: '#1e293b', fontSize: 14 },
  dateText: { color: '#94a3b8', fontSize: 12, marginTop: 2 },
  statusLabel: { fontSize: 9, fontWeight: 'bold' },
  toggleBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 20, gap: 8 },
  toggleText: { color: '#4f46e5', fontWeight: 'bold', fontSize: 14 },
  emptyText: { color: '#94a3b8', fontSize: 12, textAlign: 'center', padding: 20 }
});