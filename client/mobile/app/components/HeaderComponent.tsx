import { Ionicons } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import {
  Image,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  FlatList,
  Text,
  ActivityIndicator,
} from "react-native";
import MapView from "react-native-maps";
import { useAuthStore } from "../store/useAuthStore";
import { themeColors } from "../styles/colors";

// Props now accepts the mapRef
const HeaderComponent = ({ mapRef }: { mapRef: React.RefObject<MapView> }) => {
  const user = useAuthStore((state) => state.user);
  const inputRef = useRef<TextInput>(null);

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        {/* Left Icon */}
        <TouchableOpacity
          onPress={() => {
            // No-op or add navigation if needed
          }}
        >
          <Image
            source={require("../../assets/logo/logo.png")}
            style={{ width: 24, height: 24, borderRadius: 0 }}
          />
        </TouchableOpacity>
        {/* Profile */}
        {!user?.photo ? (
          <Image
            source={require("../../assets/logo/Person.png")}
            style={{ width: 24, height: 24, borderRadius: 0 }}
            resizeMode="contain"
          />
        ) : (
          <Image
            source={{ uri: user.photo }}
            style={styles.image}
            resizeMode="cover"
          />
        )}
      </View>
    </View>
  );
};

export default HeaderComponent;

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    top: 20,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  container: {
    flexDirection: "row",
    backgroundColor: themeColors.off_white,
    margin: 16,
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 50,
    elevation: 24,
    shadowColor: themeColors.brown,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 4,
    alignItems: "center",
  },
  textInputWrapper: {
    flex: 1,
    marginHorizontal: 10,
  },
  textInput: {
    backgroundColor: themeColors.off_white,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  image: {
    height: 30,
    width: 30,
    borderColor: "black",
    borderRadius: 70,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
    justifyContent: "flex-start",
    alignItems: "center",
  },
  touchableOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "transparent",
    zIndex: 1,
  },
  dropdown: {
    position: "absolute",
    top: 70,
    left: 20,
    right: 20,
    backgroundColor: themeColors.off_white,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 2,
    paddingVertical: 4,
  },
  resultItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomColor: "#eee",
    borderBottomWidth: 1,
  },
  resultName: {
    fontSize: 15,
    fontWeight: "500",
    color: themeColors.brown,
  },
  resultCoords: {
    fontSize: 12,
    color: "#888",
  },
  noResultsText: {
    color: themeColors.brown,
    fontSize: 15,
    fontWeight: "bold",
    textAlign: "center",
    opacity: 0.7,
    padding: 16,
  },
});
