import { useAuthStore } from "@/app/store/useAuthStore";
import { useMapStore } from "@/app/store/useMapStore";
import { themeColors } from "@/app/styles/colors";
import { getSeverityColor } from "@/app/utils/obstacleUtils";
import { truncateText } from "@/app/utils/truncateText";
import { Entypo, MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const SCREEN_WIDTH = Dimensions.get("window").width;
const PANEL_WIDTH = SCREEN_WIDTH;

const ObstacleDetailsPanel = () => {
  const selectedObstacle = useMapStore((state) => state.selectedObstacle);
  const setSelectedObstacle = useMapStore((state) => state.setSelectedObstacle);
  const user = useAuthStore((state) => state.user);

  const slideAnim = useRef(new Animated.Value(SCREEN_WIDTH)).current;
  const [visible, setVisible] = useState(false);

  const isOwner = selectedObstacle?.owner === user?.id;

  useEffect(() => {
    if (selectedObstacle) {
      setVisible(true);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [selectedObstacle]);

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: SCREEN_WIDTH,
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      setVisible(false);
      setSelectedObstacle(null);
    });
  };

  // ======== Calculation of remaining expected time ========
  const getRemainingTime = () => {
    if (!selectedObstacle?.expected_duration || !selectedObstacle?.created_at)
      return null;

    // Parse created_at timestamp
    const createdAt = new Date(selectedObstacle.created_at);

    // Parse expected_duration (interval format "HH:mm:ss")
    const [hoursStr, minutesStr, secondsStr] =
      selectedObstacle.expected_duration.split(":");
    const hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr, 10);
    const seconds = parseInt(secondsStr, 10);

    // Compute expected end time
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

  const handleDelete = async () => {
    if (!selectedObstacle || !user?.id) return;

    try {
      const response = await fetch(
        `http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:5000/delete_obstacle`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: selectedObstacle.id,
            owner: user.id,
          }),
        }
      );

      const result = await response.json();

      if (response.ok) {
        handleClose();
        Alert.alert("Success", "Obstacle deleted.");
      } else {
        console.warn("Delete failed:", result);
        Alert.alert("Error", result.error || "Failed to delete obstacle.");
      }
    } catch (error: any) {
      console.error("Unexpected error:", error);
      Alert.alert("Error", error.message || "Something went wrong.");
    }
  };

  if (!visible) return null;

  return (
    <Animated.View style={[styles.panel, { left: slideAnim }]}>
      <View style={styles.content}>
        {selectedObstacle && (
          <>
            <View style={styles.scrollableContent}>
              <View style={styles.header}>
                <Entypo
                  name="cross"
                  size={28}
                  color="black"
                  onPress={handleClose}
                />
              </View>

              {selectedObstacle.image_url ? (
                <Image
                  source={{ uri: selectedObstacle.image_url }}
                  style={styles.image}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.noImage}>
                  <Text style={styles.noImageText}>No Images Found</Text>
                </View>
              )}
              <View style={styles.fullTextView}>
                {/* Title Text View */}
                <View style={styles.titleTextView}>
                  <View style={styles.titleText}>
                    <Text style={styles.textSmall}>
                      {selectedObstacle.type}
                    </Text>
                    <Text style={styles.title}>
                      {truncateText(selectedObstacle.name, 20)}
                    </Text>
                  </View>
                  {isOwner && (
                    <View style={styles.deleteBtnView}>
                      <TouchableOpacity
                        style={styles.deleteBtn}
                        onPress={() =>
                          Alert.alert("Confirm", "Are you sure?", [
                            { text: "Cancel", style: "cancel" },
                            {
                              text: "Delete",
                              style: "destructive",
                              onPress: handleDelete,
                            },
                          ])
                        }
                      >
                        <MaterialIcons
                          name="delete"
                          size={32}
                          color={themeColors.red}
                        />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
                {/* Tag View */}
                <View style={styles.tagView}>
                  <Text
                    style={{
                      backgroundColor: getSeverityColor(
                        selectedObstacle.severity
                      ),
                      paddingVertical: 3,
                      paddingHorizontal: 6,
                      borderRadius: 12,
                      alignSelf: "flex-start",
                      opacity: 0.8,
                    }}
                  >
                    {selectedObstacle.severity}
                  </Text>
                  <Text
                    style={{
                      backgroundColor: themeColors.light_green,
                      paddingVertical: 3,
                      paddingHorizontal: 6,
                      borderRadius: 12,
                      alignSelf: "flex-start",
                      opacity: 0.8,
                    }}
                  >
                    {getRemainingTime()}
                  </Text>
                </View>
                <Text style={styles.textOwner}>
                  Added by: {selectedObstacle.profiles.full_name} at{" "}
                  {new Date(selectedObstacle.created_at).toLocaleString()}
                </Text>
                <ScrollView
                  style={styles.commentsContainer}
                  contentContainerStyle={styles.commentsContent}
                  showsVerticalScrollIndicator={true}
                >
                  <Text>
                    {selectedObstacle.comments || "No Comments Added"}
                  </Text>
                </ScrollView>
              </View>
            </View>
          </>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  panel: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: PANEL_WIDTH,
    backgroundColor: "white",
    zIndex: 100,
    elevation: 10,
  },
  content: {
    flex: 1,
    padding: 20,
    marginTop: 20,
    justifyContent: "space-between",
  },
  scrollableContent: {
    flex: 1,
  },
  header: {
    alignItems: "flex-start",
    marginBottom: 10,
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 16,
    marginBottom: 15,
    borderColor: themeColors.gray,
    borderWidth: 1,
  },
  noImage: {
    width: "100%",
    height: 200,
    borderRadius: 16,
    marginBottom: 15,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  noImageText: {
    textAlign: "center",
    color: "#888",
    fontSize: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },

  textSmall: {
    fontSize: 12,
    color: themeColors.gray,
    paddingHorizontal: 1,
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
  titleText: {
    flexDirection: "column",
    gap: 1,
  },

  textOwner: {
    fontStyle: "italic",
    color: themeColors.gray,
    paddingHorizontal: 1,
  },
  fullTextView: {
    flex: 1, // take all available vertical space
    flexDirection: "column",
    gap: 8,
  },
  commentsContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
  },
  commentsContent: {
    padding: 8,
    flexGrow: 1,
  },

  deleteBtnView: {},
  deleteBtn: {},
});

export default ObstacleDetailsPanel;
