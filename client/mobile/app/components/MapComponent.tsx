import { MaterialCommunityIcons } from "@expo/vector-icons";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  View,
  ActivityIndicator,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
} from "react-native";
import { WebView } from "react-native-webview";
import { useAuthStore } from "@/lib/useAuthStore";
import { useMapStore } from "@/lib/useMapStore";
import { themeColors } from "../styles/colors";
import { GeoJSONFeature } from "@/types/geoJSON";
import { MapComponentProps } from "@/types/map";
import ObstacleDetailsPanel from "./obstacles/ObstacleDetailsModal";
import ObstacleForm from "./obstacles/ObstacleForm";
// import ObstacleMapMarker from "./obstacles/ObstacleMapMarker";
import { Obstacle } from "@/types/obstacle";
// @ts-ignore: Could not find a declaration file for module 'uuid'. This is safe for runtime usage.
import { v4 as uuidv4 } from "uuid";

type PlaceResult = {
  name: string;
  latitude: number;
  longitude: number;
};

const MapComponent: React.FC<MapComponentProps> = ({
  toggleObstacle,
  nodes,
  userLocation,
  mapRegion,
  setMapRegion,
  obstaclesDb,
  mapRef,
  onRoutePress,
  mapZoomedToUser,
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
    selectionMode,
    setSelectionMode,
    clearPath,
  } = useMapStore();

  const [showForm, setShowForm] = useState(false);
  const [selectedNode, setSelectedNode] = useState<GeoJSONFeature | null>(null);
  const user = useAuthStore((state) => state.user);
  const selectedObstacle = useMapStore((state) => state.selectedObstacle);
  const setSelectedObstacle = useMapStore((state) => state.setSelectedObstacle);

  const selectedObstacleCoord = useMapStore(
    (state) => state.selectedObstacleCoord
  );

  const webViewRef = useRef<WebView>(null);
  const isUserInteracting = useRef(false);

  // Connect the mapRef to the webViewRef so external functions can access it
  useEffect(() => {
    if (mapRef && webViewRef.current) {
      // @ts-ignore
      mapRef.current = {
        injectJavaScript: (script: string) => {
          webViewRef.current?.injectJavaScript(script);
        },
        animateToRegion: (region: any) => {
          webViewRef.current?.injectJavaScript(`
            map.flyTo([${region.latitude}, ${region.longitude}], 16);
            true;
          `);
        },
      };
    }
  }, [mapRef]);

  useEffect(() => {
    if (selectedObstacleCoord && webViewRef.current) {
      mapZoomedToUser.current = true;

      // Fly to the selected obstacle location with high zoom
      webViewRef.current?.injectJavaScript(`
        map.flyTo([${selectedObstacleCoord.latitude}, ${selectedObstacleCoord.longitude}], 18);
        true;
      `);

      // Clear after short delay to allow repeated selection
      setTimeout(() => {
        const { setSelectedObstacleCoord } = useMapStore.getState();
        setSelectedObstacleCoord(null);
      }, 1200);
    }
  }, [selectedObstacleCoord, mapZoomedToUser]);

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

      // Fly to user location with higher zoom
      webViewRef.current?.injectJavaScript(`
        map.flyTo([${userLocation.latitude}, ${userLocation.longitude}], 16);
        true;
      `);
    }
  };

  // Function to zoom to a specific location
  const zoomToLocation = (
    latitude: number,
    longitude: number,
    zoomLevel: number = 16
  ) => {
    webViewRef.current?.injectJavaScript(`
      map.flyTo([${latitude}, ${longitude}], ${zoomLevel});
      true;
    `);
  };

  // Function to zoom to fit all markers
  const zoomToFitAll = () => {
    webViewRef.current?.injectJavaScript(`
      if (markers.length > 0) {
        var group = new L.featureGroup(markers);
        map.fitBounds(group.getBounds().pad(0.1));
      }
      true;
    `);
  };

  const handleFormSubmit = async (formData: {
    name: string;
    type: string;
    expected_duration: string;
    severity: string;
    comments?: string;
    image?: string | null;
  }) => {
    if (!selectedNode || !userLocation) return;

    try {
      // Convert image `null` to `undefined`
      const image = formData.image === null ? undefined : formData.image;

      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_IP_ADDRESS}/save_obstacles`,
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
    } catch (error) {
      if (axios.isAxiosError(error)) {
        Alert.alert("Error", error.response?.data?.error || "Unknown error");
      } else {
        console.error("Unexpected error:", error);
      }
    }
  };

  const [boundary, setBoundary] = useState<
    { latitude: number; longitude: number }[]
  >([]);

  useEffect(() => {
    const fetchBoundary = async () => {
      try {
        const res = await axios.get(
          `${process.env.EXPO_PUBLIC_IP_ADDRESS}/map_boundary`
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

  // Static HTML template - only loads once
  const mapHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
      <style>
        body { margin: 0; padding: 0; }
        #map { width: 100%; height: 100vh; }
        .custom-marker { background: transparent; border: none; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        var map = L.map('map', {
          zoomControl: true,
          doubleClickZoom: true,
          scrollWheelZoom: true,
          dragging: true,
          touchZoom: true,
          boxZoom: false,
          keyboard: false
        }).setView([${mapRegion.latitude}, ${mapRegion.longitude}], 16);
        var markers = [];
        var polylines = [];
        var polygons = [];
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        function clearMap() {
          markers.forEach(marker => map.removeLayer(marker));
          polylines.forEach(polyline => map.removeLayer(polyline));
          polygons.forEach(polygon => map.removeLayer(polygon));
          markers = [];
          polylines = [];
          polygons = [];
        }

        function updateMap(data) {
          clearMap();
          
          // Add source marker
          if (data.source) {
            var sourceMarker = L.marker([data.source.lat, data.source.lng])
              .addTo(map)
              .bindPopup('Source')
              .setIcon(L.divIcon({
                className: 'custom-marker',
                html: '<div style="background-color: ${themeColors.green}; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white;"></div>',
                iconSize: [24, 24],
                iconAnchor: [12, 12]
              }));
            markers.push(sourceMarker);
          }

          // Add destination marker
          if (data.destination) {
            var destMarker = L.marker([data.destination.lat, data.destination.lng])
              .addTo(map)
              .bindPopup('Destination')
              .setIcon(L.divIcon({
                className: 'custom-marker',
                html: '<div style="background-color: ${themeColors.brown}; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white;"></div>',
                iconSize: [24, 24],
                iconAnchor: [12, 12]
              }));
            markers.push(destMarker);
          }

          // Add user location marker
          if (data.userLocation) {
            var userMarker = L.marker([data.userLocation.lat, data.userLocation.lng])
              .addTo(map)
              .bindPopup('Your Location')
              .setIcon(L.divIcon({
                className: 'custom-marker',
                html: '<div style="background-color: ${themeColors.blue}; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white;"></div>',
                iconSize: [24, 24],
                iconAnchor: [12, 12]
              }));
            markers.push(userMarker);
          }

          // Add path polyline
          if (data.path && data.path.length > 0) {
            var pathCoords = data.path.map(coord => [coord.lat, coord.lng]);
            var polyline = L.polyline(pathCoords, {color: '${themeColors.red}', weight: 5}).addTo(map);
            polylines.push(polyline);
          }

          // Add boundary polygon
          if (data.boundary && data.boundary.length > 0) {
            var boundaryCoords = data.boundary.map(coord => [coord.lat, coord.lng]);
            var polygon = L.polygon(boundaryCoords, {color: 'black', weight: 1, fillOpacity: 0}).addTo(map);
            polygons.push(polygon);
          }

          // Add obstacle markers
          if (data.obstacles) {
            data.obstacles.forEach(function(obstacle, index) {
              var obstacleMarker = L.marker([obstacle.lat, obstacle.lng])
                .addTo(map)
                .bindPopup(obstacle.name || 'Obstacle')
                .setIcon(L.divIcon({
                  className: 'custom-marker',
                  html: '<div style="background-color: ${themeColors.red}; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white;"></div>',
                  iconSize: [24, 24],
                  iconAnchor: [12, 12]
                }))
                .on('click', function() {
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'obstacleClick',
                    obstacleId: obstacle.id || index,
                    obstacle: obstacle
                  }));
                });
              markers.push(obstacleMarker);
            });
          }

          // Add selected obstacle coordinate marker
          if (data.selectedObstacleCoord) {
            var selectedMarker = L.marker([data.selectedObstacleCoord.lat, data.selectedObstacleCoord.lng])
              .addTo(map)
              .setIcon(L.divIcon({
                className: 'custom-marker',
                html: '<div style="background-color: ${themeColors.red}; width: 28px; height: 28px; border-radius: 50%; border: 3px solid white;"></div>',
                iconSize: [28, 28],
                iconAnchor: [14, 14]
              }));
            markers.push(selectedMarker);
          }
        }

        map.on('click', function(e) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'mapClick',
            lat: e.latlng.lat,
            lng: e.latlng.lng
          }));
        });

        // Track user interactions to prevent updates during panning/zooming
        map.on('movestart', function() {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'userInteractionStart'
          }));
        });

        map.on('moveend', function() {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'userInteractionEnd'
          }));
        });

        map.on('zoomstart', function() {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'userInteractionStart'
          }));
        });

        map.on('zoomend', function() {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'userInteractionEnd'
          }));
        });

        // Initial map update
        updateMap({});
      </script>
    </body>
    </html>
  `;

  // Function to update map data without reloading
  const updateMapData = (forceUpdate = false) => {
    console.log(
      "updateMapData called, forceUpdate:",
      forceUpdate,
      "isUserInteracting:",
      isUserInteracting.current
    );

    // Don't update if user is currently interacting with the map (unless forced)
    if (isUserInteracting.current && !forceUpdate) {
      console.log("Skipping update due to user interaction");
      return;
    }

    const mapData = {
      source: source
        ? {
            lat: source.geometry.coordinates[1],
            lng: source.geometry.coordinates[0],
          }
        : null,
      destination: destination
        ? {
            lat: destination.geometry.coordinates[1],
            lng: destination.geometry.coordinates[0],
          }
        : null,
      userLocation: userLocation
        ? { lat: userLocation.latitude, lng: userLocation.longitude }
        : null,
      path: path.map((coord) => ({
        lat: coord.latitude,
        lng: coord.longitude,
      })),
      boundary: boundary.map((coord) => ({
        lat: coord.latitude,
        lng: coord.longitude,
      })),
      obstacles: obstaclesDb.map((obstacle) => ({
        lat: obstacle.latitude,
        lng: obstacle.longitude,
        name: obstacle.name || "Obstacle",
      })),
      selectedObstacleCoord: selectedObstacleCoord
        ? {
            lat: selectedObstacleCoord.latitude,
            lng: selectedObstacleCoord.longitude,
          }
        : null,
    };

    webViewRef.current?.injectJavaScript(`
      updateMap(${JSON.stringify(mapData)});
      true;
    `);
  };

  // Update map when data changes (but not on map movement)
  useEffect(() => {
    // Only update if the WebView is ready
    if (webViewRef.current) {
      console.log("Updating map data:", {
        source,
        destination,
        userLocation,
        path,
        boundary,
        obstaclesDb,
      });
      updateMapData();
    }
  }, [
    source,
    destination,
    userLocation,
    path,
    boundary,
    obstaclesDb,
    selectedObstacleCoord,
  ]);

  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      if (data.type === "mapClick") {
        if (selectionMode === "none") return;

        const latitude = data.lat;
        const longitude = data.lng;

        // If a route exists and the tap is near the route, show route info
        if (path.length > 0 && isPointNearPath({ latitude, longitude }, path)) {
          if (onRoutePress) onRoutePress();
          return;
        }

        const closestNode = findNearestNode(latitude, longitude);

        if (!closestNode) {
          Alert.alert("Error", "No closest node found!");
          return;
        }

        switch (selectionMode) {
          case "obstacle":
            setSelectedNode(closestNode);
            setShowForm(true);
            break;
          case "source":
            setSource(closestNode);
            setSelectionMode("none");
            break;
          case "destination":
            setDestination(closestNode);
            setSelectionMode("none");
            break;
          default:
            break;
        }
      } else if (data.type === "obstacleClick") {
        // Find the obstacle in obstaclesDb and set it as selected
        const clickedObstacle =
          obstaclesDb.find((obs) => obs.id === data.obstacleId) ||
          obstaclesDb[data.obstacleId]; // fallback to index
        if (clickedObstacle) {
          setSelectedObstacle(clickedObstacle);
        }
      } else if (data.type === "userInteractionStart") {
        isUserInteracting.current = true;
      } else if (data.type === "userInteractionEnd") {
        isUserInteracting.current = false;
      }
    } catch (error) {
      console.error("Error parsing WebView message:", error);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <WebView
        ref={webViewRef}
        source={{ html: mapHTML }}
        style={{ flex: 1 }}
        onMessage={handleWebViewMessage}
        onLoad={() => {
          // Force initial data load when WebView is ready
          setTimeout(() => {
            updateMapData(true);
          }, 500);
        }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
        bounces={false}
        scrollEnabled={false}
      />
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
