import React from "react";
import { View, Image } from "react-native";
import { getObstacleIcon, getSeverityColor } from "../../utils/obstacleUtils";

interface ObstacleMarkerProps {
  type: string;
  severity: string;
}

const ObstacleMarker: React.FC<ObstacleMarkerProps> = ({ type, severity }) => {
  return (
    <View style={{ width: 30, height: 30 }}>
      <Image
        source={getObstacleIcon(type)}
        style={{
          width: 30,
          height: 30,
          resizeMode: "contain",
          tintColor: getSeverityColor(severity),
        }}
      />
    </View>
  );
};

export default ObstacleMarker;
