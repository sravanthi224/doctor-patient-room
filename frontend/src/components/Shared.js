import React from 'react';
import { View, ScrollView as NativeScrollView } from 'react-native';
// We import as RNSafeAreaView to match the usage in the return statement
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';

export const SafeAreaView = ({ children, className, ...props }) => {
  return (
    <RNSafeAreaView style={{ flex: 1 }} className={className} {...props}>
      {children}
    </RNSafeAreaView>
  );
};

export const ScrollView = ({ children, className = "" }) => (
    <NativeScrollView 
      className={`flex-grow ${className}`} 
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ flexGrow: 1 }}
    >
        {children}
    </NativeScrollView>
);