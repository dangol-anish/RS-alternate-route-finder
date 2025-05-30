import React from "react";
import { Marker } from "react-native-maps";
import { Obstacle } from "@/app/types/obstacle";
import { LatLng } from "react-native-maps";

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
      pinColor="orange"
    />
  );
};

export default ObstacleMapMarker;
