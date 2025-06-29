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
import { signOutUser } from "@/app/utils/api";

const appLogo = require("../../../assets/logo/mainLogo.png");

const SettingsItem = () => {
  const router = useRouter();
  const setShowSettings = useMapStore((state) => state.setShowSettings);

  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const [loading, setLoading] = React.useState(false);

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
          <View style={styles.unAuthCard}>
            <Image
              source={appLogo}
              style={styles.unAuthLogo}
              resizeMode="contain"
            />
            <Text style={styles.unAuthTitle}>Welcome to RoadSense</Text>
            <Text style={styles.unAuthDesc}>
              Login to report obstacles, rate them, and personalize your
              experience.
            </Text>
            <TouchableOpacity
              style={styles.unAuthLoginButton}
              onPress={redirectLogin}
              activeOpacity={0.85}
            >
              <Text style={styles.unAuthLoginButtonText}>Login</Text>
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
                <Ionicons name="person" size={24} color={themeColors.brown} />
                <Text style={styles.buttonText}>Profile</Text>
              </Pressable>
              {user?.role === "admin" && (
                <>
                  <View style={styles.separator} />
                  <Pressable
                    style={({ pressed }) => [
                      styles.subMenuItem,
                      pressed && styles.subMenuItemPressed,
                    ]}
                    onPress={() =>
                      router.push("/(protected)/admin/ModerateObstacles")
                    }
                  >
                    <MaterialCommunityIcons
                      name="shield-crown-outline"
                      size={24}
                      color={themeColors.brown}
                    />
                    <Text style={styles.buttonText}>Moderate Obstacles</Text>
                  </Pressable>
                </>
              )}
              <View style={styles.separator} />
              <Pressable
                style={[styles.subMenuItem, { opacity: 0.7 }]}
                disabled={true}
              >
                <MaterialCommunityIcons
                  name="star-circle"
                  size={24}
                  color={themeColors.gray}
                />
                <Text style={styles.buttonText}>
                  Reputation: {user.reputation ?? 0}
                </Text>
              </Pressable>
              <View style={styles.separator} />
            </View>
          </View>

          <TouchableOpacity
            disabled={loading}
            onPress={async () => {
              setLoading(true);
              try {
                await signOutUser();
                await useAuthStore.getState().clearSession();
                Toast.show({
                  type: "success",
                  text1: "Logged out successfully!",
                });
              } catch (error: any) {
                console.error("Logout error:", error);
                Toast.show({
                  type: "error",
                  text1: "Logout failed",
                  text2: error.message || "Please try again.",
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
    fontSize: 20,
    fontWeight: "600",
    color: themeColors.brown,
    textAlign: "center",
    marginBottom: 2,
  },
  unAuthSubHeaderText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    fontStyle: "italic",
    opacity: 0.8,
  },
  authSubHeaderText: {
    fontSize: 13,
    color: themeColors.gray,
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
    color: themeColors.red,
    fontSize: 15,
    fontWeight: "500",
    letterSpacing: 0.5,
    textAlign: "center",
  },

  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  profileImage: {
    width: 110,
    height: 110,
    borderRadius: 60,
    marginBottom: 8,
    alignSelf: "center",
  },
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 0,
    gap: 12,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: "400",
    marginLeft: 8,
    color: themeColors.brown,
  },
  horizontalLine: {
    height: 0.5,
    width: "100%",
  },
  subMenu: {
    backgroundColor: themeColors.off_white,
    flex: 1,
    borderRadius: 16,
    padding: 8,
    paddingVertical: 10,
    flexDirection: "column",
    shadowColor: undefined,
    shadowOffset: undefined,
    shadowOpacity: undefined,
    shadowRadius: undefined,
    elevation: 0,
  },
  subMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 10,
  },
  subMenuItemPressed: {
    backgroundColor: themeColors.beige,
    opacity: 0.8,
  },
  separator: {
    height: 1,
    width: "100%",
    backgroundColor: themeColors.gray,
    marginVertical: 1,
    opacity: 0.15,
  },
  unAuthCard: {
    backgroundColor: themeColors.off_white,
    borderRadius: 20,
    padding: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: themeColors.gray,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
    marginTop: 24,
    marginBottom: 24,
    marginHorizontal: 8,
    minHeight: 220,
  },
  unAuthTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: themeColors.brown,
    marginBottom: 6,
    textAlign: "center",
    letterSpacing: 0.2,
  },
  unAuthDesc: {
    fontSize: 13,
    color: themeColors.gray,
    textAlign: "center",
    marginBottom: 18,
    lineHeight: 18,
    opacity: 0.9,
  },
  unAuthLoginButton: {
    backgroundColor: themeColors.green,
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 36,
    shadowColor: themeColors.green,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.13,
    shadowRadius: 8,
    elevation: 2,
    marginTop: 2,
  },
  unAuthLoginButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 0.5,
    textAlign: "center",
  },
  unAuthLogo: {
    width: 100,
    height: 100,
    marginBottom: 14,
  },
  profileMinimal: {
    alignItems: "center",
    marginTop: 12,
    marginBottom: 18,
  },
  profileAvatarMinimal: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: themeColors.off_white,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: themeColors.green,
  },
  profileNameMinimal: {
    fontSize: 16,
    fontWeight: "700",
    color: themeColors.brown,
    textAlign: "center",
    marginBottom: 0,
  },
  profileEmailMinimal: {
    fontSize: 11,
    color: themeColors.gray,
    textAlign: "center",
    opacity: 0.7,
    marginTop: 0,
  },
  profileDivider: {
    height: 1,
    width: "80%",
    backgroundColor: themeColors.light_brown,
    opacity: 0.08,
    alignSelf: "center",
    marginBottom: 10,
  },
  actionMinimalList: {
    marginHorizontal: 0,
    marginBottom: 18,
  },
  actionMinimalItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 2,
    borderRadius: 8,
    minHeight: 36,
  },
  actionMinimalItemPressed: {
    backgroundColor: themeColors.light_green,
    opacity: 0.9,
  },
  actionMinimalText: {
    fontSize: 13,
    color: themeColors.brown,
    fontWeight: "500",
  },
  actionMinimalDivider: {
    height: 1,
    width: "90%",
    backgroundColor: themeColors.light_brown,
    opacity: 0.08,
    alignSelf: "center",
  },
  logoutMinimal: {
    marginTop: 24,
    marginBottom: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  logoutMinimalText: {
    color: themeColors.red,
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
    textDecorationLine: "underline",
    letterSpacing: 0.2,
  },
  profileMinimalContainer: {
    alignItems: "center",
    marginTop: 18,
    marginBottom: 18,
  },
  profileMinimalAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: themeColors.off_white,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: themeColors.green,
    marginBottom: 8,
  },
  profileMinimalAvatarFallback: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: themeColors.off_white,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: themeColors.green,
    marginBottom: 8,
  },
  profileMinimalName: {
    fontSize: 16,
    fontWeight: "700",
    color: themeColors.brown,
    textAlign: "center",
    marginBottom: 0,
  },
  profileMinimalEmail: {
    fontSize: 11,
    color: themeColors.gray,
    textAlign: "center",
    opacity: 0.7,
    marginTop: 0,
  },
  profileMinimalDivider: {
    height: 1,
    width: "80%",
    backgroundColor: themeColors.light_brown,
    opacity: 0.08,
    alignSelf: "center",
    marginBottom: 10,
  },
});
