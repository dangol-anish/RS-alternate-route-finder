import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

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
      {isObstacleMode ? (
        <Ionicons
          style={styles.floatingButtonFocused}
          name="warning"
          size={24}
          color="black"
        />
      ) : (
        <Ionicons
          style={styles.floatingButtonUnfocused}
          name="warning-outline"
          size={24}
          color="black"
        />
      )}
    </TouchableOpacity>
  );
};

export default ObstacleToggleButton;

const styles = StyleSheet.create({
  floatingButtonUnfocused: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 50,
  },

  floatingButtonFocused: {
    backgroundColor: "grey",
    padding: 16,
    borderRadius: 50,
  },
});
