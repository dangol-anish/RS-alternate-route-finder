import { useAuthStore } from "@/lib/useAuthStore";
import { useMapStore } from "@/lib/useMapStore";
import { themeColors } from "@/app/styles/colors";
import { getSeverityColor } from "@/app/utils/obstacleUtils";
import { truncateText } from "@/app/utils/truncateText";
import { Entypo, MaterialIcons, Ionicons } from "@expo/vector-icons";
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
  ActivityIndicator,
  Easing,
} from "react-native";
import { PanGestureHandler, State } from "react-native-gesture-handler";
import {
  deleteObstacle,
  getObstacleVerifications,
  verifyObstacle,
} from "@/app/utils/api";
import Toast from "react-native-toast-message";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height;
const PANEL_HEIGHT = SCREEN_HEIGHT * 0.95; // 95% of screen height

const ObstacleDetailsPanel = () => {
  const selectedObstacle = useMapStore((state) => state.selectedObstacle);
  const setSelectedObstacle = useMapStore((state) => state.setSelectedObstacle);
  const user = useAuthStore((state) => state.user);

  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
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
  const [isDragging, setIsDragging] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const dragY = useRef(new Animated.Value(0)).current;

  const isOwner = selectedObstacle?.owner === user?.id;
  const isAdmin = user?.role === "admin";
  const isAdminVerified = selectedObstacle?.admin_verified;
  const isExpired = status === "expired";

  useEffect(() => {
    if (selectedObstacle) {
      setVisible(true);

      // Animate backdrop fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();

      // Animate panel slide up
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT - PANEL_HEIGHT,
        duration: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();

      setVerifyCount(selectedObstacle.verify_count);
      setDisputeCount(selectedObstacle.dispute_count);
      setStatus(selectedObstacle.status);
      // Fetch user's current vote for this obstacle
      (async () => {
        if (user && selectedObstacle.id) {
          try {
            const data = await getObstacleVerifications(
              selectedObstacle.id,
              user.id
            );
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
    // Animate backdrop fade out
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 250,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start();

    // Animate panel slide down
    Animated.timing(slideAnim, {
      toValue: SCREEN_HEIGHT,
      duration: 350,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: false,
    }).start(() => {
      setVisible(false);
      setSelectedObstacle(null);
    });
  };

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationY: dragY } }],
    { useNativeDriver: false }
  );

  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.state === State.BEGAN) {
      setIsDragging(true);
    } else if (event.nativeEvent.state === State.END) {
      setIsDragging(false);
      const { translationY } = event.nativeEvent;

      if (translationY > 100) {
        // Swipe down more than 100px - close the modal
        handleClose();
      } else {
        // Snap back to original position with spring animation
        Animated.spring(dragY, {
          toValue: 0,
          useNativeDriver: false,
          tension: 100,
          friction: 8,
        }).start();
      }
    }
  };

  const animatedStyle = {
    transform: [
      {
        translateY: Animated.add(slideAnim, dragY),
      },
    ],
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
    <View style={styles.overlay}>
      <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
        <TouchableOpacity
          style={styles.backdropTouchable}
          onPress={handleClose}
        />
      </Animated.View>
      <Animated.View style={[styles.panel, animatedStyle]}>
        <PanGestureHandler
          onGestureEvent={onGestureEvent}
          onHandlerStateChange={onHandlerStateChange}
        >
          <Animated.View style={styles.dragHandle}>
            <View style={styles.handleBar}>
              <View style={styles.handle} />
            </View>
          </Animated.View>
        </PanGestureHandler>
        {selectedObstacle && (
          <>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerContent}>
                <Text
                  style={styles.headerTitle}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {selectedObstacle.name}
                </Text>
                <Text style={styles.headerSubtitle}>
                  {selectedObstacle.type}
                </Text>
                <View style={styles.headerBadges}>
                  <View
                    style={[
                      styles.headerBadge,
                      {
                        backgroundColor: getSeverityColor(
                          selectedObstacle.severity
                        ),
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.headerBadgeText,
                        {
                          color:
                            selectedObstacle.severity === "Low" ||
                            selectedObstacle.severity === "Moderate"
                              ? "black"
                              : "white",
                        },
                      ]}
                    >
                      {selectedObstacle.severity}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.headerBadge,
                      {
                        backgroundColor: isExpired
                          ? themeColors.red
                          : themeColors.green,
                      },
                    ]}
                  >
                    <Text style={styles.headerBadgeText}>
                      {getRemainingTime()}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.headerBadge,
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
                    <Text style={[styles.headerBadgeText, { color: "white" }]}>
                      {status === "verified"
                        ? "Verified"
                        : status === "flagged"
                        ? "Flagged"
                        : "Unverified"}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <ScrollView
              style={styles.content}
              showsVerticalScrollIndicator={false}
            >
              {/* Image Section */}
              <View style={styles.imageSection}>
                {selectedObstacle.image_url ? (
                  <View style={styles.imageContainer}>
                    {imageLoading && (
                      <View style={styles.imageLoadingContainer}>
                        <ActivityIndicator
                          size="large"
                          color={themeColors.green}
                        />
                        <Text style={styles.imageLoadingText}>
                          Loading image...
                        </Text>
                      </View>
                    )}
                    <Image
                      source={{ uri: selectedObstacle.image_url }}
                      style={[
                        styles.image,
                        imageLoading && styles.imageLoading,
                        imageError && styles.imageError,
                      ]}
                      resizeMode="cover"
                      onLoadStart={() => {
                        setImageLoading(true);
                        setImageError(false);
                      }}
                      onLoadEnd={() => {
                        setImageLoading(false);
                      }}
                      onError={() => {
                        setImageLoading(false);
                        setImageError(true);
                      }}
                    />
                    {imageError && (
                      <View style={styles.imageErrorContainer}>
                        <MaterialIcons
                          name="error-outline"
                          size={48}
                          color={themeColors.red}
                        />
                        <Text style={styles.imageErrorText}>
                          Failed to load image
                        </Text>
                      </View>
                    )}
                  </View>
                ) : (
                  <View style={styles.noImage}>
                    <MaterialIcons
                      name="image"
                      size={48}
                      color={themeColors.gray}
                    />
                    <Text style={styles.noImageText}>No Image Available</Text>
                  </View>
                )}
              </View>

              {/* Content Cards */}
              <View style={styles.contentCards}>
                {/* Report Info Card */}
                <View style={styles.card}>
                  <View style={styles.reportInfoSection}>
                    <View style={styles.reportInfoLeft}>
                      <Text style={styles.ownerText}>
                        Reported by: {selectedObstacle.profiles.full_name}
                      </Text>
                      <Text style={styles.timeText}>
                        Report Time:{" "}
                        {new Date(selectedObstacle.created_at).toLocaleString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </Text>
                    </View>
                    {isOwner && (
                      <TouchableOpacity
                        style={styles.deleteButton}
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
                          size={24}
                          color={themeColors.red}
                        />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                {/* Verification Stats Card */}
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>Community Verification</Text>
                  <View style={styles.verificationStats}>
                    <View style={styles.statItem}>
                      <MaterialIcons
                        name="check-circle"
                        size={24}
                        color={themeColors.green}
                      />
                      <Text style={styles.statNumber}>{verifyCount ?? 0}</Text>
                      <Text style={styles.statLabel}>Verified</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                      <MaterialIcons
                        name="dangerous"
                        size={24}
                        color={themeColors.red}
                      />
                      <Text style={styles.statNumber}>{disputeCount ?? 0}</Text>
                      <Text style={styles.statLabel}>Disputed</Text>
                    </View>
                  </View>
                </View>

                {/* Action Buttons Card - Conditional based on user role */}
                {!isOwner &&
                  (user ? (
                    isAdmin ? (
                      // Admin Actions
                      <View style={styles.card}>
                        <Text style={styles.cardTitle}>Admin Moderation</Text>
                        <View style={styles.actionButtons}>
                          <TouchableOpacity
                            style={[styles.actionButton, styles.approveButton]}
                            onPress={async () => {
                              try {
                                await require("@/app/utils/api").performAdminAction(
                                  user.id,
                                  selectedObstacle.id,
                                  "approve"
                                );
                                Toast.show({
                                  type: "success",
                                  text1: "Obstacle approved",
                                });
                                handleClose();
                              } catch (e) {
                                Toast.show({
                                  type: "error",
                                  text1: "Admin action failed",
                                  text2:
                                    (e as any).message ||
                                    "Failed to approve obstacle",
                                });
                              }
                            }}
                          >
                            <MaterialIcons
                              name="check-circle"
                              size={20}
                              color="white"
                            />
                            <Text style={styles.actionButtonText}>Approve</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.actionButton, styles.removeButton]}
                            onPress={async () => {
                              try {
                                await require("@/app/utils/api").performAdminAction(
                                  user.id,
                                  selectedObstacle.id,
                                  "remove"
                                );
                                Toast.show({
                                  type: "success",
                                  text1: "Obstacle removed",
                                });
                                handleClose();
                              } catch (e) {
                                Toast.show({
                                  type: "error",
                                  text1: "Admin action failed",
                                  text2:
                                    (e as any).message ||
                                    "Failed to remove obstacle",
                                });
                              }
                            }}
                          >
                            <MaterialIcons
                              name="delete"
                              size={20}
                              color="white"
                            />
                            <Text style={styles.actionButtonText}>Remove</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ) : (
                      // Regular User Actions (only if not admin-verified)
                      <View style={styles.card}>
                        <Text style={styles.cardTitle}>
                          Verify This Obstacle
                        </Text>
                        <View style={styles.actionButtons}>
                          <TouchableOpacity
                            style={[
                              styles.actionButton,
                              styles.verifyButton,
                              userVote === "verify" && styles.activeButton,
                              (verifying || onCooldown) &&
                                styles.disabledButton,
                            ]}
                            onPress={() => handleVerification("verify")}
                            disabled={
                              verifying || onCooldown || userVote === "verify"
                            }
                          >
                            <MaterialIcons
                              name="check-circle"
                              size={20}
                              color="white"
                            />
                            <Text style={styles.actionButtonText}>Verify</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[
                              styles.actionButton,
                              styles.disputeButton,
                              userVote === "dispute" && styles.activeButton,
                              (verifying || onCooldown) &&
                                styles.disabledButton,
                            ]}
                            onPress={() => handleVerification("dispute")}
                            disabled={
                              verifying || onCooldown || userVote === "dispute"
                            }
                          >
                            <MaterialIcons
                              name="dangerous"
                              size={20}
                              color="white"
                            />
                            <Text style={styles.actionButtonText}>Dispute</Text>
                          </TouchableOpacity>
                        </View>
                        {reputationWeight > 1 && (
                          <Text style={styles.reputationText}>
                            Your votes count as {reputationWeight} based on your
                            reputation!
                          </Text>
                        )}
                      </View>
                    )
                  ) : (
                    <Text style={styles.loginMessage}>
                      You need to log in to vote on this obstacle.
                    </Text>
                  ))}

                {/* Comments Card */}
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>Comments</Text>
                  <View style={styles.commentsContainer}>
                    <Text style={styles.commentsText}>
                      {selectedObstacle.comments || "No comments added"}
                    </Text>
                  </View>
                </View>
              </View>
            </ScrollView>
          </>
        )}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  backdropTouchable: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  panel: {
    position: "absolute",
    top: SCREEN_HEIGHT - PANEL_HEIGHT,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "white",
    zIndex: 100,
    elevation: 10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  handleBar: {
    height: 4,
    width: 40,
    borderRadius: 2,
    backgroundColor: themeColors.gray,
    alignSelf: "center",
    marginTop: 8,
  },
  handle: {
    height: 4,
    width: "100%",
    borderRadius: 2,
    backgroundColor: themeColors.gray,
  },
  dragHandle: {
    paddingVertical: 8,
    alignItems: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "transparent",
    paddingVertical: 0,
    paddingHorizontal: 0,
    paddingTop: 0,
    marginTop: 0,
  },
  headerContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: themeColors.gray,
    marginBottom: 8,
  },
  closeButton: {
    padding: 8,
    paddingRight: 20,
    opacity: 0.7,
  },
  imageSection: {},
  imageContainer: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: themeColors.off_white,
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 12,
  },
  imageLoading: {
    opacity: 0.3,
  },
  imageError: {
    opacity: 0.1,
  },
  imageLoadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: themeColors.off_white,
    zIndex: 1,
  },
  imageLoadingText: {
    marginTop: 8,
    color: themeColors.gray,
    fontSize: 14,
  },
  imageErrorContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: themeColors.off_white,
    zIndex: 1,
  },
  imageErrorText: {
    marginTop: 8,
    color: themeColors.red,
    fontSize: 14,
    textAlign: "center",
  },
  noImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: themeColors.off_white,
  },
  noImageText: {
    textAlign: "center",
    color: themeColors.gray,
    fontSize: 16,
    marginTop: 8,
  },
  contentCards: {
    flex: 1,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 8,
    paddingVertical: 0,
    marginBottom: 0,
    marginTop: 15,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  obstacleName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  obstacleType: {
    fontSize: 16,
    color: themeColors.gray,
  },
  statusRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 8,
  },
  statusBadge: {
    paddingVertical: 1,
    paddingHorizontal: 6,
    borderRadius: 12,
    alignSelf: "flex-start",
    opacity: 0.8,
  },
  statusBadgeText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 15,
    textAlign: "center",
  },
  ownerInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  ownerText: {
    color: themeColors.gray,
    fontSize: 14,
  },
  timeText: {
    color: themeColors.gray,
    fontSize: 14,
  },
  verificationStats: {
    flexDirection: "row",
    gap: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  statItem: {
    flexDirection: "column",
    alignItems: "center",
  },
  statDivider: {
    width: 1,
    height: "100%",
    backgroundColor: themeColors.gray,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statLabel: {
    color: themeColors.gray,
    fontSize: 12,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 16,
    justifyContent: "center",
  },
  actionButton: {
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
  actionButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
    marginLeft: 8,
  },
  approveButton: {
    backgroundColor: themeColors.green,
  },
  removeButton: {
    backgroundColor: themeColors.red,
  },
  verifyButton: {
    backgroundColor: themeColors.green,
  },
  disputeButton: {
    backgroundColor: themeColors.red,
  },
  activeButton: {
    backgroundColor: themeColors.green,
  },
  disabledButton: {
    opacity: 0.5,
  },
  reputationText: {
    color: themeColors.green,
    fontSize: 11,
    textAlign: "center",
    marginTop: 8,
    fontWeight: "bold",
  },
  adminVerifiedStatus: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 12,
  },
  adminVerifiedText: {
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 8,
  },
  commentsContainer: {
    flex: 1,
    minHeight: 100,
    justifyContent: "flex-start",
    backgroundColor: themeColors.off_white,
    borderRadius: 12,
  },
  commentsText: {
    padding: 8,
    flexGrow: 1,
    flex: 1,
  },
  headerBadges: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 15,
  },
  headerBadge: {
    paddingVertical: 1,
    paddingHorizontal: 6,
    borderRadius: 12,
    alignSelf: "flex-start",
    opacity: 0.8,
  },
  headerBadgeText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 12,
    textAlign: "center",
  },
  reportInfoSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  reportInfoLeft: {
    flexDirection: "column",
  },
  deleteButton: {
    padding: 5,
  },
  loginMessage: {
    color: themeColors.gray,
    fontSize: 14,
    textAlign: "center",
    marginTop: 12,
  },
});

export default ObstacleDetailsPanel;
