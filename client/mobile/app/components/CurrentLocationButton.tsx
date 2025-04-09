import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

interface CurrentLocationButtonProps {
  onLocateCurrentLocation: () => void;
}

const CurrentLocationButton: React.FC<CurrentLocationButtonProps> = ({
  onLocateCurrentLocation,
}) => (
  <TouchableOpacity style={styles.button} onPress={onLocateCurrentLocation}>
    <Text style={styles.buttonText}>Locate Me</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 30,
    marginBottom: 10,
    width: 100,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontSize: 16,
  },
});

export default CurrentLocationButton;
