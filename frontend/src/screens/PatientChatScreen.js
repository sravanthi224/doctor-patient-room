import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { ChevronLeft, Send, AlertTriangle, CheckCircle } from 'lucide-react-native';
import { SafeAreaView } from '../components/Shared';
import COLORS from '../constants/colors';
import { sendMessage } from '../services/chatService';
import API from '../services/api'; 

export default function PatientChatScreen({ navigation }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [isChatFinished, setIsChatFinished] = useState(false);
  const scrollViewRef = useRef(null);

  useEffect(() => {
    initializeTriage();
  }, []);

  /**
   * FIX: Calls the backend to create a real session in MySQL
   * This prevents 403 Unauthorized errors by creating a valid ownership link.
   */
  const initializeTriage = async () => {
    setIsTyping(true);
    try {
      // Step 1: Request a real session ID from the backend
      const response = await API.post('/chat/start');
      const newSessionId = response.data.session_id;
      
      setSessionId(newSessionId);
      
      // Step 2: Show welcome message once session is confirmed
      setMessages([{
        id: 'welcome',
        role: 'ai',
        text: "Namaste. I am your AI Triage Assistant. Please describe your symptoms. I will let you know once I have enough info for the doctor.",
        risk: 'Low'
      }]);
    } catch (err) {
      console.error("Session Init Error:", err.response?.data || err.message);
      Alert.alert(
        "Connection Error", 
        "Could not establish a secure triage session. Please check your internet or log in again."
      );
    } finally {
      setIsTyping(false);
    }
  };

  const handleFinishChat = async () => {
    if (!sessionId) return;
    
    setIsTyping(true);
    try {
      console.log("🚀 Requesting report for valid session:", sessionId);
      const response = await API.post(`/report/generate/${sessionId}`);
      
      const { 
        report, 
        symptoms_verified, 
        suspicious_terms, 
        uncertainty_detected 
      } = response.data;

      navigation.navigate('ReportReview', { 
        reportId: report.id,
        initialReportData: {
          ...report,
          verified_symptoms: symptoms_verified,
          suspicious_terms: suspicious_terms,
          uncertainty_flag: uncertainty_detected
        }
      });
    } catch (err) {
      console.error("Report Generation Error:", err.response?.data || err.message);
      Alert.alert("Engine Error", "Failed to generate structured report. Please try again.");
    } finally {
      setIsTyping(false);
    }
  };

  const handleSend = async () => {
    // Check if session is ready before allowing send
    if (!inputText.trim() || isChatFinished) return;
    if (!sessionId) {
        Alert.alert("Wait", "Initializing secure connection...");
        return;
    }

    const userMsgText = inputText;
    const tempUserMsg = { id: Date.now(), role: 'user', text: userMsgText };
    
    setMessages(prev => [...prev, tempUserMsg]);
    setInputText('');
    setIsTyping(true); 

    try {
      // Uses the real sessionId from the database
      const response = await sendMessage(sessionId, userMsgText);
      let { ai_response } = response.data;

      const completionSignal = "[TRIAGE_COMPLETE]";
      const isComplete = ai_response.includes(completionSignal);
      const cleanText = ai_response.replace(completionSignal, "").trim();

      const aiResponse = { 
        id: Date.now() + 1, 
        role: 'ai', 
        text: cleanText,
        risk: (cleanText.includes("CRITICAL") || cleanText.includes("EMERGENCY")) ? 'High' : 'Low' 
      };
      
      setMessages(prev => [...prev, aiResponse]);

      if (isComplete) {
        setIsChatFinished(true);
        Alert.alert(
          "Assessment Complete",
          "I have gathered sufficient information. Would you like to generate your clinical report now?",
          [
            { text: "Talk More", onPress: () => setIsChatFinished(false) },
            { text: "Generate Report", onPress: handleFinishChat, style: "default" }
          ]
        );
      }
    } catch (error) {
      console.error("Send Error:", error.response?.data || error.message);
      Alert.alert("Error", "Message failed to reach the triage engine.");
    } finally {
      setIsTyping(false); 
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }} 
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 25}
      >
        <View className="bg-white px-4 py-3 border-b border-slate-100 flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2">
              <ChevronLeft color={COLORS.black} size={24} />
            </TouchableOpacity>
            <View>
                <Text className="font-bold text-slate-900">Triage Assistant</Text>
                {sessionId && <Text className="text-[10px] text-slate-400">Session ID: {sessionId}</Text>}
            </View>
          </View>
          
          <TouchableOpacity 
            onPress={handleFinishChat}
            disabled={isTyping || !sessionId}
            className={`flex-row items-center px-3 py-1.5 rounded-full border ${isChatFinished ? 'bg-teal-500 border-teal-600' : 'bg-teal-50 border-teal-100'}`}
          >
            {isTyping ? <ActivityIndicator size="small" color={COLORS.primary} /> : (
              <>
                <CheckCircle color={isChatFinished ? 'white' : COLORS.primary} size={14} />
                <Text className={`ml-1 text-xs font-bold ${isChatFinished ? 'text-white' : 'text-teal-700'}`}>
                  {isChatFinished ? "Ready" : "Finish"}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView 
          className="flex-1 px-4 pt-4" 
          ref={scrollViewRef} 
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((msg) => (
            <View key={msg.id} className={`flex-row mb-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <View style={{ backgroundColor: msg.role === 'user' ? COLORS.black : COLORS.white, borderColor: COLORS.lightGray }} className={`max-w-[85%] p-3 px-4 rounded-2xl shadow-sm border ${msg.role === 'user' ? 'rounded-tr-none' : 'rounded-tl-none'}`}>
                <Text className={`text-[15px] leading-relaxed ${msg.role === 'user' ? 'text-white' : 'text-slate-700'}`}>{msg.text}</Text>
              </View>
            </View>
          ))}
          {isTyping && messages.length > 0 && (
            <View className="flex-row mb-4 justify-start">
              <View className="bg-white border border-slate-100 p-4 rounded-2xl rounded-tl-none shadow-sm flex-row items-center">
                <ActivityIndicator size="small" color={COLORS.primary} />
              </View>
            </View>
          )}
        </ScrollView>

        <View className="bg-white border-t border-slate-100 p-3 pb-8">
          {isChatFinished ? (
            <TouchableOpacity onPress={handleFinishChat} className="bg-slate-900 p-4 rounded-2xl items-center flex-row justify-center gap-2">
              <CheckCircle color="white" size={18} />
              <Text className="text-white font-bold">Generate Clinical Report</Text>
            </TouchableOpacity>
          ) : (
            <View className="flex-row items-center gap-2 bg-slate-50 p-1.5 rounded-full border border-slate-200">
              <TextInput 
                value={inputText} 
                onChangeText={setInputText} 
                placeholder={sessionId ? "Describe your symptoms..." : "Connecting..."} 
                className="flex-1 px-4 h-10 text-slate-800" 
                onSubmitEditing={handleSend}
                editable={!!sessionId}
              />
              <TouchableOpacity 
                onPress={handleSend} 
                disabled={!inputText.trim() || isTyping || !sessionId} 
                style={{ backgroundColor: (inputText.trim() && sessionId) ? COLORS.primary : COLORS.lightGray }} 
                className="w-10 h-10 rounded-full items-center justify-center"
              >
                <Send color="white" size={18} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

