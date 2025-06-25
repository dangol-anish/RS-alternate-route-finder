import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Alert } from "react-native";
import { supabase } from "@/lib/supabase"; // adjust path as needed
import { useMapStore } from "../store/useMapStore";
import { Timestamp } from "react-native-reanimated/lib/typescript/commonTypes";
import { Obstacle } from "@/app/types/obstacle";

export const useObstacles = () => {
  console.log("useObstacles hook initialized");
  const [obstaclesDb, setObstaclesDb] = useState<Obstacle[]>([]);
  const [loading, setLoading] = useState(true);
  const obstaclesRef = useRef<Obstacle[]>([]);
  const { setObstacles } = useMapStore();

  const fetchObstacles = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:5000/get_obstacles`
      );

      const parsedData =
        typeof response.data === "string"
          ? JSON.parse(response.data)
          : response.data;

      if (!Array.isArray(parsedData)) throw new Error("Invalid obstacle data");

      // Fetch verification/dispute counts for each obstacle
      const obstaclesWithCounts = await Promise.all(
        parsedData.map(async (obstacle: Obstacle) => {
          try {
            const countsRes = await axios.get(
              `http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:5000/obstacle/verifications/${obstacle.id}`
            );
            return {
              ...obstacle,
              verify_count: countsRes.data.verify_count,
              dispute_count: countsRes.data.dispute_count,
              status: countsRes.data.status,
            };
          } catch (e) {
            return { ...obstacle };
          }
        })
      );

      obstaclesRef.current = obstaclesWithCounts;
      setObstaclesDb(obstaclesWithCounts);

      // Also update store with obstacle IDs (as Set<string>)
      const obstacleIds = new Set(
        obstaclesWithCounts.map((o: Obstacle) => o.id)
      );
      setObstacles(obstacleIds);
    } catch (error: any) {
      console.log(error);
      Alert.alert(
        "Error",
        `Failed to load obstacles: ${error.message || "Unknown error"}`
      );
    } finally {
      setLoading(false);
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

  return { obstaclesDb, obstaclesRef, loading };
};
