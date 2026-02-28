import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator } from 'react-native';
import { ChevronLeft, AlertTriangle, Heart, Activity, Thermometer, Stethoscope, CheckCircle } from 'lucide-react-native';
import { SafeAreaView } from '../components/Shared';
import API from '../services/api';

export default function DoctorDetailScreen({ route, navigation }) {
    const { report } = route.params; // Expecting the Report object
    const [isApproving, setIsApproving] = useState(false);
    const [doctorNotes, setDoctorNotes] = useState(report.ai_report || '');

    // STEP 5 & 6: Approval System & Backend Sync
    const handleApprove = async () => {
        Alert.alert(
            "Confirm Approval",
            "This will finalize the report and create a forensic audit log.",
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Approve", 
                    onPress: async () => {
                        setIsApproving(true);
                        try {
                            // Call real backend PUT endpoint
                            await API.put(`/report/approve/${report.id}`, {
                                doctor_report: doctorNotes // Matches schemas.py/models.py
                            });
                            Alert.alert("✅ Approved", "Report finalized.");
                            navigation.goBack();
                        } catch (err) {
                            Alert.alert("Error", "Approval failed. Check server connection.");
                        } finally {
                            setIsApproving(false);
                        }
                    }
                }
            ]
        );
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
            <View className="px-4 py-3 border-b border-slate-100 flex-row items-center gap-3 mt-2">
                <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2 rounded-full">
                    <ChevronLeft color="#475569" size={24} />
                </TouchableOpacity>
                <View className="flex-1 items-center pr-8">
                    <Text className="font-bold text-slate-900 text-base">Case Review</Text>
                    <Text className="text-[10px] text-slate-500">#{report.id}</Text>
                </View>
            </View>

            <ScrollView className="flex-1 bg-slate-50/50 p-5">
                <View className="flex-row justify-between items-center mb-6">
                    <View className={`px-2 py-1 rounded-full border ${report.severity === 'HIGH' ? "bg-red-50 border-red-100" : "bg-green-50 border-green-100"}`}>
                        <Text className={`text-[10px] font-bold uppercase ${report.severity === 'HIGH' ? "text-red-700" : "text-green-700"}`}>
                            {report.severity} Severity
                        </Text>
                    </View>
                    <Text className="text-xs text-slate-400">{new Date(report.created_at).toLocaleDateString()}</Text>
                </View>

                {/* STEP 3: Optimized Summary Viewer */}
                <View className="mb-6">
                    <Text className="text-xs font-bold text-slate-400 uppercase mb-3 pl-1">Clinical Summary</Text>
                    <View className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                        <Text className="text-sm text-slate-600 leading-relaxed">
                            {report.summary || "No conversational summary available."}
                        </Text>
                    </View>
                </View>

                {/* STEP 4: Audit Ready Editing */}
                <View className="mb-24">
                    <Text className="text-xs font-bold text-slate-400 uppercase mb-3 pl-1">Final Clinical Draft (AI Proposed)</Text>
                    <TextInput
                        className="w-full min-h-[200px] p-4 rounded-xl text-sm bg-yellow-50 border border-yellow-100 text-slate-800"
                        multiline
                        textAlignVertical="top"
                        value={doctorNotes}
                        onChangeText={setDoctorNotes}
                        placeholder="Edit the clinical report here..."
                    />
                </View>
            </ScrollView>

            <View className="absolute bottom-0 w-full bg-white border-t border-slate-100 p-4 pb-8 shadow-2xl">
                <TouchableOpacity
                    onPress={handleApprove}
                    disabled={isApproving}
                    className="w-full py-4 rounded-xl bg-slate-900 flex-row justify-center items-center gap-2"
                >
                    {isApproving ? <ActivityIndicator color="white" /> : (
                        <>
                            <Text className="text-white font-bold">Approve & Sign Report</Text>
                            <CheckCircle color="white" size={18} />
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}