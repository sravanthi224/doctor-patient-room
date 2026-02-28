import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Auth & General Screens
import RoleSelectionScreen from '../screens/RoleSelectionScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import LandingScreen from '../screens/LandingScreen';

// Patient Screens
import PatientHomeScreen from '../screens/PatientHomeScreen';
import PatientChatScreen from '../screens/PatientChatScreen';
import PatientProfileScreen from '../screens/PatientProfileScreen';

// Doctor Screens
import DoctorDashboardScreen from '../screens/DoctorDashboardScreen';
import DoctorDetailScreen from '../screens/DoctorDetailScreen';
import DoctorProfileScreen from '../screens/DoctorProfileScreen';

// Clinical Review & History Module
import ReportReviewScreen from '../screens/ReportReviewScreen';
import ChatTranscript from '../screens/ChatTranscript';
import PatientHistoryList from '../screens/PatientHistoryList';
import PatientHistoryScreen from '../screens/PatientHistoryScreen';

const Stack = createStackNavigator();

const AppNavigator = ({ initialRouteName }) => {
  return (
    <Stack.Navigator
      initialRouteName={initialRouteName || "Landing"}
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#FFFFFF' },
        gestureEnabled: true,
      }}
    >
      <Stack.Screen name="Landing" component={LandingScreen} />
      <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="PatientHome" component={PatientHomeScreen} />
      <Stack.Screen name="PatientChat" component={PatientChatScreen} />
      <Stack.Screen name="PatientProfile" component={PatientProfileScreen} />
      <Stack.Screen name="DoctorDashboard" component={DoctorDashboardScreen} />
      <Stack.Screen name="DoctorDetail" component={DoctorDetailScreen} />
      <Stack.Screen name="DoctorProfile" component={DoctorProfileScreen} />
      <Stack.Screen name="ReportReview" component={ReportReviewScreen} />
      <Stack.Screen name="ChatTranscript" component={ChatTranscript} />
      <Stack.Screen name="PatientHistoryList" component={PatientHistoryList} />
      <Stack.Screen name="PatientHistory" component={PatientHistoryScreen} />
    </Stack.Navigator>
  );
};

export default AppNavigator;