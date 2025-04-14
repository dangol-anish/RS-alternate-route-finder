import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import ObstacleToggleButton from "./ObstacleToggleButton";
import CurrentLocationButton from "./CurrentLocationButton";
import ClearPathButton from "./ClearPathButton";

interface ObstacleToggleButtonProps {
  isObstacleMode: boolean;
  setIsObstacleMode: (isObstacleMode: boolean) => void;
  onLocateCurrentLocation: () => void;
  clearPath: () => void;
}

const FloatingActionComponent: React.FC<ObstacleToggleButtonProps> = ({
  isObstacleMode,
  setIsObstacleMode,
  onLocateCurrentLocation,
  clearPath,
}) => {
  return (
    <View style={styles.floatingView}>
      <ClearPathButton clearPath={clearPath} />
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
  floatingView: {
    position: "absolute",
    bottom: 10,
    right: 0,
    // backgroundColor: "gray",
    margin: 16,
    flex: 1,
    gap: 16,
  },
});
