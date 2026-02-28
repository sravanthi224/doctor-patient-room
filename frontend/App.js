import "./global.css";
import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppNavigator from './src/navigation/AppNavigator';
import { ActivityIndicator, View } from 'react-native';

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [initialRoute, setInitialRoute] = useState('Landing');

  useEffect(() => {
    const checkUserAuth = async () => {
      try {
        // Attempt to retrieve credentials from storage
        const token = await AsyncStorage.getItem('access_token');
        const role = await AsyncStorage.getItem('user_role');
        
        if (token && role) {
          // If a session exists, route directly to the correct dashboard
          setInitialRoute(role === 'doctor' ? 'DoctorDashboard' : 'PatientHome');
        }
      } catch (e) {
        // Log error if native storage module fails
        console.warn("Auth check failed or storage not ready:", e);
      } finally {
        // Hide the loading spinner
        setIsReady(true);
      }
    };
    checkUserAuth();
  }, []);

  // Show a clean loading screen while the app checks storage
  if (!isReady) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF'}}>
        <ActivityIndicator size="large" color="#0D9488" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      {/* Passing the calculated route to the navigator */}
      <AppNavigator initialRouteName={initialRoute} />
    </NavigationContainer>
  );
}