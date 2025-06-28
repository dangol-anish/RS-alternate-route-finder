import React from "react";
import { Marker } from "react-native-maps";
import { Obstacle } from "@/app/types/obstacle";
import { LatLng } from "react-native-maps";
import { themeColors } from "@/app/styles/colors";

interface Props {
  obstacle: Obstacle;
  onPress: (obstacle: Obstacle) => void;
}

const ObstacleMapMarker: React.FC<Props> = ({ obstacle, onPress }) => {
  const coordinate: LatLng = {
    latitude: obstacle.latitude,
    longitude: obstacle.longitude,
  };

  return (
    <Marker
      coordinate={coordinate}
      onPress={() => onPress(obstacle)}
      pinColor={themeColors.red}
    />
  );
};

export default ObstacleMapMarker;
