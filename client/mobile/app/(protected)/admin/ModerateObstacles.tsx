import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";
import { useAuthStore } from "@/app/store/useAuthStore";
import { themeColors } from "@/app/styles/colors";
import { MaterialIcons } from "@expo/vector-icons";
import { getModerationList, performAdminAction } from "@/app/utils/api";
import { Obstacle } from "@/app/types/obstacle";
import SkeletonPlaceholder from "@/app/components/ui/SkeletonPlaceholder";

type AdminAction = "approve" | "remove" | "reset";

const ModerateObstacles = () => {
  const user = useAuthStore((state) => state.user);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState("");

  useEffect(() => {
    if (user?.role === "admin") {
      fetchObstacles();
    }
  }, [user]);

  const fetchObstacles = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const data = await getModerationList(user.id);
      setObstacles(data);
    } catch (e: any) {
      Alert.alert(
        "Error",
        e.message || "Failed to fetch obstacles for moderation."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (obstacleId: string, action: AdminAction) => {
    if (!user?.id) return;

    setActionLoading(obstacleId + action);
    try {
      const result = await performAdminAction(user.id, obstacleId, action);
      Alert.alert("Success", result.message || "Action completed.");
      fetchObstacles(); // Refresh the list
    } catch (e: any) {
      Alert.alert("Error", e.message || "Action failed.");
    } finally {
      setActionLoading("");
    }
  };

  if (user?.role !== "admin") {
    return (
      <View style={styles.centered}>
        <Text>You are not authorized to view this page.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerMenu}>
        <Text style={styles.headerText}>Moderate Obstacles</Text>
      </View>
      {loading ? (
        <View>
          {[...Array(3)].map((_, i) => (
            <View
              key={i}
              style={{
                marginBottom: 16,
                borderRadius: 12,
                padding: 16,
                backgroundColor: "#f9f9f9",
              }}
            >
              <SkeletonPlaceholder width="60%" height={20} />
              <SkeletonPlaceholder width="40%" height={16} />
              <SkeletonPlaceholder width="50%" height={14} />
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginTop: 12,
                }}
              >
                <SkeletonPlaceholder width={90} height={36} borderRadius={8} />
                <SkeletonPlaceholder width={90} height={36} borderRadius={8} />
                <SkeletonPlaceholder width={90} height={36} borderRadius={8} />
              </View>
            </View>
          ))}
        </View>
      ) : (
        <FlatList
          data={obstacles}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.obstacleCard}>
              <Text
                style={styles.cardTitle}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {item.name}
              </Text>
              <Text style={styles.cardType}>
                {item.type} | Status: {item.status}
              </Text>
              <Text style={styles.cardOwner}>
                By: {item.profiles?.full_name || "Unknown"}
              </Text>
              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    { backgroundColor: themeColors.green },
                  ]}
                  onPress={() => handleAction(item.id, "approve")}
                  disabled={actionLoading === item.id + "approve"}
                >
                  <MaterialIcons name="check" size={18} color="white" />
                  <Text style={styles.actionText}>Approve</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    { backgroundColor: themeColors.red },
                  ]}
                  onPress={() => handleAction(item.id, "remove")}
                  disabled={actionLoading === item.id + "remove"}
                >
                  <MaterialIcons name="delete" size={18} color="white" />
                  <Text style={styles.actionText}>Remove</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    { backgroundColor: themeColors.gray },
                  ]}
                  onPress={() => handleAction(item.id, "reset")}
                  disabled={actionLoading === item.id + "reset"}
                >
                  <MaterialIcons name="refresh" size={18} color="white" />
                  <Text style={styles.actionText}>Reset</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No obstacles to moderate.</Text>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeColors.off_white,
    paddingTop: 30,
    paddingHorizontal: 20,
    zIndex: 100,
  },
  headerMenu: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    paddingHorizontal: 0,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  obstacleCard: {
    backgroundColor: "white",
    borderRadius: 14,
    marginBottom: 18,
    padding: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: themeColors.brown,
    flex: 1,
  },
  cardType: { fontSize: 14, color: themeColors.gray, marginBottom: 4 },
  cardOwner: { fontSize: 13, color: themeColors.gray, marginBottom: 8 },
  actionRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginHorizontal: 4,
  },
  actionText: {
    color: "white",
    fontWeight: "bold",
    marginLeft: 6,
    fontSize: 14,
  },
  emptyText: { textAlign: "center", color: themeColors.gray, marginTop: 32 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
});

export default ModerateObstacles;
