import React from "react";
import { TouchableOpacity, Text } from "react-native";

interface ObstacleToggleButtonProps {
  isObstacleMode: boolean;
  setIsObstacleMode: (isObstacleMode: boolean) => void;
}

const ObstacleToggleButton: React.FC<ObstacleToggleButtonProps> = ({
  isObstacleMode,
  setIsObstacleMode,
}) => {
  return (
    <TouchableOpacity
      style={{
        position: "absolute",
        bottom: 20,
        right: 20,
        backgroundColor: "red",
        padding: 15,
        borderRadius: 30,
      }}
      onPress={() => setIsObstacleMode(!isObstacleMode)}
    >
      <Text style={{ color: "white", fontWeight: "bold" }}>
        {isObstacleMode ? "Stop Obstacle" : "Set Obstacle"}
      </Text>
    </TouchableOpacity>
  );
};

export default ObstacleToggleButton;
