import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import ClearPathButton from "./ClearPathButton";
import CurrentLocationButton from "./CurrentLocationButton";
import { useMapStore } from "../store/useMapStore";

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

  const Button = ({ title, mode }: { title: string; mode: any }) => (
    <TouchableOpacity
      style={[
        styles.button,
        selectionMode === mode && { backgroundColor: "#4682B4" },
      ]}
      onPress={() => setSelectionMode(selectionMode === mode ? "none" : mode)}
    >
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.floatingView}>
      <ClearPathButton clearPath={clearPath} />
      <Button title="Set Source" mode="source" />
      <Button title="Set Destination" mode="destination" />
      <Button title="Add Obstacle" mode="obstacle" />
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
  button: {
    backgroundColor: "gray",
    padding: 10,
    borderRadius: 10,
  },
  buttonText: {
    color: "white",
  },
});
