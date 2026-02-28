import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  SafeAreaView
} from 'react-native';

// Standard icons for visibility toggle
import { Eye, EyeOff } from 'lucide-react-native'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginUser } from "../services/authService";
import COLORS from '../constants/colors';

export default function LoginScreen({ route, navigation }) {
  const { selectedRole } = route.params || { selectedRole: 'patient' };

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Missing Information", "Please enter email and password");
      return;
    }

    try {
      setLoading(true);
      const res = await loginUser({ email, password });
      const data = res.data;

      await AsyncStorage.setItem("access_token", data.access_token);
      await AsyncStorage.setItem("user_role", data.role);

      // 3. Save complete user object including the email
      const userToStore = {
        id: data.id,
        patient_uid: data.patient_uid,
        name: data.name,
        email: data.email, // <--- ADD THIS LINE
        age: data.age,
        place: data.place,
        role: data.role
      };

      await AsyncStorage.setItem("user", JSON.stringify(userToStore));

      await AsyncStorage.setItem("user", JSON.stringify(userToStore));
      
      const destination = data.role === 'doctor' ? 'DoctorDashboard' : 'PatientHome';
      navigation.replace(destination);

    } catch (error) {
      Alert.alert("Login Failed", "Invalid credentials or server error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            bounces={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.innerContainer}>
              
              {/* Header Section */}
              <View style={styles.headerSection}>
                <Text style={styles.roleHeader}>
                  {selectedRole === 'doctor' ? 'Doctor Portal' : 'Patient Portal'}
                </Text>
                <Text style={styles.subtitle}>
                  Sign in to your secure medical account
                </Text>
              </View>

              {/* Form Section */}
              <View style={styles.formSection}>
                <View style={styles.inputGroup}>
                  <Text style={styles.fieldLabel}>EMAIL ADDRESS</Text>
                  <TextInput
                    placeholder="e.g. user@gmail.com"
                    placeholderTextColor={COLORS.gray}
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.fieldLabel}>PASSWORD</Text>
                  <View style={styles.passwordWrapper}>
                    <TextInput
                      placeholder="Enter your password"
                      placeholderTextColor={COLORS.gray}
                      style={[styles.input, { flex: 1, borderWidth: 0, marginBottom: 0 }]}
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity 
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.eyeBtn}
                    >
                      {showPassword ? (
                        <EyeOff size={20} color={COLORS.gray} />
                      ) : (
                        <Eye size={20} color={COLORS.gray} />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.button, { backgroundColor: COLORS.primary }]}
                  onPress={handleLogin}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={styles.buttonText}>Sign In</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => navigation.navigate('Signup', { selectedRole })}
                  style={styles.signupLink}
                >
                  <Text style={styles.linkText}>
                    Don't have an account? 
                    <Text style={styles.linkBold}> Sign Up</Text>
                  </Text>
                </TouchableOpacity>
              </View>

            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  innerContainer: {
    padding: 24,
    width: '100%',
  },
  headerSection: {
    marginBottom: 40,
    alignItems: 'center',
  },
  roleHeader: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
  },
  formSection: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94a3b8',
    marginBottom: 8,
    marginLeft: 4,
  },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  eyeBtn: {
    padding: 12,
  },
  input: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    color: '#0f172a',
    fontSize: 16,
  },
  button: {
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  signupLink: {
    marginTop: 25,
    alignItems: 'center',
  },
  linkText: {
    color: '#64748b',
    fontSize: 14,
  },
  linkBold: {
    color: COLORS.primary,
    fontWeight: 'bold',
  }
});