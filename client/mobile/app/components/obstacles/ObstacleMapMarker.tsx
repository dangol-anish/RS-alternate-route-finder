import React, { useEffect, useState } from "react";
import { Marker } from "react-native-maps";
import ObstacleMarker from "./ObstacleMarker";
import { Obstacle } from "@/app/types/obstacle";
import { LatLng } from "react-native-maps";

interface Props {
  obstacle: Obstacle;
  onPress: (obstacle: Obstacle) => void;
}

const ObstacleMapMarker: React.FC<Props> = ({ obstacle, onPress }) => {
  const [tracksChanges, setTracksChanges] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setTracksChanges(false), 500);
    return () => clearTimeout(timeout);
  }, [obstacle.type, obstacle.severity]);

  const coordinate: LatLng = {
    latitude: obstacle.latitude,
    longitude: obstacle.longitude,
  };

  return (
    <Marker
      coordinate={coordinate}
      onPress={() => onPress(obstacle)}
      tracksViewChanges={tracksChanges}
    >
      <ObstacleMarker type={obstacle.type} severity={obstacle.severity} />
    </Marker>
  );
};

export default ObstacleMapMarker;
