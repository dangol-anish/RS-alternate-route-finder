import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

interface CurrentLocationButtonProps {
  onLocateCurrentLocation: () => void;
}

const CurrentLocationButton: React.FC<CurrentLocationButtonProps> = ({
  onLocateCurrentLocation,
}) => (
  <TouchableOpacity
    style={styles.floatingButton}
    onPress={onLocateCurrentLocation}
  >
    <Ionicons name="locate" size={24} color="black" />
  </TouchableOpacity>
);

export default CurrentLocationButton;

const styles = StyleSheet.create({
  floatingButton: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 50,
  },
});
