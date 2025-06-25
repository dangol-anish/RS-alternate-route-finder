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
import {
  deleteObstacle,
  getObstacleVerifications,
  verifyObstacle,
} from "@/app/utils/api";
import Toast from "react-native-toast-message";

const SCREEN_WIDTH = Dimensions.get("window").width;
const PANEL_WIDTH = SCREEN_WIDTH;

const ObstacleDetailsPanel = () => {
  const selectedObstacle = useMapStore((state) => state.selectedObstacle);
  const setSelectedObstacle = useMapStore((state) => state.setSelectedObstacle);
  const user = useAuthStore((state) => state.user);

  const slideAnim = useRef(new Animated.Value(SCREEN_WIDTH)).current;
  const [visible, setVisible] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifyCount, setVerifyCount] = useState<number | undefined>(undefined);
  const [disputeCount, setDisputeCount] = useState<number | undefined>(
    undefined
  );
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [userVote, setUserVote] = useState<"verify" | "dispute" | null>(null);
  const [onCooldown, setOnCooldown] = useState(false);
  const [reputationWeight, setReputationWeight] = useState(1);

  const isOwner = selectedObstacle?.owner === user?.id;

  useEffect(() => {
    if (selectedObstacle) {
      setVisible(true);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
      setVerifyCount(selectedObstacle.verify_count);
      setDisputeCount(selectedObstacle.dispute_count);
      setStatus(selectedObstacle.status);
      // Fetch user's current vote for this obstacle
      (async () => {
        if (user && selectedObstacle.id) {
          try {
            const data = await getObstacleVerifications(selectedObstacle.id);
            if (data && data.user_action) {
              setUserVote(data.user_action);
            } else {
              setUserVote(null);
            }
          } catch {
            setUserVote(null);
          }
        } else {
          setUserVote(null);
        }
      })();
    }
  }, [selectedObstacle, user]);

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
      await deleteObstacle(selectedObstacle.id, user.id);
      handleClose();
      Alert.alert("Success", "Obstacle deleted.");
    } catch (error: any) {
      console.error("Unexpected error:", error);
      Alert.alert("Error", error.message || "Something went wrong.");
    }
  };

  const handleVerification = async (action: "verify" | "dispute") => {
    if (!selectedObstacle || !user?.id || verifying || isOwner) return;

    setVerifying(true);
    try {
      const data = await verifyObstacle(selectedObstacle.id, user.id, action);

      if (data.success) {
        setVerifyCount(data.verify_count);
        setDisputeCount(data.dispute_count);
        setStatus(data.status);
        setUserVote(action);
        setReputationWeight(data.reputation_weight);
        Toast.show({
          type: "success",
          text1: `Successfully ${action}d obstacle`,
          text2: `Your vote counts as ${data.reputation_weight} based on your reputation!`,
        });
      }
    } catch (error: any) {
      if (error.response?.status === 429) {
        setOnCooldown(true);
        Toast.show({
          type: "error",
          text1: "On cooldown",
          text2: "Please wait before verifying/disputing again",
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: error.response?.data?.error || "Failed to verify obstacle",
        });
      }
    } finally {
      setVerifying(false);
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
                      paddingVertical: 1,
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
                      paddingVertical: 1,
                      paddingHorizontal: 6,
                      borderRadius: 12,
                      alignSelf: "flex-start",
                      opacity: 0.8,
                    }}
                  >
                    {getRemainingTime()}
                  </Text>
                  {/* Status badge */}
                  <Text
                    style={{
                      backgroundColor:
                        status === "verified"
                          ? themeColors.green
                          : status === "flagged"
                          ? themeColors.red
                          : themeColors.gray,
                      color: "white",
                      paddingVertical: 1,
                      paddingHorizontal: 8,
                      borderRadius: 12,
                      alignSelf: "flex-start",
                      opacity: 0.8,
                      fontWeight: "bold",
                      marginLeft: 4,
                    }}
                  >
                    {status === "verified"
                      ? "Verified"
                      : status === "flagged"
                      ? "Flagged"
                      : "Unverified"}
                  </Text>
                </View>
                <Text style={styles.textOwner}>
                  Added by: {selectedObstacle.profiles.full_name} at{" "}
                  {new Date(selectedObstacle.created_at).toLocaleString()}
                </Text>
                {/* Verification/Dispute counts for all users */}
                <View style={styles.countBadgeRowAll}>
                  <View style={styles.countBadgeRow}>
                    <MaterialIcons
                      name="check"
                      size={20}
                      color={themeColors.green}
                      style={{ marginRight: 2 }}
                    />
                    <View style={styles.countBadge}>
                      <Text style={styles.countBadgeText}>
                        {verifyCount ?? 0}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.countBadgeRow}>
                    <MaterialIcons
                      name="close"
                      size={20}
                      color={themeColors.red}
                      style={{ marginRight: 2 }}
                    />
                    <View style={styles.countBadge}>
                      <Text style={styles.countBadgeText}>
                        {disputeCount ?? 0}
                      </Text>
                    </View>
                  </View>
                </View>
                {/* Verification/Dispute UI - only for authenticated non-owners */}
                {!isOwner && user && (
                  <View style={styles.verificationContainer}>
                    <Text style={styles.verificationTitle}>
                      Verify this obstacle:
                    </Text>
                    <View style={styles.verificationButtons}>
                      <TouchableOpacity
                        style={[
                          styles.verifyButton,
                          userVote === "verify" && styles.activeButton,
                          (verifying || onCooldown) && styles.disabledButton,
                        ]}
                        onPress={() => handleVerification("verify")}
                        disabled={
                          verifying || onCooldown || userVote === "verify"
                        }
                      >
                        <MaterialIcons
                          name="check-circle"
                          size={24}
                          color={
                            userVote === "verify" ? "white" : themeColors.green
                          }
                        />
                        <Text style={styles.verifyButtonText}>
                          Verify ({verifyCount || 0})
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.disputeButton,
                          userVote === "dispute" && styles.activeButton,
                          (verifying || onCooldown) && styles.disabledButton,
                        ]}
                        onPress={() => handleVerification("dispute")}
                        disabled={
                          verifying || onCooldown || userVote === "dispute"
                        }
                      >
                        <MaterialIcons
                          name="dangerous"
                          size={24}
                          color={
                            userVote === "dispute" ? "white" : themeColors.red
                          }
                        />
                        <Text style={styles.disputeButtonText}>
                          Dispute ({disputeCount || 0})
                        </Text>
                      </TouchableOpacity>
                    </View>
                    {reputationWeight > 1 && (
                      <Text style={styles.reputationText}>
                        Your votes count as {reputationWeight} based on your
                        reputation!
                      </Text>
                    )}
                  </View>
                )}
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
  verificationContainer: {
    marginVertical: 12,
  },
  verificationTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  verificationButtons: {
    flexDirection: "row",
    gap: 16,
  },
  verifyButton: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginHorizontal: 4,
    minWidth: 110,
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  activeButton: {
    backgroundColor: themeColors.green,
  },
  disabledButton: {
    opacity: 0.5,
  },
  verifyButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    marginRight: 8,
  },
  disputeButton: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginHorizontal: 4,
    minWidth: 110,
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  disputeButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    marginRight: 8,
  },
  reputationText: {
    color: themeColors.green,
    fontSize: 12,
    textAlign: "center",
    marginTop: 4,
    fontWeight: "bold",
  },
  countBadge: {
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 2,
    minWidth: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  countBadgeText: {
    color: themeColors.gray,
    fontWeight: "bold",
    fontSize: 15,
    textAlign: "center",
  },
  countBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 4,
  },
  countBadgeRowAll: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 4,
    gap: 16,
  },
});

export default ObstacleDetailsPanel;
