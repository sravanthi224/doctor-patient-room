import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Activity, User, Stethoscope, ChevronRight, Phone } from 'lucide-react-native';
import { SafeAreaView } from '../components/Shared';

export default function LandingScreen({ navigation }) {
    return (
        <SafeAreaView className="bg-slate-50 relative">
            {/* Navbar */}
            <View className="w-full px-6 pt-6 pb-4 flex-row justify-between items-center z-20">
                <View className="flex-row items-center gap-3">
                    <View className="w-10 h-10 bg-slate-900 rounded-xl items-center justify-center shadow-lg">
                        <Activity color="white" size={20} />
                    </View>
                    <View>
                        <Text className="font-bold text-slate-900 text-lg leading-tight tracking-tight">Doctor Patient Room</Text>
                        <Text className="text-xs text-slate-500 font-medium tracking-widest uppercase mt-0.5">Surampalem</Text>
                    </View>
                </View>
            </View>

            {/* Main Selection */}
            <View className="flex-1 justify-center px-6 pb-12 z-10 space-y-6">
                <View className="items-center mb-4">
                    <Text className="text-3xl font-extrabold text-slate-900 mb-2">Welcome</Text>
                    <Text className="text-slate-600 text-sm">Select your portal to continue</Text>
                </View>

                {/* Patient Card - Redirects to Login with Role */}
                <TouchableOpacity
                    onPress={() => navigation.navigate('Login', { selectedRole: 'patient' })}
                    className="rounded-3xl bg-white p-6 border border-slate-100 shadow-lg mb-4"
                >
                    <View className="items-start">
                        <View className="w-12 h-12 bg-teal-100 rounded-2xl items-center justify-center mb-4">
                            <User color="#0d9488" size={24} />
                        </View>
                        <Text className="text-xl font-bold text-slate-900 mb-1">I am a Patient</Text>
                        <Text className="text-xs text-slate-500 mb-4 leading-relaxed">
                            Chat with our AI assistant for instant triage support in English, Hinglish, or Tenglish.
                        </Text>
                        <View className="flex-row items-center gap-1">
                            <Text className="text-xs font-bold text-teal-600">Enter Room</Text>
                            <ChevronRight color="#0d9488" size={14} />
                        </View>
                    </View>
                </TouchableOpacity>

                {/* Doctor Card - Redirects to Login with Role */}
                <TouchableOpacity
                    onPress={() => navigation.navigate('Login', { selectedRole: 'doctor' })}
                    className="rounded-3xl bg-white p-6 border border-slate-100 shadow-lg"
                >
                    <View className="items-start">
                        <View className="w-12 h-12 bg-indigo-100 rounded-2xl items-center justify-center mb-4">
                            <Stethoscope color="#4f46e5" size={24} />
                        </View>
                        <Text className="text-xl font-bold text-slate-900 mb-1">I am a Doctor</Text>
                        <Text className="text-xs text-slate-500 mb-4 leading-relaxed">
                            Access clinical dashboard, review patient queues, and approve AI reports.
                        </Text>
                        <View className="flex-row items-center gap-1">
                            <Text className="text-xs font-bold text-indigo-600">Clinician Login</Text>
                            <ChevronRight color="#4f46e5" size={14} />
                        </View>
                    </View>
                </TouchableOpacity>

                {/* Medical Emergency Card */}
                <View className="bg-red-50 border border-red-100 rounded-xl p-4 flex-row items-center gap-3 mt-8">
                    <View className="w-8 h-8 bg-red-100 rounded-full items-center justify-center">
                        <Phone color="#ef4444" size={16} />
                    </View>
                    <View className="flex-shrink">
                        <Text className="text-[10px] font-bold text-red-900 uppercase">Medical Emergency?</Text>
                        <Text className="text-xs text-red-700">Call <Text className="font-bold">112</Text> or <Text className="font-bold">108</Text> immediately.</Text>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
}