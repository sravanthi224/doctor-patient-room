import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator, RefreshControl, StyleSheet } from 'react-native';
import { Activity, LogOut, Users, Clock, Hash, ChevronRight, User } from 'lucide-react-native'; // Added User icon
import { SafeAreaView } from '../components/Shared';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import API from '../services/api';
import COLORS from '../constants/colors';

export default function DoctorDashboardScreen({ navigation }) {
  const [allReports, setAllReports] = useState([]); 
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await API.get('/doctor/queue');
      
      const reportList = Array.isArray(res.data) ? res.data : (res.data.queue || []);
      
      console.log("Reports Loaded:", reportList.length);
      setAllReports(reportList);
    } catch (err) {
      console.error("Fetch Error:", err);
      Alert.alert("Error", "Could not refresh clinical queue.");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchReports();
    }, [])
  );

  const getNormalizedStatus = (status) => status?.toLowerCase()?.trim() || "";
  const getNormalizedSeverity = (severity) => severity?.toUpperCase()?.trim() || "";

  const pendingReports = allReports.filter(r => getNormalizedStatus(r.status) === 'pending');

  const urgentQueue = pendingReports.filter(r => getNormalizedSeverity(r.severity) === 'HIGH');
  const stableQueue = pendingReports.filter(r => getNormalizedSeverity(r.severity) === 'MEDIUM');
  const routineQueue = pendingReports.filter(r => 
    getNormalizedSeverity(r.severity) === 'LOW' || !r.severity || getNormalizedSeverity(r.severity) === ""
  );

  const handleLogout = async () => {
    Alert.alert("Sign Out", "Are you sure?", [
      { text: "No" },
      { text: "Yes", onPress: async () => {
          await AsyncStorage.clear();
          navigation.reset({ index: 0, routes: [{ name: 'Landing' }] });
      }}
    ]);
  };

  const ReportItem = ({ item, color }) => (
    <TouchableOpacity
      key={item.id}
      onPress={() => navigation.navigate('ReportReview', { reportId: item.id, initialReportData: item })}
      className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm mb-3 flex-row items-center"
    >
      <View style={{ backgroundColor: color }} className="w-1.5 h-12 rounded-full" />
      <View className="flex-1 ml-4">
        <View className="flex-row items-center gap-2">
          <Text className="font-bold text-slate-900">Case #{item.id}</Text>
          {item.patient_uid && (
            <View className="bg-slate-100 px-2 py-0.5 rounded flex-row items-center">
              <Hash size={10} color="#64748b" />
              <Text className="text-[10px] font-bold text-slate-500">{item.patient_uid}</Text>
            </View>
          )}
          {item.uncertainty_flag && <Clock color="#f59e0b" size={12} />}
        </View>
        <Text className="text-xs text-slate-500 mt-1" numberOfLines={1}>
          {item.summary || "Awaiting clinical summary..."}
        </Text>
      </View>
      <ChevronRight color="#CBD5E1" size={20} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <View style={{ flex: 1 }}>
        {/* Header */}
        <View className="px-5 py-4 border-b border-slate-100">
          <View className="flex-row justify-between items-center mb-2 mt-2">
            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 bg-indigo-600 rounded-xl items-center justify-center shadow-md">
                <Activity color="white" size={20} />
              </View>
              <View>
                <Text className="font-bold text-slate-900 text-lg">Triage Queue</Text>
                <Text className="text-xs text-slate-500 font-medium">
                  {pendingReports.length} Active Cases
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={handleLogout} className="p-2 bg-slate-50 rounded-full">
              <LogOut color="#475569" size={20} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Queue Content */}
        <ScrollView 
          className="px-4 py-4" 
          refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchReports} color={COLORS.primary} />}
        >
          {/* HIGH PRIORITY */}
          <View className="flex-row items-center mb-3 ml-1">
            <Text className="text-red-600 font-bold">🚨 URGENT</Text>
            <View className="ml-2 bg-red-100 px-2 py-0.5 rounded-full">
               <Text className="text-[10px] font-bold text-red-600">{urgentQueue.length}</Text>
            </View>
          </View>
          {urgentQueue.length > 0 ? (
            urgentQueue.map(item => <ReportItem key={item.id} item={item} color="#ef4444" />)
          ) : (
            <Text style={styles.emptyText}>No urgent cases.</Text>
          )}

          {/* MEDIUM PRIORITY */}
          <View className="flex-row items-center mt-4 mb-3 ml-1">
            <Text className="text-teal-600 font-bold">⚖️ STABLE</Text>
             <View className="ml-2 bg-teal-100 px-2 py-0.5 rounded-full">
               <Text className="text-[10px] font-bold text-teal-600">{stableQueue.length}</Text>
            </View>
          </View>
          {stableQueue.length > 0 ? (
            stableQueue.map(item => <ReportItem key={item.id} item={item} color="#14b8a6" />)
          ) : (
            <Text style={styles.emptyText}>No stable cases.</Text>
          )}

          {/* LOW PRIORITY */}
          <View className="flex-row items-center mt-4 mb-3 ml-1">
            <Text className="text-slate-500 font-bold">🟢 ROUTINE</Text>
             <View className="ml-2 bg-slate-200 px-2 py-0.5 rounded-full">
               <Text className="text-[10px] font-bold text-slate-600">{routineQueue.length}</Text>
            </View>
          </View>
          {routineQueue.length > 0 ? (
            routineQueue.map(item => <ReportItem key={item.id} item={item} color="#94a3b8" />)
          ) : (
            <Text style={styles.emptyText}>No routine cases.</Text>
          )}
          
          <View className="h-20" />
        </ScrollView>
      </View>

      {/* Navigation Footer */}
      <View className="flex-row h-[70px] border-t border-slate-100 bg-white items-center justify-around pb-2">
        <TouchableOpacity className="items-center gap-1 p-2">
          <Users color="#4f46e5" size={22} />
          <Text className="text-[10px] text-indigo-600 font-bold">Queue</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => navigation.navigate('PatientHistoryList')} 
          className="items-center gap-1 p-2"
        >
          <Clock color="#94a3b8" size={22} />
          <Text className="text-[10px] text-slate-400 font-medium">History</Text>
        </TouchableOpacity>

        {/* PROFILE ICON ADDED HERE */}
        <TouchableOpacity 
          onPress={() => navigation.navigate('DoctorProfile')} 
          className="items-center gap-1 p-2"
        >
          <User color="#94a3b8" size={22} />
          <Text className="text-[10px] text-slate-400 font-medium">Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  emptyText: {
    textTransform: 'uppercase',
    fontSize: 10,
    letterSpacing: 1,
    color: '#94a3b8',
    marginLeft: 16,
    marginBottom: 16
  }
});