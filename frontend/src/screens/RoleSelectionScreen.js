import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { COLORS } from '../constants/colors';

const RoleSelectionScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoIcon}>🏥</Text>
        </View>
        <Text style={styles.title}>Doctor Patient Room</Text>
        <Text style={styles.subtitle}>AI-Assisted Clinical Triage System</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.selectText}>Select your role to continue</Text>

        {/* PATIENT SELECTION */}
        <TouchableOpacity
          style={styles.roleCard}
          onPress={() => navigation.navigate('Login', { role: 'patient' })}
          activeOpacity={0.8}
        >
          <View style={styles.iconContainer}>
            <Text style={styles.roleIcon}>👤</Text>
          </View>
          <View style={styles.roleInfo}>
            <Text style={styles.roleTitle}>I am a Patient</Text>
            <Text style={styles.roleDescription}>
              Describe your symptoms to our AI assistant for preliminary assessment
            </Text>
          </View>
          <Text style={styles.arrow}>→</Text>
        </TouchableOpacity>

        {/* DOCTOR SELECTION */}
        <TouchableOpacity
          style={styles.roleCard}
          onPress={() => navigation.navigate('Login', { role: 'doctor' })}
          activeOpacity={0.8}
        >
          <View style={[styles.iconContainer, styles.doctorIcon]}>
            <Text style={styles.roleIcon}>👨‍⚕️</Text>
          </View>
          <View style={styles.roleInfo}>
            <Text style={styles.roleTitle}>I am a Doctor</Text>
            <Text style={styles.roleDescription}>
              Review and approve AI-generated patient reports
            </Text>
          </View>
          <Text style={styles.arrow}>→</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Your health data is secure and HIPAA compliant
        </Text>
        <Text style={styles.footerSubtext}>
          AI-generated reports require doctor approval
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingVertical: 50,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  logoContainer: {
    width: 80,
    height: 80,
    backgroundColor: COLORS.white,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  logoIcon: {
    fontSize: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.white,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 8,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  selectText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 20,
    textAlign: 'center',
  },
  roleCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 60,
    height: 60,
    backgroundColor: COLORS.patientBubble,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  doctorIcon: {
    backgroundColor: COLORS.doctorBubble,
  },
  roleIcon: {
    fontSize: 28,
  },
  roleInfo: {
    flex: 1,
  },
  roleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 4,
  },
  roleDescription: {
    fontSize: 13,
    color: COLORS.gray,
    lineHeight: 18,
  },
  arrow: {
    fontSize: 24,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: COLORS.gray,
    textAlign: 'center',
  },
  footerSubtext: {
    fontSize: 11,
    color: COLORS.secondary,
    marginTop: 4,
    textAlign: 'center',
  },
});

export default RoleSelectionScreen;