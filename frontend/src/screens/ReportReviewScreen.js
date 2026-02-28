import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, SafeAreaView, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { ShieldCheck, Clock, User, Save, CheckCircle, Edit3, Trash2, Calendar, MapPin, Hash, ChevronLeft, MessageSquare, FileText, ClipboardList, AlertCircle, History, Star, Share2 } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import COLORS from '../constants/colors';
import API from '../services/api';

const ReportReviewScreen = ({ route, navigation }) => {
  const { reportId, initialReportData } = route.params || {};
  const [report, setReport] = useState(initialReportData || null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedDraft, setEditedDraft] = useState(initialReportData?.ai_report || '');
  const [feedback, setFeedback] = useState('');
  const [isApproving, setIsApproving] = useState(false);
  const [loading, setLoading] = useState(!initialReportData);
  const [userRole, setUserRole] = useState(null); 

  useEffect(() => {
    const initializeScreen = async () => {
      const role = await AsyncStorage.getItem('user_role');
      setUserRole(role);
      if (reportId) fetchReportDetails();
    };
    initializeScreen();
  }, []);

  const fetchReportDetails = async () => {
    try {
      const res = await API.get(`/report/details/${reportId}`);
      setReport(res.data);
      setEditedDraft(res.data.ai_report || '');
    } catch (err) {
      Alert.alert("Error", "Could not fetch clinical details.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (feedback.trim().length < 5) {
      Alert.alert("Feedback Required", "Please provide clinical notes before approving.");
      return;
    }

    Alert.alert('Finalize & Sync', 'Approve report and sync to hospital EHR?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Approve & Sync', onPress: async () => {
          setIsApproving(true);
          try {
            // 1. Approve locally
            await API.put(`/report/approve/${report.id}`, { doctor_report: editedDraft, feedback: feedback });
            await API.post(`/report/feedback/${report.id}`, { feedback: feedback });
            
            // 2. Trigger EHR Sync
            try {
              await API.post(`/report/sync-ehr/${report.id}`);
              Alert.alert('✅ Success', 'Report approved and synced to EHR.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
            } catch (syncErr) {
              Alert.alert('Local Success', 'Report approved, but EHR sync is pending.');
              navigation.goBack();
            }
          } catch (err) { 
            Alert.alert("Error", "Failed to finalize report."); 
          } finally { 
            setIsApproving(false); 
          }
      }}
    ]);
  };

  const handleReject = async () => {
    if (feedback.trim().length < 5) {
      Alert.alert("Feedback Required", "Please provide a reason for rejection.");
      return;
    }

    Alert.alert("Reject Report?", "Mark AI draft as invalid.", [
      { text: "Cancel", style: "cancel" },
      { text: "Reject", style: "destructive", onPress: async () => {
          setIsApproving(true);
          try {
            await API.put(`/report/reject/${report.id}`, { feedback: feedback });
            await API.post(`/report/feedback/${report.id}`, { feedback: feedback });
            navigation.goBack();
          } catch (err) { Alert.alert("Error", "Failed to reject."); }
          finally { setIsApproving(false); }
      }}
    ]);
  };

  const submitPatientFeedback = async () => {
    if (feedback.trim().length < 5) {
      Alert.alert("Required", "Please share your thoughts to help the AI learn.");
      return;
    }
    setIsApproving(true);
    try {
      await API.post(`/report/feedback/${report.id}`, { feedback: feedback });
      Alert.alert("Success", "Feedback received by AI engine.");
      setFeedback(''); 
    } catch (err) {
      Alert.alert("Error", "Submission failed.");
    } finally {
      setIsApproving(false);
    }
  };

  const renderFormattedDraft = (text) => {
    if (!text) return null;
    const normalizedText = text.replace(/\\n/g, '\n').replace(/([a-zA-Z\s]+:)/g, '\n$1');
    const lines = normalizedText.split('\n');
    return lines.map((line, index) => {
      if (line.trim() === "") return null;
      const parts = line.split(/(\w+\s?\w+:)/g); 
      return (
        <View key={index} style={styles.lineWrapper}>
          <Text>
            {parts.map((part, i) => {
              const isHeading = part.endsWith(':');
              return (
                <Text key={i} style={isHeading ? styles.boldHeading : styles.normalText}>{part}</Text>
              );
            })}
          </Text>
        </View>
      );
    });
  };

  if (loading || !report) return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        
        <View style={styles.navHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()}><ChevronLeft color="#1e293b" size={24} /></TouchableOpacity>
          <Text style={styles.navTitle}>Clinical Review</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          <View style={styles.profileCard}>
            <View style={styles.profileHeader}>
              <View style={styles.avatarCircle}><User color="white" size={24} /></View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.profileName}>{report.patient_name || "Unknown Patient"}</Text>
                <View style={styles.uidRow}>
                   <Hash size={10} color={COLORS.gray} />
                   <Text style={styles.profileCaseId}>UID: #{report.display_uid || "N/A"}</Text>
                </View>
                <Text style={styles.profileCaseId}>Case ID: #{report.id}</Text>
              </View>
              <View style={[styles.urgencyBadge, { backgroundColor: report.severity === 'HIGH' ? COLORS.danger : COLORS.primary }]}>
                <Text style={styles.urgencyText}>{report.severity}</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.demographicGrid}>
              <View style={styles.demoItem}>
                <Hash size={14} color={COLORS.gray} /><Text style={styles.demoLabel}>Age: <Text style={styles.demoValue}>{report.patient_age || 'N/A'}</Text></Text>
              </View>
              <View style={styles.demoItem}>
                <MapPin size={14} color={COLORS.gray} /><Text style={styles.demoLabel}>Place: <Text style={styles.demoValue}>{report.patient_place || 'N/A'}</Text></Text>
              </View>
            </View>
          </View>

          {report.ai_improvement_notes && (
            <View style={[styles.sectionCard, { backgroundColor: '#F0F9FF', borderColor: '#BAE6FD', borderWidth: 1 }]}>
              <View style={styles.sectionHeaderRow}>
                <History color="#0369A1" size={20} />
                <Text style={[styles.sectionTitle, { color: '#0369A1' }]}>AI Learning Engine (Audit Note)</Text>
              </View>
              <Text style={[styles.normalText, { fontStyle: 'italic', marginTop: 8 }]}>
                {report.ai_improvement_notes}
              </Text>
            </View>
          )}

          <View style={styles.sectionCard}>
            <View style={styles.rowBetween}>
              <View style={styles.sectionHeaderRow}><ClipboardList color={COLORS.primary} size={20} /><Text style={styles.sectionTitle}>AI Diagnosis Report</Text></View>
              {userRole === 'doctor' && report.status === 'pending' && !isEditing && (
                <TouchableOpacity onPress={() => setIsEditing(true)}><Edit3 color={COLORS.primary} size={20} /></TouchableOpacity>
              )}
            </View>
            {isEditing ? (
              <TextInput style={styles.textInput} value={editedDraft} onChangeText={setEditedDraft} multiline textAlignVertical="top" />
            ) : (
              <View style={styles.reportContentContainer}>{renderFormattedDraft(editedDraft || report.ai_report)}</View>
            )}
          </View>

          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}><FileText color={COLORS.primary} size={20} /><Text style={styles.sectionTitle}>Chat Summary</Text></View>
            <View style={styles.summaryBox}>
              <Text style={styles.summaryText}>{report.summary || "Summary loading..."}</Text>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.chatButton}
            onPress={() => navigation.navigate('ChatTranscript', { sessionId: report.session_id })}
          >
            <MessageSquare color="white" size={20} />
            <Text style={styles.chatButtonText}>View Full Chat Transcript</Text>
          </TouchableOpacity>

          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}><ShieldCheck color={COLORS.primary} size={20} /><Text style={styles.sectionTitle}>Forensic Audit Trail</Text></View>
            {report.status !== 'pending' && (
              <View style={styles.comparisonBox}>
                <View style={styles.comparisonHeader}>
                  <History size={14} color={COLORS.primary} />
                  <Text style={styles.comparisonTitle}>Clinical Evolution</Text>
                </View>
                <View style={styles.comparisonGrid}>
                  <View style={styles.comparisonColumn}>
                    <Text style={styles.columnLabel}>AI ORIGINAL</Text>
                    <ScrollView style={styles.comparisonScroll} nestedScrollEnabled={true}>
                       <Text style={styles.columnText}>{report.ai_report}</Text>
                    </ScrollView>
                  </View>
                  <View style={styles.comparisonDivider} />
                  <View style={styles.comparisonColumn}>
                    <Text style={styles.columnLabel}>VERIFIED FINAL</Text>
                    <ScrollView style={styles.comparisonScroll} nestedScrollEnabled={true}>
                       <Text style={[styles.columnText, {color: '#059669'}]}>{report.doctor_report || "Signed as accurate"}</Text>
                    </ScrollView>
                  </View>
                </View>
              </View>
            )}
          </View>

          <View style={[styles.sectionCard, { borderColor: COLORS.primary, borderWidth: 1 }]}>
            <View style={styles.sectionHeaderRow}>
              <Star color={COLORS.primary} size={20} />
              <Text style={styles.sectionTitle}>
                {userRole === 'doctor' ? "Clinical Validation Note" : "AI Performance Feedback"}
              </Text>
            </View>
            <TextInput 
              style={styles.feedbackInput} 
              placeholder={userRole === 'doctor' ? "State clinical reasoning (mandatory)..." : "Was the AI summary accurate? (mandatory)..."}
              placeholderTextColor={COLORS.gray}
              multiline
              value={feedback}
              onChangeText={setFeedback}
            />
            {userRole === 'patient' && report.status === 'approved' && (
              <TouchableOpacity style={styles.submitBtn} onPress={submitPatientFeedback}>
                <Text style={styles.submitBtnText}>Submit Feedback</Text>
              </TouchableOpacity>
            )}
            <Text style={styles.helperText}>* Required to improve triage intelligence</Text>
          </View>

          <View style={{height: 140}} />
        </ScrollView>

        {userRole === 'doctor' && report.status === 'pending' && (
          <View style={styles.actionBar}>
            {isEditing ? (
              <TouchableOpacity style={[styles.btn, styles.btnPrimary, {width: '100%'}]} onPress={() => setIsEditing(false)}>
                <Save color="white" size={20} /><Text style={styles.btnText}>Save Edits</Text>
              </TouchableOpacity>
            ) : (
              <View style={{flexDirection: 'row', gap: 10, width: '100%'}}>
                <TouchableOpacity onPress={handleReject} style={[styles.btn, styles.btnReject, {flex: 1}]}>
                  <Trash2 color="#EF4444" size={20} />
                  <Text style={styles.btnTextReject}>Reject</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleApprove} style={[styles.btn, styles.btnSuccess, {flex: 2}]}>
                  {isApproving ? <ActivityIndicator color="white" /> : <><Share2 color="white" size={20} /><Text style={styles.btnText}>Approve & Sync EHR</Text></>}
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: 16, paddingTop: 8 },
  navHeader: { height: Platform.OS === 'ios' ? 115 : 95, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#f1f5f9', flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', paddingHorizontal: 10, paddingBottom: 20 },
  navTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e293b' },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 15 },
  profileCard: { backgroundColor: 'white', padding: 20, borderRadius: 20, marginBottom: 16, elevation: 3 },
  profileHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatarCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  profileName: { fontSize: 18, fontWeight: 'bold', color: '#1e293b' },
  uidRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  profileCaseId: { fontSize: 11, color: COLORS.gray },
  divider: { height: 1, backgroundColor: '#f1f5f9', marginBottom: 12 },
  demographicGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  demoItem: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  demoLabel: { fontSize: 12, color: COLORS.gray, marginLeft: 6 },
  demoValue: { fontSize: 12, fontWeight: 'bold', color: '#334155' },
  sectionCard: { backgroundColor: 'white', padding: 20, borderRadius: 16, marginBottom: 16, elevation: 2 },
  sectionTitle: { fontSize: 15, fontWeight: 'bold', color: '#1E293B' },
  summaryBox: { backgroundColor: '#F1F5F9', padding: 15, borderRadius: 12 },
  summaryText: { fontSize: 14, color: '#475569', lineHeight: 22 },
  chatButton: { backgroundColor: '#4f46e5', padding: 18, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 16 },
  chatButtonText: { color: 'white', fontWeight: 'bold', fontSize: 15 },
  reportContentContainer: { marginTop: 5 },
  lineWrapper: { marginBottom: 10 },
  boldHeading: { fontSize: 14, fontWeight: 'bold', color: '#334155' },
  normalText: { fontSize: 14, lineHeight: 22, color: '#475569' },
  textInput: { minHeight: 180, backgroundColor: '#F8FAFC', padding: 15, borderRadius: 12, borderWidth: 1, borderColor: COLORS.primary, fontSize: 14, color: '#1e293b' },
  feedbackInput: { minHeight: 80, backgroundColor: '#F8FAFC', padding: 12, borderRadius: 10, fontSize: 14, color: '#1e293b', textAlignVertical: 'top' },
  submitBtn: { backgroundColor: COLORS.primary, padding: 12, borderRadius: 10, marginTop: 10, alignItems: 'center' },
  submitBtnText: { color: 'white', fontWeight: 'bold' },
  comparisonBox: { marginTop: 15, backgroundColor: '#F8FAFC', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#E2E8F0', height: 250 },
  comparisonHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  comparisonTitle: { fontSize: 12, fontWeight: 'bold', color: COLORS.primary },
  comparisonGrid: { flexDirection: 'row', gap: 10, flex: 1 },
  comparisonColumn: { flex: 1, height: '100%' },
  comparisonScroll: { flex: 1 },
  comparisonDivider: { width: 1, backgroundColor: '#CBD5E1' },
  columnLabel: { fontSize: 9, fontWeight: 'bold', color: COLORS.gray, marginBottom: 4 },
  columnText: { fontSize: 11, color: '#475569', lineHeight: 16 },
  urgencyBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  urgencyText: { color: 'white', fontWeight: 'bold', fontSize: 10 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  actionBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'white', padding: 20, borderTopWidth: 1, borderTopColor: '#E2E8F0', paddingBottom: Platform.OS === 'ios' ? 40 : 20 },
  btn: { height: 55, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  btnPrimary: { backgroundColor: COLORS.primary },
  btnSuccess: { backgroundColor: '#10B981' },
  btnReject: { backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FEE2E2' },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  btnTextReject: { color: '#EF4444', fontWeight: 'bold' }
});

export default ReportReviewScreen;