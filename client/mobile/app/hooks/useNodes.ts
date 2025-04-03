import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { GeoJSONFeature } from "../types/geoJSON";
import { Alert } from "react-native";

export const useNodes = () => {
  const [nodes, setNodes] = useState<GeoJSONFeature[]>([]);
  const nodesRef = useRef<GeoJSONFeature[]>([]);

  useEffect(() => {
    const fetchNodes = async () => {
      try {
        const response = await axios.get(
          `http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:5000/nodes`
        );
        const parsedData =
          typeof response.data === "string"
            ? JSON.parse(response.data)
            : response.data;

        if (!parsedData.features) throw new Error("Invalid GeoJSON format");

        nodesRef.current = parsedData.features;
        setNodes(parsedData.features);
      } catch (error: any) {
        Alert.alert(
          "Error",
          `Failed to load nodes: ${error.message || "Unknown error"}`
        );
      }
    };

    fetchNodes();
  }, []);

  return { nodes, nodesRef };
};
