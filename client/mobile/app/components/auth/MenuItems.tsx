import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { useMapStore } from "@/app/store/useMapStore";
import { Entypo } from "@expo/vector-icons";
import { Button } from "react-native";
import { useRouter } from "expo-router";

const MenuItems = () => {
  const setShowSettings = useMapStore((state) => state.setShowSettings);

  const router = useRouter();

  function redirectLogin() {
    router.push({ pathname: "/(auth)/signin" });
  }

  return (
    <View style={styles.menuView}>
      {/* header option */}
      <View style={styles.headerMenu}>
        <Text style={styles.headerText}>Menu</Text>
        <TouchableOpacity
          // style={styles.closeButton}
          onPress={() => setShowSettings(false)}
        >
          <Entypo name="cross" size={24} color="black" />
        </TouchableOpacity>
      </View>
      {/* auth menu item */}
      <View style={styles.menuOptions}>
        <View style={styles.authMenuOptions}>
          <Text style={styles.authHeaderText}>Login To RoadSense!</Text>
          <Text style={styles.authSubHeaderText}>
            Report obstacles and rate them
          </Text>
          <TouchableOpacity onPress={redirectLogin}>
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default MenuItems;

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
    height: "30%",
    backgroundColor: "#f0f0f0",
    borderRadius: 12,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
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
