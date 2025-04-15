import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import Toast from "react-native-toast-message";
import { useAuthStore } from "../store/useAuthStore"; // adjust path

interface ObstacleToggleButtonProps {
  isObstacleMode: boolean;
  setIsObstacleMode: (isObstacleMode: boolean) => void;
}

const ObstacleToggleButton: React.FC<ObstacleToggleButtonProps> = ({
  isObstacleMode,
  setIsObstacleMode,
}) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const handlePress = () => {
    if (!isAuthenticated) {
      Toast.show({
        type: "info",
        text1: "Login required",
        text2: "You need to be logged in to add obstacles.",
      });
      return;
    }
    setIsObstacleMode(!isObstacleMode);
  };

  return (
    <TouchableOpacity onPress={handlePress}>
      <Ionicons
        style={
          isAuthenticated
            ? isObstacleMode
              ? styles.floatingButtonFocused
              : styles.floatingButtonUnfocused
            : styles.floatingButtonDisabled
        }
        name={isObstacleMode ? "warning" : "warning-outline"}
        size={24}
        color="black"
      />
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
  floatingButtonDisabled: {
    backgroundColor: "#ccc",
    padding: 16,
    borderRadius: 50,
    opacity: 0.6,
  },
});
