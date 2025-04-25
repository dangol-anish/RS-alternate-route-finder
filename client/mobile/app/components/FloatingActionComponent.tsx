import { StyleSheet, TouchableOpacity, View } from "react-native";
import React from "react";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import ClearPathButton from "./ClearPathButton";
import CurrentLocationButton from "./CurrentLocationButton";
import { useMapStore } from "../store/useMapStore";

// Assuming SelectionMode is something like this (if not, adjust accordingly):
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

  // Updated Button component to ensure mode type safety
  const Button = ({
    iconName,
    mode,
  }: {
    iconName: keyof typeof MaterialIcons.glyphMap;
    mode: SelectionMode; // Ensure mode is of type SelectionMode
  }) => {
    const isActive = selectionMode === mode;
    return (
      <TouchableOpacity
        style={[
          styles.floatingButton,
          isActive && { backgroundColor: "#4682B4" },
        ]}
        onPress={() => setSelectionMode(isActive ? "none" : mode)} // Only valid SelectionMode values
      >
        <MaterialIcons
          name={iconName}
          size={24}
          color={isActive ? "white" : "black"}
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
  },
});
