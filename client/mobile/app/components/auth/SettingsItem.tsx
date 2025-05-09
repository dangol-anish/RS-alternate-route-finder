import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Pressable,
  ActivityIndicator,
} from "react-native";
import React from "react";
import { useMapStore } from "@/app/store/useMapStore";
import { Entypo, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/app/store/useAuthStore";
import { themeColors } from "@/app/styles/colors";
import Toast from "react-native-toast-message";

const SettingsItem = () => {
  const router = useRouter();
  const setShowSettings = useMapStore((state) => state.setShowSettings);

  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const [loading, setLoading] = React.useState(false);

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
          <View>
            {!user.photo ? (
              <MaterialCommunityIcons
                style={styles.profileImage}
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
            <View>
              <Text style={styles.authHeaderText}>Login To RoadSense!</Text>
              <Text style={styles.unAuthSubHeaderText}>
                Report obstacles and rate them
              </Text>
            </View>

            <TouchableOpacity
              style={styles.buttonLogin}
              onPress={redirectLogin}
            >
              <Text style={styles.loginButtonText}>Login</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {isAuthenticated && user && (
        <>
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
                  // Add Themes navigation here
                }}
              >
                <Ionicons name="invert-mode" size={24} color="black" />
                <Text style={styles.buttonText}>Themes</Text>
              </Pressable>

              <View style={styles.separator} />
            </View>
          </View>

          <TouchableOpacity
            disabled={loading}
            onPress={async () => {
              setLoading(true);
              try {
                await logoutUser();
                await useAuthStore.getState().clearSession();
                Toast.show({
                  type: "success",
                  text1: "Logged out successfully!",
                });
              } catch (error) {
                console.error("Logout error:", error);
                Toast.show({
                  type: "error",
                  text1: "Logout failed",
                  text2: "Please try again.",
                });
              } finally {
                setLoading(false);
              }
            }}
            style={[
              {
                opacity: loading ? 0.6 : 1,
              },
            ]}
          >
            <View style={styles.logoutButtonContainer}>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="red" />
                  <Text style={styles.logoutButtonText}>Logging out...</Text>
                </View>
              ) : (
                <Text style={styles.logoutButtonText}>Logout</Text>
              )}
            </View>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

export default SettingsItem;

// Styles
const styles = StyleSheet.create({
  menuView: {
    ...StyleSheet.absoluteFillObject,
    paddingTop: 30,
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

  buttonLogin: {
    backgroundColor: themeColors.green,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },

  authMenuOptions: {
    backgroundColor: themeColors.beige,
    flexDirection: "column",
    alignItems: "center",
    borderRadius: 16,
    padding: 24,
    gap: 16,
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  authHeaderText: {
    fontSize: 28,
    fontWeight: "900",
    color: "#333",
    textAlign: "center",
    marginBottom: 4,
  },
  unAuthSubHeaderText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    fontStyle: "italic",
    opacity: 0.8,
  },
  authSubHeaderText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    opacity: 0.8,
  },
  loginButtonContainer: {
    marginTop: 20,
    backgroundColor: "#000",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 1,
    textAlign: "center",
  },

  logoutButtonContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
  },

  logoutButtonText: {
    color: "red",
    fontSize: 20,
    fontWeight: "bold",
    letterSpacing: 1,
    textAlign: "center",
  },

  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  profileImage: {
    width: 170,
    height: 170,
    borderRadius: 100,
    marginBottom: 12,
    alignSelf: "center",
  },
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 0,
    gap: 12,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 8,
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
    backgroundColor: themeColors.light_brown,
    marginVertical: 2,
    opacity: 0.2,
  },
});
