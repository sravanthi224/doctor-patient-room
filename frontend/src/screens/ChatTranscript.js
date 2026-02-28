import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, SafeAreaView, Platform } from 'react-native';
import { ChevronLeft, MessageCircle, Clock, User, Bot } from 'lucide-react-native';
import COLORS from '../constants/colors';
import API from '../services/api';

const ChatTranscript = ({ route, navigation }) => {
  const { sessionId } = route.params;
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTranscript = async () => {
      try {
        // Hits your new backend endpoint
        const res = await API.get(`/report/transcript/${sessionId}`);
        setMessages(res.data);
      } catch (err) {
        console.error("Transcript Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTranscript();
  }, [sessionId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Retrieving conversation history...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Lowered Header - Consistent with Review Screen */}
      <View style={styles.navHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft color="#1e293b" size={24} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.navTitle}>Full Transcript</Text>
          <Text style={styles.navSubtitle}>Session ID: #{sessionId}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        style={styles.chatArea} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.length === 0 ? (
          <Text style={styles.emptyText}>No messages found for this triage session.</Text>
        ) : (
          messages.map((msg, index) => {
            const isPatient = msg.sender.toLowerCase() === 'patient';
            return (
              <View key={index} style={[styles.msgRow, isPatient ? styles.patientRow : styles.aiRow]}>
                {!isPatient && <View style={styles.aiIcon}><Bot size={14} color="white" /></View>}
                <View style={[styles.bubble, isPatient ? styles.patientBubble : styles.aiBubble]}>
                  <Text style={[styles.bubbleText, isPatient ? styles.patientText : styles.aiText]}>
                    {msg.content}
                  </Text>
                </View>
                {isPatient && <View style={styles.patientIcon}><User size={14} color="white" /></View>}
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: COLORS.gray, fontSize: 12 },
  navHeader: { 
    height: Platform.OS === 'ios' ? 115 : 95, 
    backgroundColor: 'white', 
    borderBottomWidth: 1, 
    borderBottomColor: '#E2E8F0', 
    flexDirection: 'row', 
    alignItems: 'flex-end', 
    justifyContent: 'space-between', 
    paddingHorizontal: 10, 
    paddingBottom: 20 
  },
  headerTitleContainer: { alignItems: 'center' },
  navTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e293b' },
  navSubtitle: { fontSize: 10, color: COLORS.gray },
  backBtn: { padding: 8 },
  chatArea: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  msgRow: { flexDirection: 'row', marginBottom: 20, alignItems: 'flex-end' },
  patientRow: { justifyContent: 'flex-end' },
  aiRow: { justifyContent: 'flex-start' },
  bubble: { 
    maxWidth: '75%', 
    padding: 15, 
    borderRadius: 20, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 1 }, 
    shadowOpacity: 0.05, 
    shadowRadius: 2, 
    elevation: 1 
  },
  patientBubble: { backgroundColor: COLORS.primary, borderBottomRightRadius: 4, marginRight: 8 },
  aiBubble: { backgroundColor: 'white', borderBottomLeftRadius: 4, marginLeft: 8 },
  bubbleText: { fontSize: 14, lineHeight: 20 },
  patientText: { color: 'white' },
  aiText: { color: '#334155' },
  patientIcon: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#475569', alignItems: 'center', justifyContent: 'center' },
  aiIcon: { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  emptyText: { textAlign: 'center', color: COLORS.gray, marginTop: 100 }
});

export default ChatTranscript;