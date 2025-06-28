import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Alert } from "react-native";
import { supabase } from "@/lib/supabase"; // adjust path as needed
import { useMapStore } from "../store/useMapStore";
import { Timestamp } from "react-native-reanimated/lib/typescript/commonTypes";
import { Obstacle } from "@/app/types/obstacle";
import { getObstacleVerificationsBatch } from "../utils/api";

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

      // Extract obstacle IDs for batch verification fetch
      const obstacleIds = parsedData.map((obstacle: Obstacle) => obstacle.id);

      // Fetch verification counts for all obstacles in a single batch request
      let verificationCounts: Record<
        string,
        { verify_count: number; dispute_count: number; status: string }
      > = {};
      if (obstacleIds.length > 0) {
        try {
          verificationCounts = await getObstacleVerificationsBatch(obstacleIds);
        } catch (e) {
          console.error("Failed to fetch verification counts:", e);
          // Fallback: create empty counts for all obstacles
          verificationCounts = obstacleIds.reduce((acc, id) => {
            acc[id] = {
              verify_count: 0,
              dispute_count: 0,
              status: "unverified",
            };
            return acc;
          }, {} as Record<string, { verify_count: number; dispute_count: number; status: string }>);
        }
      }

      // Merge obstacle data with verification counts
      const obstaclesWithCounts = parsedData.map((obstacle: Obstacle) => {
        const counts = verificationCounts[obstacle.id] || {
          verify_count: 0,
          dispute_count: 0,
          status: "unverified",
        };
        return {
          ...obstacle,
          verify_count: counts.verify_count,
          dispute_count: counts.dispute_count,
          status: counts.status,
        };
      });

      obstaclesRef.current = obstaclesWithCounts;
      setObstaclesDb(obstaclesWithCounts);

      // Also update store with obstacle IDs (as Set<string>)
      const obstacleIdSet = new Set(
        obstaclesWithCounts.map((o: Obstacle) => o.id)
      );
      setObstacles(obstacleIdSet);
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
