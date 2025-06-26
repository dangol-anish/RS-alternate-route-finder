import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  ListRenderItem,
  ActivityIndicator,
} from "react-native";
import { themeColors } from "@/app/styles/colors";
import { useObstacles } from "@/app/hooks/useObstacles";
import { Obstacle } from "@/app/types/obstacle";
import { useAuthStore } from "@/app/store/useAuthStore";
import { getSeverityColor } from "@/app/utils/obstacleUtils";
import { truncateText } from "@/app/utils/truncateText";
import { AntDesign } from "@expo/vector-icons";
import { useMapStore } from "@/app/store/useMapStore";
import { useRouter } from "expo-router";

const Roadblock: React.FC = () => {
  const setSelectedObstacleCoord = useMapStore(
    (state) => state.setSelectedObstacleCoord
  );
  const router = useRouter();

  const { obstaclesDb, loading } = useObstacles();
  const user = useAuthStore((state) => state.user);
  const [activeTab, setActiveTab] = useState<"all" | "mine">("all");

  const getRemainingTime = (
    createdAtRaw: string | number,
    expectedDuration: string
  ): string => {
    const createdAt = new Date(createdAtRaw);
    const [hoursStr, minutesStr, secondsStr] = expectedDuration.split(":");
    const hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr, 10);
    const seconds = parseInt(secondsStr, 10);

    const expectedEnd = new Date(createdAt);
    expectedEnd.setHours(createdAt.getHours() + hours);
    expectedEnd.setMinutes(createdAt.getMinutes() + minutes);
    expectedEnd.setSeconds(createdAt.getSeconds() + seconds);

    const now = new Date();
    const diffMs = expectedEnd.getTime() - now.getTime();
    if (diffMs <= 0) return "Expired";

    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    return `${diffHours}h ${diffMinutes}m remaining`;
  };

  const filteredObstacles = (
    activeTab === "all"
      ? obstaclesDb
      : user
      ? obstaclesDb.filter((item) => item.owner === user.id)
      : []
  ).sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const renderItem: ListRenderItem<Obstacle> = ({ item }) => {
    const remainingTime = getRemainingTime(
      item.created_at,
      item.expected_duration
    );
    const status = item.status;
    return (
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardTitle}>{truncateText(item.name, 20)}</Text>
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => {
              setSelectedObstacleCoord(null);
              setTimeout(() => {
                setSelectedObstacleCoord({
                  latitude: item.latitude,
                  longitude: item.longitude,
                });
                router.replace("/");
              }, 0);
            }}
          >
            <AntDesign name="eyeo" size={22} color={themeColors.brown} />
          </TouchableOpacity>
        </View>
        <Text style={styles.cardSubtitle}>{item.type}</Text>
        <View style={styles.badgeRow}>
          <View
            style={[
              styles.badge,
              { backgroundColor: getSeverityColor(item.severity) },
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                {
                  color: ["Low", "Moderate"].includes(item.severity)
                    ? "black"
                    : "white",
                },
              ]}
            >
              {item.severity}
            </Text>
          </View>
          <View
            style={[styles.badge, { backgroundColor: themeColors.light_green }]}
          >
            <Text style={[styles.badgeText, { color: "black" }]}>
              {remainingTime}
            </Text>
          </View>
          <View
            style={[
              styles.badge,
              {
                backgroundColor:
                  status === "verified"
                    ? themeColors.green
                    : status === "flagged"
                    ? themeColors.red
                    : themeColors.brown,
              },
            ]}
          >
            <Text style={[styles.badgeText, { color: "white" }]}>
              {status === "verified"
                ? "Verified"
                : status === "flagged"
                ? "Flagged"
                : "Unverified"}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerMenu}>
        <Text style={styles.headerText}>Roadblocks</Text>
      </View>

      {/* Toggle Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === "all" && styles.tabBtnActive]}
          onPress={() => setActiveTab("all")}
        >
          <Text
            style={[
              styles.tabBtnText,
              activeTab === "all" && styles.tabBtnTextActive,
            ]}
          >
            All Obstacles
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === "mine" && styles.tabBtnActive]}
          onPress={() => setActiveTab("mine")}
        >
          <Text
            style={[
              styles.tabBtnText,
              activeTab === "mine" && styles.tabBtnTextActive,
            ]}
          >
            My Obstacles
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === "mine" && !user && (
        <Text style={styles.loginMessage}>
          Please log in to view your obstacles.
        </Text>
      )}

      {loading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color={themeColors.green} />
        </View>
      ) : (
        <FlatList
          data={filteredObstacles}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            activeTab === "mine" && user ? (
              <Text style={styles.emptyMessage}>
                No obstacles created by you.
              </Text>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
};

export default Roadblock;

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: themeColors.off_white,
    paddingTop: 30,
    zIndex: 100,
    paddingHorizontal: 20,
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
  tabBar: {
    flexDirection: "row",
    backgroundColor: themeColors.off_white,
    borderRadius: 50,
    marginBottom: 18,
    marginHorizontal: 0,
    alignSelf: "center",
    padding: 4,
    gap: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  tabBtn: {
    paddingVertical: 10,
    paddingHorizontal: 28,
    borderRadius: 50,
    backgroundColor: "transparent",
  },
  tabBtnActive: {
    backgroundColor: themeColors.green,
    shadowColor: themeColors.green,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
  },
  tabBtnText: {
    fontSize: 15,
    color: themeColors.brown,
    fontWeight: "500",
  },
  tabBtnTextActive: {
    color: "white",
    fontWeight: "bold",
  },
  loginMessage: {
    textAlign: "center",
    marginVertical: 10,
    color: themeColors.brown,
    fontSize: 16,
  },
  emptyMessage: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 14,
    color: themeColors.gray,
  },
  listContent: {
    paddingBottom: 100,
  },
  card: {
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
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: themeColors.brown,
    flex: 1,
  },
  cardSubtitle: {
    fontSize: 13,
    color: themeColors.gray,
    marginBottom: 8,
    fontWeight: "500",
  },
  eyeButton: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: themeColors.off_white,
    marginLeft: 8,
  },
  badgeRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 2,
  },
  badge: {
    paddingVertical: 2,
    paddingHorizontal: 10,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginRight: 6,
    minWidth: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    fontWeight: "bold",
    fontSize: 12,
    textAlign: "center",
  },
});
