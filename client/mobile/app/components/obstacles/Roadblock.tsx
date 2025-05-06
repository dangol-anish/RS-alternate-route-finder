import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  ListRenderItem,
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

  const { obstaclesDb } = useObstacles();
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

  const filteredObstacles =
    activeTab === "all"
      ? obstaclesDb
      : user
      ? obstaclesDb.filter((item) => item.owner === user.id)
      : [];

  const renderItem: ListRenderItem<Obstacle> = ({ item }) => {
    const remainingTime = getRemainingTime(
      item.created_at,
      item.expected_duration
    );

    return (
      <View style={styles.card}>
        <View style={styles.cardContent}>
          <Text style={styles.subtitle}>{item.type}</Text>
          <Text style={styles.title}>{truncateText(item.name, 20)}</Text>
          <View style={styles.tagView}>
            <Text
              style={{
                backgroundColor: getSeverityColor(item.severity),
                paddingVertical: 1,
                paddingHorizontal: 6,
                borderRadius: 12,
                alignSelf: "flex-start",
                opacity: 0.7,
              }}
            >
              {item.severity}
            </Text>
            <Text
              style={{
                backgroundColor: themeColors.light_green,
                paddingVertical: 1,
                paddingHorizontal: 6,
                borderRadius: 12,
                alignSelf: "flex-start",
                opacity: 0.8,
              }}
            >
              {remainingTime && <Text>{remainingTime}</Text>}
            </Text>
          </View>
        </View>
        <AntDesign
          name="eyeo"
          size={24}
          color="black"
          onPress={() => {
            // Set map target coordinates
            setSelectedObstacleCoord({
              latitude: item.latitude,
              longitude: item.longitude,
            });

            // Navigate to the home screen (index)
            router.replace("/");
          }}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerMenu}>
        <Text style={styles.headerText}>Roadblocks</Text>
      </View>

      {/* Toggle Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "all" && styles.activeTab]}
          onPress={() => setActiveTab("all")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "all" && styles.activeTabText,
            ]}
          >
            All Obstacles
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "mine" && styles.activeTab]}
          onPress={() => setActiveTab("mine")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "mine" && styles.activeTabText,
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

      <FlatList
        data={filteredObstacles}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          activeTab === "mine" && user ? (
            <Text style={styles.emptyMessage}>
              No obstacles created by you.
            </Text>
          ) : null
        }
      />
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
  tabContainer: {
    backgroundColor: themeColors.gray,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 50,
    marginBottom: 15,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 30,
    marginHorizontal: 10,
  },
  activeTab: {
    backgroundColor: themeColors.off_white,
    borderRadius: 50,
    marginVertical: 5,
  },
  tabText: {
    fontSize: 16,
  },
  activeTabText: {
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
    marginBottom: 15,
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: themeColors.gray,
    paddingBottom: 15,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 5,
  },
  cardContent: {
    flex: 1,
    flexDirection: "column",
    gap: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
  subtitle: {
    fontSize: 12,
    color: themeColors.gray,
  },
  info: {
    fontSize: 12,
    color: themeColors.gray,
    marginTop: 4,
  },
  remainingTime: {
    fontStyle: "italic",
    color: themeColors.green || "#007700",
  },
  tagView: {
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 2,
  },
  titleTextView: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 1,
    justifyContent: "space-between",
  },
});
