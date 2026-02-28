import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, SafeAreaView, RefreshControl, Platform } from 'react-native';
import { ChevronLeft, Search, User, ChevronRight, Hash, Database } from 'lucide-react-native';
import COLORS from '../constants/colors';
import API from '../services/api';

const PatientHistoryList = ({ navigation }) => {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPatients = async () => {
    try {
      // Calls the /doctor/patients-list endpoint we added to doctor_routes.py
      const res = await API.get('/doctor/patients-list');
      setPatients(res.data || []);
      setFilteredPatients(res.data || []);
    } catch (err) {
      console.error("Error fetching patients:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleSearch = (text) => {
    setSearchQuery(text);
    if (!text.trim()) {
      setFilteredPatients(patients);
      return;
    }
    const filtered = patients.filter(p => 
      p.name.toLowerCase().includes(text.toLowerCase()) || 
      p.id.toString().includes(text)
    );
    setFilteredPatients(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchPatients();
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
      {/* Header - Adjusted height and padding to move text down */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft color="#1e293b" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Medical Records</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search color={COLORS.gray} size={20} />
          <TextInput
            placeholder="Search by Name or Patient ID..."
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>
      </View>

      {/* Patient List */}
      <ScrollView 
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Text style={styles.sectionLabel}>Unique Patient Records</Text>
        
        {filteredPatients.length > 0 ? (
          filteredPatients.map((patient) => (
            <TouchableOpacity
              key={patient.id}
              style={styles.patientCard}
              onPress={() => navigation.navigate('PatientHistory', { 
                patientId: patient.id, 
                patientName: patient.name 
              })}
            >
              <View style={styles.avatarContainer}>
                <User color={COLORS.primary} size={24} />
              </View>
              
              <View style={styles.patientInfo}>
                <Text style={styles.patientName}>{patient.name}</Text>
                <View style={styles.idRow}>
                  <Hash size={12} color={COLORS.gray} />
                  <Text style={styles.patientIdText}>Patient ID: {patient.id}</Text>
                </View>
                <Text style={styles.locationText}>{patient.place || 'Location N/A'}</Text>
              </View>
              
              <ChevronRight color="#CBD5E1" size={20} />
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Database size={48} color="#E2E8F0" />
            <Text style={styles.emptyText}>No patient records found matching "{searchQuery}"</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { 
    // Increased height and added paddingTop to clear notches and bring title down
    height: Platform.OS === 'ios' ? 100 : 80, 
    paddingTop: Platform.OS === 'ios' ? 40 : 20,
    backgroundColor: 'white', 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9'
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e293b', textAlign: 'center' },
  searchContainer: { padding: 16, backgroundColor: 'white' },
  searchBar: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#F1F5F9', 
    paddingHorizontal: 12, 
    borderRadius: 12, 
    height: 50 
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 14, color: '#1e293b' },
  listContent: { padding: 16 },
  sectionLabel: { fontSize: 12, fontWeight: 'bold', color: COLORS.gray, textTransform: 'uppercase', marginBottom: 12, letterSpacing: 1 },
  patientCard: { 
    backgroundColor: 'white', 
    borderRadius: 16, 
    padding: 16, 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4
  },
  avatarContainer: { 
    width: 50, 
    height: 50, 
    borderRadius: 25, 
    backgroundColor: '#EEF2FF', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  patientInfo: { flex: 1, marginLeft: 16 },
  patientName: { fontSize: 16, fontWeight: 'bold', color: '#1e293b' },
  idRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  patientIdText: { fontSize: 12, color: COLORS.gray, marginLeft: 4 },
  locationText: { fontSize: 12, color: COLORS.gray, marginTop: 2 },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: COLORS.gray, marginTop: 12, fontSize: 14, textAlign: 'center' }
});

export default PatientHistoryList;