import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, SafeAreaView, Platform } from 'react-native';
import { ChevronLeft, CheckCircle, XCircle, ChevronRight, Calendar, Clock, AlertCircle } from 'lucide-react-native';
import API from '../services/api';
import COLORS from '../constants/colors';

const PatientHistoryScreen = ({ route, navigation }) => {
  const { patientId, patientName } = route.params;
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await API.get(`/doctor/patient-history/${patientId}`);
        setHistory(res.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchHistory();
  }, [patientId]);

  // --- Chronological Sorting & Filtering ---
  const sortedHistory = [...history].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  
  const pendingReports = sortedHistory.filter(r => r.status?.toLowerCase() === 'pending');
  const approvedReports = sortedHistory.filter(r => r.status?.toUpperCase() === 'APPROVED');
  const rejectedReports = sortedHistory.filter(r => r.status?.toUpperCase() === 'REJECTED');

  const ReportCard = ({ report }) => {
    const isApproved = report.status?.toUpperCase() === 'APPROVED';
    const isRejected = report.status?.toUpperCase() === 'REJECTED';
    
    let iconColor = '#F1F5F9';
    let icon = <Clock size={20} color="#64748b" />;

    if (isApproved) {
      iconColor = '#DCFCE7';
      icon = <CheckCircle size={20} color="#166534" />;
    } else if (isRejected) {
      iconColor = '#FEE2E2';
      icon = <XCircle size={20} color="#991B1B" />;
    }

    return (
      <TouchableOpacity 
        key={report.id}
        onPress={() => navigation.navigate('ReportReview', { reportId: report.id })}
        style={styles.card}
      >
        <View style={[styles.icon, { backgroundColor: iconColor }]}>
          {icon}
        </View>
        
        <View style={styles.info}>
          <Text style={styles.caseId}>Case ID: #{report.id}</Text>
          <View style={styles.dateRow}>
            <Calendar size={12} color={COLORS.gray} />
            <Text style={styles.date}>{new Date(report.created_at).toLocaleDateString()}</Text>
          </View>
        </View>
        <ChevronRight color="#CBD5E1" size={20} />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft color="#1e293b" size={24} />
        </TouchableOpacity>
        <View style={styles.titleGroup}>
          <Text style={styles.title}>{patientName}</Text>
          <Text style={styles.subtitle}>Medical Archive: #{patientId}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>
      
      <ScrollView contentContainerStyle={styles.list}>
        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{marginTop: 50}} />
        ) : (
          <>
            {/* --- PENDING SECTION --- */}
            <View style={styles.sectionHeader}>
              <Clock size={14} color="#64748b" />
              <Text style={[styles.sectionTitle, { color: '#475569' }]}>In Queue / Pending ({pendingReports.length})</Text>
            </View>
            {pendingReports.length > 0 ? (
              pendingReports.map(report => <ReportCard key={report.id} report={report} />)
            ) : (
              <Text style={styles.emptyText}>No pending reports.</Text>
            )}

            {/* --- APPROVED SECTION --- */}
            <View style={[styles.sectionHeader, { marginTop: 24 }]}>
              <CheckCircle size={14} color="#059669" />
              <Text style={styles.sectionTitle}>Approved Records ({approvedReports.length})</Text>
            </View>
            {approvedReports.length > 0 ? (
              approvedReports.map(report => <ReportCard key={report.id} report={report} />)
            ) : (
              <Text style={styles.emptyText}>No approved reports found.</Text>
            )}

            {/* --- REJECTED SECTION --- */}
            <View style={[styles.sectionHeader, { marginTop: 24 }]}>
              <AlertCircle size={14} color="#DC2626" />
              <Text style={[styles.sectionTitle, { color: '#991B1B' }]}>Rejected Cases ({rejectedReports.length})</Text>
            </View>
            {rejectedReports.length > 0 ? (
              rejectedReports.map(report => <ReportCard key={report.id} report={report} />)
            ) : (
              <Text style={styles.emptyText}>No rejected records found.</Text>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { 
    height: Platform.OS === 'ios' ? 110 : 90, 
    paddingTop: Platform.OS === 'ios' ? 45 : 25,
    paddingHorizontal: 16, 
    backgroundColor: 'white', 
    flexDirection: 'row', 
    alignItems: 'center', 
    borderBottomWidth: 1, 
    borderBottomColor: '#E2E8F0' 
  },
  backBtn: { padding: 8, marginLeft: -8 },
  titleGroup: { flex: 1, alignItems: 'center' },
  title: { fontSize: 18, fontWeight: 'bold', color: '#1e293b', textAlign: 'center' },
  subtitle: { fontSize: 12, color: COLORS.gray, textAlign: 'center' },
  list: { padding: 16 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 6 },
  sectionTitle: { fontSize: 13, fontWeight: 'bold', color: '#065F46', letterSpacing: 0.5 },
  card: { 
    backgroundColor: 'white', 
    padding: 16, 
    borderRadius: 16, 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4
  },
  icon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  info: { flex: 1, marginLeft: 12 },
  caseId: { fontSize: 15, fontWeight: 'bold', color: '#1e293b' },
  dateRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  date: { fontSize: 12, color: COLORS.gray, marginLeft: 4 },
  emptyText: { color: '#94a3b8', fontSize: 12, marginLeft: 4, marginBottom: 16, fontStyle: 'italic' }
});

export default PatientHistoryScreen;