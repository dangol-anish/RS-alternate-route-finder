import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Alert } from "react-native";
import { supabase } from "@/lib/supabase"; // adjust path as needed
import { useMapStore } from "../store/useMapStore";
import { Timestamp } from "react-native-reanimated/lib/typescript/commonTypes";
import { Obstacle } from "@/app/types/obstacle";

export const useObstacles = () => {
  const [obstaclesDb, setObstaclesDb] = useState<Obstacle[]>([]);
  const obstaclesRef = useRef<Obstacle[]>([]);
  const { setObstacles } = useMapStore();

  const fetchObstacles = async () => {
    try {
      const response = await axios.get(
        `http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:5000/get_obstacles`
      );

      const parsedData =
        typeof response.data === "string"
          ? JSON.parse(response.data)
          : response.data;

      if (!Array.isArray(parsedData)) throw new Error("Invalid obstacle data");

      obstaclesRef.current = parsedData;
      setObstaclesDb(parsedData);

      // Also update store with obstacle IDs (as Set<string>)
      const obstacleIds = new Set(parsedData.map((o: Obstacle) => o.id));
      setObstacles(obstacleIds);
    } catch (error: any) {
      console.log(error);
      Alert.alert(
        "Error",
        `Failed to load obstacles: ${error.message || "Unknown error"}`
      );
    }
  };

  useEffect(() => {
    fetchObstacles();

    const channel = supabase
      .channel("obstacle-updates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "obstacles",
        },
        (payload) => {
          console.log("🔄 Realtime obstacle update:", payload);
          fetchObstacles();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { obstaclesDb, obstaclesRef };
};
