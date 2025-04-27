import React, { useEffect, useRef, useState } from "react";
import { View, Alert, Image } from "react-native";
import MapView, {
  Marker,
  Polyline,
  MapPressEvent,
  Polygon,
} from "react-native-maps";
import { GeoJSONFeature } from "../types/geoJSON";
import { LatLng } from "react-native-maps";
import { useMapStore } from "../store/useMapStore";
import ObstacleDetailsModal from "./obstacles/ObstacleDetailsModal";
import ObstacleForm from "./obstacles/ObstacleForm";
import axios from "axios";
import { useAuthStore } from "../store/useAuthStore";
import { Obstacle } from "@/app/types/obstacle";
import { MapComponentProps } from "../types/map";
import { getObstacleIcon, getSeverityColor } from "../utils/obstacleUtils";
import ObstacleMarker from "./obstacles/ObstacleMarker";
import ObstacleMapMarker from "./obstacles/ObstacleMapMarker";
import { darkMapStyle } from "../utils/mapStyles";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { themeColors } from "../styles/colors";

const MapComponent: React.FC<MapComponentProps> = ({
  toggleObstacle,
  nodes,
  userLocation,
  mapRegion,
  setMapRegion,
  obstaclesDb,
  mapRef,
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

  useEffect(() => {
    if (userLocation && mapRef.current) {
      // Animate map to the current user location
      mapRef.current.animateToRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  }, [userLocation]);

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
  }) => {
    if (!selectedNode || !userLocation) return;

    try {
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
          owner: user?.id, // Replace with actual user id (optional: from auth token)
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
            pinColor={themeColors.light_brown}
          />
        )}

        {destination && (
          <Marker
            coordinate={{
              latitude: destination.geometry.coordinates[1],
              longitude: destination.geometry.coordinates[0],
            }}
            pinColor={themeColors.light_green}
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
          <Polyline coordinates={path} strokeColor="#800020" strokeWidth={5} />
        )}

        {/* User Location Marker */}
        {userLocation && (
          <Marker
            coordinate={userLocation}
            title="Your Location"
            pinColor="purple"
          >
            <View style={{ justifyContent: "center", alignItems: "center" }}>
              <MaterialCommunityIcons
                name="map-marker-circle"
                size={30}
                color="green"
              />
            </View>
          </Marker>
        )}

        {boundary.length > 0 && (
          <Polygon coordinates={boundary} strokeColor="black" strokeWidth={1} />
        )}
      </MapView>
      <ObstacleForm
        visible={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={handleFormSubmit}
      />
      {selectedObstacle && <ObstacleDetailsModal />}
    </View>
  );
};

export default MapComponent;
