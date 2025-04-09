import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import ObstacleToggleButton from "./ObstacleToggleButton";
import CurrentLocationButton from "./CurrentLocationButton";

interface ObstacleToggleButtonProps {
  isObstacleMode: boolean;
  setIsObstacleMode: (isObstacleMode: boolean) => void;
  onLocateCurrentLocation: () => void;
}

const FloatingActionComponent: React.FC<ObstacleToggleButtonProps> = ({
  isObstacleMode,
  setIsObstacleMode,
  onLocateCurrentLocation,
}) => {
  return (
    <View
      style={{
        position: "absolute",
        bottom: 0,
        right: 0,
        backgroundColor: "gray",
        height: 300,
        width: 80,
        margin: 16,
      }}
    >
      <ObstacleToggleButton
        isObstacleMode={isObstacleMode}
        setIsObstacleMode={setIsObstacleMode}
      />
      <CurrentLocationButton
        onLocateCurrentLocation={onLocateCurrentLocation}
      />
    </View>
  );
};

export default FloatingActionComponent;

const styles = StyleSheet.create({
  locateButton: {
    backgroundColor: "blue",
    padding: 10,
    marginTop: 20,
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  locateButtonText: {
    color: "white",
    fontSize: 16,
  },
});
