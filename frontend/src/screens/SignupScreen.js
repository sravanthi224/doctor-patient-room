import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  ActivityIndicator, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform, 
  TouchableWithoutFeedback, 
  Keyboard,
  SafeAreaView 
} from 'react-native';
// Added Eye and EyeOff icons
import { Eye, EyeOff } from 'lucide-react-native'; 
import API from '../services/api';

export default function SignupScreen({ route, navigation }) {
  const { selectedRole } = route.params || { selectedRole: 'patient' };
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    license_id: '' 
  });
  
  const [loading, setLoading] = useState(false);
  // New state for password visibility toggle
  const [showPassword, setShowPassword] = useState(false);

  const handleSignup = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      Alert.alert("Error", "Please fill in all basic fields.");
      return;
    }

    if (selectedRole === 'doctor' && !formData.license_id) {
      Alert.alert("Registration Error", "Doctor Secret Code is required.");
      return;
    }

    setLoading(true);
    try {
      const endpoint = selectedRole === 'doctor' 
        ? `/auth/signup/doctor?secret_code=${formData.license_id}` 
        : `/auth/signup/patient`;

      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password
      };

      const response = await API.post(endpoint, payload);

      if (response.status === 200 || response.status === 201) {
        Alert.alert("Success", `${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)} account created successfully!`);
        navigation.navigate('Login', { selectedRole });
      }
    } catch (error) {
      const errorMsg = error.response?.data?.detail || "Could not connect to server.";
      Alert.alert("Signup Failed", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
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
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>
                Registering as a <Text style={{color: '#0D9488', fontWeight: 'bold'}}>{selectedRole.toUpperCase()}</Text>
              </Text>

              <View style={styles.inputContainer}>
                <View style={styles.inputGroup}>
                   <Text style={styles.fieldLabel}>FULL NAME</Text>
                   <TextInput
                    placeholder="John Doe"
                    placeholderTextColor="#94a3b8"
                    style={styles.input}
                    onChangeText={(val) => setFormData({...formData, name: val})}
                    cursorColor="#0D9488"
                  />
                </View>

                <View style={styles.inputGroup}>
                   <Text style={styles.fieldLabel}>EMAIL ADDRESS</Text>
                   <TextInput
                    placeholder="email@example.com"
                    placeholderTextColor="#94a3b8"
                    style={styles.input}
                    onChangeText={(val) => setFormData({...formData, email: val})}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    cursorColor="#0D9488"
                  />
                </View>
                
                {selectedRole === 'doctor' && (
                  <View style={styles.inputGroup}>
                    <Text style={styles.fieldLabel}>SECRET CODE</Text>
                    <TextInput
                      placeholder="e.g., MED2026"
                      placeholderTextColor="#94a3b8"
                      style={[styles.input, { borderColor: '#0D9488', borderWidth: 1.5 }]}
                      onChangeText={(val) => setFormData({...formData, license_id: val})}
                      cursorColor="#0D9488"
                    />
                  </View>
                )}

                <View style={styles.inputGroup}>
                  <Text style={styles.fieldLabel}>PASSWORD</Text>
                  <View style={styles.passwordWrapper}>
                    <TextInput
                      placeholder="Enter your password"
                      placeholderTextColor="#94a3b8"
                      style={[styles.input, { flex: 1, marginBottom: 0 }]}
                      // secureTextEntry is controlled by state
                      secureTextEntry={!showPassword} 
                      onChangeText={(val) => setFormData({...formData, password: val})}
                      cursorColor="#0D9488"
                    />
                    <TouchableOpacity 
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.eyeIcon}
                    >
                      {showPassword ? (
                        <EyeOff size={20} color="#94a3b8" />
                      ) : (
                        <Eye size={20} color="#94a3b8" />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              <TouchableOpacity 
                style={styles.button} 
                onPress={handleSignup} 
                disabled={loading}
              >
                {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Register Now</Text>}
              </TouchableOpacity>

              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.loginLink}>
                <Text style={styles.linkText}>
                  Already have an account? <Text style={{fontWeight: 'bold', color: '#0D9488'}}>Login</Text>
                </Text>
              </TouchableOpacity>
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
    justifyContent: 'center' 
  },
  innerContainer: { 
    padding: 25 
  },
  title: { 
    fontSize: 32, 
    fontWeight: '800', 
    color: '#0F172A', 
    textAlign: 'center' 
  },
  subtitle: { 
    fontSize: 16, 
    color: '#64748B', 
    textAlign: 'center', 
    marginBottom: 30 
  },
  inputContainer: { 
    marginBottom: 10 
  },
  inputGroup: {
    marginBottom: 15,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94a3b8',
    marginBottom: 6,
    marginLeft: 4,
    letterSpacing: 0.5
  },
  input: { 
    backgroundColor: 'white', 
    padding: 15, 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: '#E2E8F0',
    color: '#0F172A',
    fontSize: 16
  },
  // Added wrapper to contain Input + Icon
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingRight: 10,
  },
  eyeIcon: {
    padding: 10,
  },
  button: { 
    backgroundColor: '#0D9488', 
    padding: 18, 
    borderRadius: 12, 
    alignItems: 'center', 
    marginTop: 10,
    elevation: 2,
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5
  },
  buttonText: { 
    color: 'white', 
    fontWeight: 'bold', 
    fontSize: 16 
  },
  loginLink: {
    marginTop: 20,
  },
  linkText: { 
    textAlign: 'center', 
    color: '#64748B' 
  }
});