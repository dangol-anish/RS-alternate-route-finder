import { usePathname, useRouter } from "expo-router";
import { Feather, Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View, Pressable } from "react-native";
import React from "react";
import { themeColors } from "../styles/colors";

const FooterComponent: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();

  // Map route paths to tab identifiers
  const routeToTab: Record<string, string> = {
    "/": "index",
    "/settings": "settings",
    "/roadblock": "roadblock",
  };

  const selectedTab = routeToTab[pathname] || "index";

  const getIconColor = (tab: string) =>
    selectedTab === tab ? themeColors.green : "black";

  const getTextStyle = (tab: string) => ({
    color: selectedTab === tab ? themeColors.green : "black",
    fontWeight: selectedTab === tab ? ("bold" as const) : ("normal" as const),
  });

  return (
    <View style={styles.view}>
      <Pressable style={styles.container} onPress={() => router.push("/")}>
        <Ionicons
          name="compass-outline"
          size={20}
          color={getIconColor("index")}
        />
        <Text style={[styles.iconText, getTextStyle("index")]}>Explore</Text>
      </Pressable>
      <Pressable
        style={styles.container}
        onPress={() => router.push("/roadblock")}
      >
        <Ionicons
          name="warning-outline"
          size={20}
          color={getIconColor("roadblock")}
        />
        <Text style={[styles.iconText, getTextStyle("roadblock")]}>
          Roadblock
        </Text>
      </Pressable>
      <Pressable
        style={styles.container}
        onPress={() => router.push("/settings")}
      >
        <Feather name="settings" size={20} color={getIconColor("settings")} />
        <Text style={[styles.iconText, getTextStyle("settings")]}>
          Settings
        </Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  view: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 10,
    backgroundColor: themeColors.off_white,
    zIndex: 999,
  },
  container: {
    alignItems: "center",
    flexDirection: "column",
    gap: 4,
  },
  iconText: {
    fontSize: 10,
  },
});

export default FooterComponent;
