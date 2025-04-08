import { Stack, useRouter, useSegments } from "expo-router";
import FooterComponent from "./components/FooterComponent";
import { View, StyleSheet } from "react-native";
import React, { useState } from "react";

export default function RootLayout() {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState("index");

  console.log(selectedTab);

  // Handle tab change
  const handleTabChange = (tab: string) => {
    setSelectedTab(tab);
    const path = tab === "index" ? "/" : `/${tab}`;
    router.push(path as any);
  };

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
          <Stack.Screen name="you" options={{ title: "You" }} />
          {/* <Stack.Screen name="explore" options={{ title: "Explore" }} /> */}
        </Stack>
      </View>
      <FooterComponent
        setSelectedTab={handleTabChange}
        selectedTab={selectedTab}
      />
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
