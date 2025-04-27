import { Stack, useRouter } from "expo-router";
import FooterComponent from "./components/FooterComponent";
import { View, StyleSheet } from "react-native";
import React, { useEffect } from "react";
import Toast from "react-native-toast-message";
import { useAuthStore } from "./store/useAuthStore";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  const router = useRouter();

  useEffect(() => {
    useAuthStore.getState().loadSession();
  }, []);

  return (
    <View style={styles.container}>
      {/* StatusBar with translucent enabled to allow the overlay to cover it */}
      <StatusBar style="light" translucent={true} />
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
      <FooterComponent />
      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 0, // Remove any top margin
  },
  stackContainer: {
    flex: 1,
  },
});
