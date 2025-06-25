import { MaterialCommunityIcons } from "@expo/vector-icons";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { Alert, View } from "react-native";
import MapView, {
  LatLng,
  MapPressEvent,
  Marker,
  Polygon,
  Polyline,
} from "react-native-maps";
import { useAuthStore } from "../store/useAuthStore";
import { useMapStore } from "../store/useMapStore";
import { themeColors } from "../styles/colors";
import { GeoJSONFeature } from "../types/geoJSON";
import { MapComponentProps } from "../types/map";
import { darkMapStyle } from "../utils/mapStyles";
import ObstacleDetailsPanel from "./obstacles/ObstacleDetailsModal";
import ObstacleForm from "./obstacles/ObstacleForm";
import ObstacleMapMarker from "./obstacles/ObstacleMapMarker";

const MapComponent: React.FC<MapComponentProps> = ({
  toggleObstacle,
  nodes,
  userLocation,
  mapRegion,
  setMapRegion,
  obstaclesDb,
  mapRef,
  onRoutePress,
}) => {
  const {
    source,
    destination,
    path,
    exploredEdges,
    setSource,
    setDestination,
    obstacles,
    isObstacleMode,
    selectionMode, // ← ADD THIS
    setSelectionMode,
  } = useMapStore();

  const [showForm, setShowForm] = useState(false);
  const [selectedNode, setSelectedNode] = useState<GeoJSONFeature | null>(null);
  const user = useAuthStore((state) => state.user);
  const selectedObstacle = useMapStore((state) => state.selectedObstacle);
  const setSelectedObstacle = useMapStore((state) => state.setSelectedObstacle);

  const selectedObstacleCoord = useMapStore(
    (state) => state.selectedObstacleCoord
  );

  useEffect(() => {
    if (selectedObstacleCoord && mapRef.current) {
      console.log("Animating to obstacle:", selectedObstacleCoord);
      mapRef.current.animateToRegion(
        {
          ...selectedObstacleCoord,
          latitudeDelta: 0.002,
          longitudeDelta: 0.002,
        },
        1000
      );
      // Clear after short delay to allow repeated selection
      setTimeout(() => {
        useMapStore.getState().setSelectedObstacleCoord(null);
      }, 1200);
    }
  }, [selectedObstacleCoord]);

  const findNearestNode = (
    latitude: number,
    longitude: number
  ): GeoJSONFeature | null => {
    if (!nodes.length) return null;

    let nearestNode = nodes[0];
    let minDist = Math.hypot(
      nearestNode.geometry.coordinates[1] - latitude,
      nearestNode.geometry.coordinates[0] - longitude
    );

    nodes.forEach((node) => {
      const dist = Math.hypot(
        node.geometry.coordinates[1] - latitude,
        node.geometry.coordinates[0] - longitude
      );
      if (dist < minDist) {
        nearestNode = node;
        minDist = dist;
      }
    });
    return nearestNode;
  };

  const locateCurrentLocation = () => {
    if (userLocation) {
      setMapRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  };

  const handleFormSubmit = async (formData: {
    name: string;
    type: string;
    expected_duration: string;
    severity: string;
    comments?: string;
    image?: string | null; // Update this to allow 'null'
  }) => {
    if (!selectedNode || !userLocation) return;

    try {
      // Convert image `null` to `undefined`
      const image = formData.image === null ? undefined : formData.image;

      const response = await axios.post(
        `http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:5000/save_obstacles`,
        {
          node_id: selectedNode.id,
          latitude: selectedNode.geometry.coordinates[1],
          longitude: selectedNode.geometry.coordinates[0],
          name: formData.name,
          type: formData.type,
          expected_duration: formData.expected_duration,
          severity: formData.severity,
          comments: formData.comments,
          owner: user?.id,
          image: image,
        }
      );

      console.log("Obstacle saved:", response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error saving obstacle:", error.response?.data); // Log the response from the server
        Alert.alert("Error", error.response?.data?.error || "Unknown error");
      } else {
        console.error("Unexpected error:", error);
      }
    }
  };

  const [boundary, setBoundary] = useState<LatLng[]>([]);

  useEffect(() => {
    const fetchBoundary = async () => {
      try {
        const res = await axios.get(
          `http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:5000/map_boundary`
        );
        const coords = res.data.boundary.map(
          ([lat, lon]: [number, number]) => ({
            latitude: lat,
            longitude: lon,
          })
        );
        setBoundary(coords);
      } catch (error) {
        console.error("Failed to fetch boundary:", error);
      }
    };

    fetchBoundary();
  }, []);

  // Utility: Check if a point is near a path (within threshold meters)
  function isPointNearPath(
    point: { latitude: number; longitude: number },
    path: { latitude: number; longitude: number }[],
    threshold = 0.0005 // smaller threshold for more precise tap
  ) {
    return path.some(
      (p: { latitude: number; longitude: number }) =>
        Math.abs(p.latitude - point.latitude) < threshold &&
        Math.abs(p.longitude - point.longitude) < threshold
    );
  }

  // Debug: log obstacles being rendered on the map
  console.log(
    "MapComponent obstaclesDb",
    obstaclesDb.map((o) => ({ id: o.id, status: o.status }))
  );

  return (
    <View style={{ flex: 1 }}>
      <MapView
        ref={mapRef}
        customMapStyle={darkMapStyle}
        style={{ flex: 1 }}
        initialRegion={mapRegion} // Dynamically controlled by the state
        onRegionChangeComplete={(newRegion) => setMapRegion(newRegion)} // Update the region when the user manually changes it
        onPress={(event: MapPressEvent) => {
          const { latitude, longitude } = event.nativeEvent.coordinate;
          // If a route exists and the tap is near the route, show route info
          if (
            path.length > 0 &&
            isPointNearPath({ latitude, longitude }, path)
          ) {
            if (onRoutePress) onRoutePress();
            return;
          }
          const closestNode = findNearestNode(latitude, longitude);

          if (!closestNode) {
            Alert.alert("Error", "No closest node found!");
            return;
          }

          // if (isObstacleMode) {
          //   setSelectedNode(closestNode);
          //   setShowForm(true); // Show the form
          // } else if (!source) {
          //   setSource(closestNode);
          // } else if (!destination) {
          //   setDestination(closestNode);
          // }

          switch (selectionMode) {
            case "obstacle":
              setSelectedNode(closestNode);
              setShowForm(true);
              break;
            case "source":
              setSource(closestNode);
              setSelectionMode("none"); // optionally reset
              break;
            case "destination":
              setDestination(closestNode);
              setSelectionMode("none"); // optionally reset
              break;
            default:
              break;
          }
        }}
      >
        {source && (
          <Marker
            coordinate={{
              latitude: source.geometry.coordinates[1],
              longitude: source.geometry.coordinates[0],
            }}
            pinColor={themeColors.green}
          />
        )}

        {destination && (
          <Marker
            coordinate={{
              latitude: destination.geometry.coordinates[1],
              longitude: destination.geometry.coordinates[0],
            }}
            pinColor={themeColors.brown}
          />
        )}

        {obstaclesDb.map((obstacle, index) => (
          <ObstacleMapMarker
            key={`db-obstacle-${obstacle.id}`}
            obstacle={obstacle}
            onPress={() => setSelectedObstacle(obstacle)}
          />
          // <Marker
          //   coordinate={{
          //     latitude: obstacle.latitude,
          //     longitude: obstacle.longitude,
          //   }}
          //   pinColor="red"
          // />
        ))}

        {path.length > 0 && (
          <Polyline
            coordinates={path}
            strokeColor={themeColors.red}
            strokeWidth={5}
          />
        )}

        {/* User Location Marker */}
        {userLocation && (
          <Marker coordinate={userLocation} pinColor={themeColors.blue} />
        )}

        {boundary.length > 0 && (
          <Polygon coordinates={boundary} strokeColor="black" strokeWidth={1} />
        )}

        {/* Always render selectedObstacleCoord marker last so it appears on top */}
        {selectedObstacleCoord && (
          <Marker
            coordinate={selectedObstacleCoord}
            pinColor={themeColors.red}
            zIndex={999}
          />
        )}
      </MapView>
      <ObstacleForm
        visible={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={handleFormSubmit}
      />
      {selectedObstacle && <ObstacleDetailsPanel />}
    </View>
  );
};

export default MapComponent;
