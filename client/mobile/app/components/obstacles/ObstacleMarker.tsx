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
        width: 30,
        height: 30,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Image
        source={icon}
        style={{
          width: 30,
          height: 30,
          resizeMode: "center",
          tintColor: getSeverityColor(severity), // Apply tint color based on severity
        }}
      />
    </View>
  );
};

export default ObstacleMarker;
