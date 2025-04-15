import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
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

  // utils/api/logout.ts
  const logoutUser = async () => {
    try {
      const response = await fetch(
        `http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:5000/signout`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // if you're using cookies for auth/session
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Logout failed");
      }

      return data;
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  };

  const redirectLogin = () => {
    router.push({ pathname: "/(auth)/signin" });
  };

  const redirectProfile = () => {
    router.push({ pathname: "/(auth)/profile/page" });
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
              <Image
                source={{ uri: user.photo }}
                style={styles.profileImage}
                resizeMode="cover"
              />
            )}

            <Text style={styles.authHeaderText}>Hi, {user.full_name}</Text>
            <Text style={styles.authSubHeaderText}>{user.email}</Text>

            <TouchableOpacity
              onPress={async () => {
                await logoutUser();
                await useAuthStore.getState().clearSession();
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
      <View style={styles.container}>
        <View style={styles.buttonWrapper}>
          <View style={styles.horizontalLine} />
          <TouchableOpacity style={styles.button} onPress={redirectProfile}>
            <Text style={styles.buttonText}>Profile</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.buttonWrapper}>
          <View style={styles.horizontalLine} />
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Dark Mode</Text>
          </TouchableOpacity>
        </View>
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

  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },

  container: {
    padding: 20,
    borderRadius: 12,

    gap: 12,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: 200,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  buttonWrapper: {
    flexDirection: "column",
    gap: 8,
  },

  horizontalLine: {
    height: 0.5,
    width: "100%",
    backgroundColor: "grey", // Adjust to fit your theme
  },
});
