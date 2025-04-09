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
    <TouchableOpacity onPress={() => setIsObstacleMode(!isObstacleMode)}>
      <Text style={{ color: "white", fontWeight: "bold" }}>
        {isObstacleMode ? "Stop" : "Set"}
      </Text>
    </TouchableOpacity>
  );
};

export default ObstacleToggleButton;
