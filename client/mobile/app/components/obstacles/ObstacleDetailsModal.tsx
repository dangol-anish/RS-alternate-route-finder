import React from "react";
import { Modal, View, Text, Button, StyleSheet, Alert } from "react-native";
import { useMapStore } from "@/app/store/useMapStore";
import { useAuthStore } from "@/app/store/useAuthStore";

const ObstacleDetailsModal = () => {
  const selectedObstacle = useMapStore((state) => state.selectedObstacle);
  const setSelectedObstacle = useMapStore((state) => state.setSelectedObstacle);
  const user = useAuthStore((state) => state.user);

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

      const result = await response.json(); // <-- try parsing it always

      if (response.ok) {
        Alert.alert("Success", "Obstacle deleted.");
        setSelectedObstacle(null);
        // refresh map or obstacle list here
      } else {
        console.warn("Delete failed:", result); // <-- log full response
        Alert.alert("Error", result.error || "Failed to delete obstacle.");
      }
    } catch (error: any) {
      console.error("Unexpected error:", error); // <-- catch unknown errors
      Alert.alert("Error", error.message || "Something went wrong.");
    }
  };

  if (!selectedObstacle) return null;

  const isOwner = selectedObstacle.owner === user?.id;

  return (
    <Modal
      visible={!!selectedObstacle}
      transparent
      animationType="slide"
      onRequestClose={() => setSelectedObstacle(null)}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>{selectedObstacle.name}</Text>
          <Text>Type: {selectedObstacle.type}</Text>
          <Text>Severity: {selectedObstacle.severity}</Text>
          <Text>Duration: {selectedObstacle.expected_duration}</Text>
          <Text>Comments: {selectedObstacle.comments || "None"}</Text>
          <Text>
            Created At: {new Date(selectedObstacle.created_at).toLocaleString()}
          </Text>

          {isOwner && (
            <Button
              title="Delete Obstacle"
              color="red"
              onPress={() =>
                Alert.alert(
                  "Confirm",
                  "Are you sure you want to delete this?",
                  [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Delete",
                      style: "destructive",
                      onPress: handleDelete,
                    },
                  ]
                )
              }
            />
          )}

          <Button title="Close" onPress={() => setSelectedObstacle(null)} />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    width: "85%",
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
    elevation: 10,
    flexDirection: "column",
    gap: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
});

export default ObstacleDetailsModal;
