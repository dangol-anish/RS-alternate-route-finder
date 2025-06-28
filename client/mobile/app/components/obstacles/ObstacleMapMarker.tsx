import React, { useCallback } from "react";
import { Marker } from "react-native-maps";
import { Obstacle } from "@/app/types/obstacle";
import { LatLng } from "react-native-maps";
import { themeColors } from "@/app/styles/colors";

interface Props {
  obstacle: Obstacle;
  onPress: (obstacle: Obstacle) => void;
}

const ObstacleMapMarker: React.FC<Props> = React.memo(
  ({ obstacle, onPress }) => {
    const coordinate: LatLng = {
      latitude: obstacle.latitude,
      longitude: obstacle.longitude,
    };

    // Memoize the onPress handler to prevent unnecessary re-renders
    const handlePress = useCallback(() => {
      onPress(obstacle);
    }, [obstacle, onPress]);

    return (
      <Marker
        coordinate={coordinate}
        onPress={handlePress}
        pinColor={themeColors.red}
        tracksViewChanges={false}
      />
    );
  }
);

ObstacleMapMarker.displayName = "ObstacleMapMarker";

export default ObstacleMapMarker;
