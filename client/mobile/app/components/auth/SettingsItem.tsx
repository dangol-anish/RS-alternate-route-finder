import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { useMapStore } from "@/app/store/useMapStore";
import {
  Entypo,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
  Octicons,
} from "@expo/vector-icons";
import { Button } from "react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/app/store/useAuthStore";
import { themeColors } from "@/app/styles/colors";
import { Pressable } from "react-native"; // Import Pressable

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
          credentials: "include",
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

            <Text style={styles.authHeaderText}>{user.full_name}</Text>
            <Text style={styles.authSubHeaderText}>{user.email}</Text>
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
      {/* <View style={styles.container}>
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
      </View> */}

      <View style={styles.container}>
        <View style={styles.subMenu}>
          <Pressable
            style={({ pressed }) => [
              styles.subMenuItem,
              pressed && styles.subMenuItemPressed,
            ]}
            onPress={redirectProfile}
          >
            <Ionicons name="person" size={24} color="black" />
            <Text style={styles.buttonText}>Profile</Text>
          </Pressable>
          <View style={styles.separator} />
          <Pressable
            style={({ pressed }) => [
              styles.subMenuItem,
              pressed && styles.subMenuItemPressed,
            ]}
            onPress={() => {
              // You can add your Themes navigation here
            }}
          >
            <Ionicons name="invert-mode" size={24} color="black" />
            <Text style={styles.buttonText}>Themes</Text>
          </Pressable>
        </View>
      </View>
      <TouchableOpacity
        onPress={async () => {
          await logoutUser();
          await useAuthStore.getState().clearSession();
        }}
      >
        <Text style={styles.loginButtonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SettingsItem;
const styles = StyleSheet.create({
  menuView: {
    ...StyleSheet.absoluteFillObject,
    paddingTop: 20,
    zIndex: 100,
    flexDirection: "column",
    backgroundColor: themeColors.off_white,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  headerMenu: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
  },
  menuOptions: {
    padding: 20,
  },
  authMenuOptions: {
    flexDirection: "column",
    alignItems: "center",
  },
  authHeaderText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  authSubHeaderText: {
    fontSize: 16,
    fontWeight: "100",
  },
  loginButtonText: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    color: "red",
    fontSize: 20,
    fontWeight: "bold",
    letterSpacing: 1,
    textAlign: "center",
  },
  profileImage: {
    width: 170,
    height: 170,
    borderRadius: 100,
    marginBottom: 12,
  },
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 0,
    gap: 12,
  },
  // button: {
  // paddingVertical: 12,
  // paddingHorizontal: 12,
  // borderRadius: 8,
  // width: 200,
  // flexDirection: "row",
  // alignItems: "center",
  // gap: 12, // Reduced gap to keep spacing consistent
  // },
  buttonText: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 8, // Adjust the spacing between icon and text
  },
  horizontalLine: {
    height: 0.5,
    width: "100%",
  },
  subMenu: {
    backgroundColor: themeColors.beige,
    flex: 1,
    borderRadius: 20,
    padding: 12,
    paddingVertical: 16,

    flexDirection: "column",
  },
  subMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 10,
  },
  subMenuItemPressed: {
    backgroundColor: themeColors.light_green,
    opacity: 0.8,
  },
  separator: {
    height: 1,
    width: "100%",
    backgroundColor: themeColors.light_brown, // Light gray line
    marginVertical: 2,
    opacity: 0.2,
  },
});
