import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  SafeAreaView,
  TouchableOpacity,
  ListRenderItem,
} from "react-native";
import { themeColors } from "@/app/styles/colors";
import { useObstacles } from "@/app/hooks/useObstacles";
import { Obstacle } from "@/app/types/obstacle";
import { useAuthStore } from "@/app/store/useAuthStore";

const Roadblock: React.FC = () => {
  const { obstaclesDb } = useObstacles();
  const user = useAuthStore((state) => state.user);
  const [activeTab, setActiveTab] = useState<"all" | "mine">("all");

  const filteredObstacles =
    activeTab === "all"
      ? obstaclesDb
      : user
      ? obstaclesDb.filter((item) => item.owner === user.id)
      : [];

  const renderItem: ListRenderItem<Obstacle> = ({ item }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.image_url }} style={styles.image} />
      <View style={styles.cardContent}>
        <Text style={styles.title}>{item.name}</Text>
        <Text style={styles.subtitle}>{item.type.toUpperCase()}</Text>
        <Text style={styles.description}>{item.comments}</Text>
        <Text style={styles.info}>
          Severity: {item.severity} | Duration: {item.expected_duration}
        </Text>
        <Text>{item.owner}</Text>
        <Text style={styles.location}>
          Location: ({item.latitude}, {item.longitude})
        </Text>
      </View>
    </View>
  );

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

      {/* No user message */}
      {activeTab === "mine" && !user && (
        <Text style={styles.loginMessage}>
          Please log in to view your obstacles.
        </Text>
      )}

      {/* Obstacle List */}
      <FlatList
        data={filteredObstacles}
        keyExtractor={(item) => item.id.toString()}
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
  },
  headerMenu: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 10,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 2,
    borderColor: "transparent",
    marginHorizontal: 10,
  },
  activeTab: {
    borderColor: themeColors.red,
  },
  tabText: {
    fontSize: 16,
    color: themeColors.gray,
  },
  activeTabText: {
    fontWeight: "bold",
    color: themeColors.gray,
  },
  loginMessage: {
    textAlign: "center",
    marginVertical: 10,
    color: "red",
    fontSize: 14,
  },
  emptyMessage: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 14,
    color: themeColors.gray,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: themeColors.gray,
    borderRadius: 10,
    marginBottom: 15,
    overflow: "hidden",
    flexDirection: "row",
  },
  image: {
    width: 100,
    height: 100,
  },
  cardContent: {
    flex: 1,
    padding: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
  subtitle: {
    fontSize: 14,
    color: themeColors.gray,
  },
  description: {
    marginTop: 4,
    fontSize: 14,
  },
  info: {
    fontSize: 12,
    color: themeColors.gray,
    marginTop: 4,
  },
  location: {
    fontSize: 12,
    color: themeColors.gray,
    marginTop: 2,
  },
});
