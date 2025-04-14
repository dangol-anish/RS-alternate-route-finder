import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Alert } from "react-native";

// Define the Obstacle type based on your database schema
type Obstacle = {
  id: string;
  latitude: number;
  longitude: number;
  // Add more fields if needed (e.g., type, description)
};

export const useObstacles = () => {
  const [obstaclesDb, setObstaclesDb] = useState<Obstacle[]>([]);
  const obstaclesRef = useRef<Obstacle[]>([]);

  useEffect(() => {
    const fetchObstacles = async () => {
      try {
        const response = await axios.get(
          `http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:5000/get_obstacles`
        );

        const parsedData =
          typeof response.data === "string"
            ? JSON.parse(response.data)
            : response.data;

        if (!Array.isArray(parsedData))
          throw new Error("Invalid obstacle data");

        obstaclesRef.current = parsedData;
        setObstaclesDb(parsedData);
      } catch (error: any) {
        console.log(error);
        Alert.alert(
          "Error",
          `Failed to load obstacles: ${error.message || "Unknown error"}`
        );
      }
    };

    fetchObstacles();
  }, []);

  return { obstaclesDb, obstaclesRef };
};
