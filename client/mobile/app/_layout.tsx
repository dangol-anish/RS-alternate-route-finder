import { Stack, useRouter, useSegments } from "expo-router";
import FooterComponent from "./components/FooterComponent";
import { View, StyleSheet } from "react-native";
import React, { useState } from "react";
import Toast from "react-native-toast-message";

export default function RootLayout() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.stackContainer}>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="index" options={{ title: "Home" }} />
          <Stack.Screen name="roadblock" options={{ title: "RoadBlock" }} />
          <Stack.Screen name="settings" options={{ title: "Settings" }} />
        </Stack>
      </View>

      {/* Your footer */}
      <FooterComponent />

      {/* ✅ Toast should be here at the root */}
      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  stackContainer: {
    flex: 1,
  },
});
