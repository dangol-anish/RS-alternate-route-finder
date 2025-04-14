import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { useMapStore } from "@/app/store/useMapStore";
import { Entypo, MaterialCommunityIcons } from "@expo/vector-icons";
import { Button } from "react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/app/store/useAuthStore";

const SettingsItem = () => {
  const router = useRouter();
  const setShowSettings = useMapStore((state) => state.setShowSettings);

  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const redirectLogin = () => {
    router.push({ pathname: "/(auth)/signin" });
  };
  return (
    <View style={styles.menuView}>
      <View style={styles.headerMenu}>
        <Text style={styles.headerText}>Settings</Text>
        <TouchableOpacity onPress={() => setShowSettings(false)}>
          <Entypo name="cross" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <View style={styles.menuOptions}>
        {isAuthenticated && user ? (
          <View style={styles.authMenuOptions}>
            {!user.photo ? (
              <MaterialCommunityIcons
                name="face-man"
                size={100}
                color="black"
              />
            ) : (
              <Text style={styles.authHeaderText}>{user.photo}</Text>
            )}

            <Text style={styles.authHeaderText}>Hi, {user.full_name}</Text>
            <Text style={styles.authSubHeaderText}>{user.email}</Text>

            <TouchableOpacity
              onPress={() => {
                useAuthStore.getState().setUser(null);
                useAuthStore.getState().setIsAuthenticated(false);
              }}
            >
              <Text style={styles.loginButtonText}>Logout</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.authMenuOptions}>
            <Text style={styles.authHeaderText}>Login To RoadSense!</Text>
            <Text style={styles.authSubHeaderText}>
              Report obstacles and rate them
            </Text>
            <TouchableOpacity onPress={redirectLogin}>
              <Text style={styles.loginButtonText}>Login</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

export default SettingsItem;

const styles = StyleSheet.create({
  menuView: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
    flexDirection: "column",
    gap: 20,
    backgroundColor: "#fff",
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  headerMenu: {
    height: "10%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    padding: 20,
  },
  menuOptions: {
    flex: 1,
    padding: 20,
  },
  authMenuOptions: {
    backgroundColor: "#f0f0f0",
    borderRadius: 12,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    padding: 10,
  },
  authHeaderText: {
    fontSize: 24,
    fontWeight: "600",
  },

  authSubHeaderText: {
    fontSize: 12,
    fontWeight: "100",
    paddingBottom: 10,
  },
  loginButtonText: {
    backgroundColor: "black",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    color: "white",
    fontSize: 20,
  },
});
