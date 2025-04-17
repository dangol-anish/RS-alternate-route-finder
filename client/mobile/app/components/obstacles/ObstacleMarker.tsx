import React from "react";
import { View, Image } from "react-native";
import { getObstacleIcon, getSeverityColor } from "../../utils/obstacleUtils";

interface ObstacleMarkerProps {
  type: string;
  severity: string;
}

const ObstacleMarker: React.FC<ObstacleMarkerProps> = ({ type, severity }) => {
  const icon = getObstacleIcon(type); // Get the correct icon based on the obstacle type

  return (
    <View
      style={{
        width: 40, // Adjust size for consistency
        height: 40, // Adjust size for consistency
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Image
        source={icon}
        style={{
          width: 40, // Ensure consistent image size
          height: 40, // Ensure consistent image size
          resizeMode: "center",
          tintColor: getSeverityColor(severity), // Apply tint color based on severity
        }}
      />
    </View>
  );
};

export default ObstacleMarker;
