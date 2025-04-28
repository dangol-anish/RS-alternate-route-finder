import { StyleSheet, TouchableOpacity, View } from "react-native";
import React, { useState } from "react";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import ClearPathButton from "./ClearPathButton";
import CurrentLocationButton from "./CurrentLocationButton";
import { useMapStore } from "../store/useMapStore";
import { useAuthStore } from "../store/useAuthStore";
import Toast from "react-native-toast-message";

type SelectionMode = "source" | "destination" | "obstacle" | "none";

interface FloatingActionComponentProps {
  onLocateCurrentLocation: () => void;
  clearPath: () => void;
}

const FloatingActionComponent: React.FC<FloatingActionComponentProps> = ({
  onLocateCurrentLocation,
  clearPath,
}) => {
  const selectionMode = useMapStore((state) => state.selectionMode);
  const setSelectionMode = useMapStore((state) => state.setSelectionMode);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const Button = ({
    iconName,
    mode,
  }: {
    iconName: keyof typeof MaterialIcons.glyphMap;
    mode: SelectionMode;
  }) => {
    const [pressed, setPressed] = useState(false);
    const isActive = selectionMode === mode;
    const isDisabled = mode === "obstacle" && !isAuthenticated;

    const handlePress = () => {
      if (mode === "obstacle" && !isAuthenticated) {
        Toast.show({
          type: "error",
          text1: "Login Required",
          text2: "You must be logged in to set obstacles.",
        });
        return;
      }
      setSelectionMode(isActive ? "none" : mode);
    };

    return (
      <TouchableOpacity
        style={[
          styles.floatingButton,
          isActive && { backgroundColor: "#4682B4" },
          isDisabled && { backgroundColor: "#d3d3d3" },
          pressed && { opacity: 0.6 }, // manual feedback
        ]}
        activeOpacity={0.8}
        onPress={handlePress}
        onPressIn={() => setPressed(true)}
        onPressOut={() => setPressed(false)}
      >
        <MaterialIcons
          name={iconName}
          size={24}
          color={isActive ? "white" : isDisabled ? "gray" : "black"}
        />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.floatingView}>
      <ClearPathButton clearPath={clearPath} />
      <Button iconName="place" mode="source" />
      <Button iconName="flag" mode="destination" />
      <Button iconName="block" mode="obstacle" />
      <CurrentLocationButton
        onLocateCurrentLocation={onLocateCurrentLocation}
      />
    </View>
  );
};

export default FloatingActionComponent;

const styles = StyleSheet.create({
  floatingView: {
    position: "absolute",
    bottom: 10,
    right: 0,
    margin: 16,
    flex: 1,
    gap: 16,
  },
  floatingButton: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
  },
});
