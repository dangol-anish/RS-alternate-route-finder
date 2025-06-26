import { Stack, useRouter } from "expo-router";
import FooterComponent from "./components/FooterComponent";
import { View, StyleSheet } from "react-native";
import React, { useEffect } from "react";
import Toast from "react-native-toast-message";
import { useAuthStore } from "./store/useAuthStore";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RootLayout() {
  const router = useRouter();

  useEffect(() => {
    useAuthStore.getState().loadSession();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        {/* StatusBar with translucent enabled to allow the overlay to cover it */}
        <StatusBar hidden={true} />
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
        <SafeAreaView style={{ flex: 0 }} edges={["bottom"]}>
          <FooterComponent />
        </SafeAreaView>
        <Toast />
      </View>
    </GestureHandlerRootView>
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
