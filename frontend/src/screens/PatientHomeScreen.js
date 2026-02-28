import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Shield, LogOut, Activity, Phone, MessageSquare, User } from 'lucide-react-native';
import { SafeAreaView } from '../components/Shared';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function PatientHomeScreen({ navigation }) {
    const [userName, setUserName] = useState("User");

    useEffect(() => {
        const getUserInfo = async () => {
            try {
                const userData = await AsyncStorage.getItem('user');
                if (userData) {
                    const parsedUser = JSON.parse(userData);
                    setUserName(parsedUser.name || "User");
                }
            } catch (error) {
                console.error("Error loading user data", error);
            }
        };
        getUserInfo();
    }, []);
    
    const handleLogout = async () => {
        Alert.alert("Logout", "Are you sure you want to sign out?", [
            { text: "Cancel", style: "cancel" },
            { 
                text: "Logout", 
                style: "destructive", 
                onPress: async () => {
                    await AsyncStorage.clear();
                    navigation.reset({ index: 0, routes: [{ name: 'Landing' }] });
                } 
            }
        ]);
    };

    return (
        <SafeAreaView className="bg-white relative">
            {/* Design Background Header */}
            <View className="absolute top-0 left-0 w-full h-[60%] bg-teal-600 rounded-b-[40px] z-0" />
            
            <View className="z-10 flex-1 px-6 pt-12 pb-8">
                {/* Header Section */}
                <View className="flex-row justify-between items-start mb-8">
                    <View className="flex-1 pr-4">
                        <View className="flex-row items-center gap-2 mb-2">
                            <Shield color="#99f6e4" size={20} />
                            <Text className="text-xs font-semibold tracking-widest text-teal-100 uppercase">Doctor Patient Room</Text>
                        </View>
                        <Text className="text-3xl font-bold leading-tight text-white">Namaste,{"\n"}{userName}! 🙏</Text>
                        <Text className="text-teal-100 mt-2 font-medium">How are you feeling today?</Text>
                    </View>

                    <View className="flex-col gap-3">
                        {/* FUNCTIONAL PROFILE ICON */}
                        <TouchableOpacity
                            onPress={() => navigation.navigate('PatientProfile')}
                            className="w-10 h-10 bg-white/20 rounded-full items-center justify-center border border-white/30"
                        >
                            <User color="white" size={22} />
                        </TouchableOpacity>
                        
                        <TouchableOpacity
                            onPress={handleLogout}
                            className="w-10 h-10 bg-white/10 rounded-full items-center justify-center border border-white/20"
                        >
                            <LogOut color="white" size={18} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Info Card */}
                <View className="mb-auto">
                    <View className="bg-white/10 border border-white/20 p-4 rounded-2xl mb-4">
                        <View className="flex-row items-center gap-3 mb-2">
                            <Activity color="#99f6e4" size={20} />
                            <Text className="font-bold text-lg text-white">AI Triage</Text>
                        </View>
                        <Text className="text-sm text-teal-50 leading-relaxed">
                            Describe your symptoms in English, Hinglish, or Tenglish. Our AI will assess your condition instantly.
                        </Text>
                    </View>

                    {/* Emergency Call Card */}
                    <View className="bg-white p-4 rounded-2xl shadow-xl shadow-slate-200/50 flex-row items-center gap-4 border border-slate-100 mt-4">
                        <View className="w-12 h-12 bg-red-50 rounded-full items-center justify-center">
                            <Phone color="#ef4444" size={24} />
                        </View>
                        <View>
                            <Text className="font-bold text-slate-900">Emergency?</Text>
                            <Text className="text-xs text-slate-500">Call <Text className="font-bold text-red-600">112</Text> or <Text className="font-bold text-red-600">108</Text></Text>
                        </View>
                    </View>
                </View>

                {/* --- NAVIGATION TRIGGER --- */}
                <TouchableOpacity
                    onPress={() => navigation.navigate('PatientChat')}
                    className="w-full py-4 bg-slate-900 rounded-2xl flex-row items-center justify-center gap-2 shadow-xl shadow-slate-900/20"
                >
                    <MessageSquare color="white" size={20} />
                    <Text className="text-white font-bold text-lg">Start Assessment</Text>
                </TouchableOpacity>

                <Text className="text-center text-[10px] text-slate-400 mt-4">
                    Please dial to emergency helpline if you think it is serious
                </Text>
            </View>
        </SafeAreaView>
    );
}