import React from "react";
import { Modal, View, Text, Button, StyleSheet } from "react-native";
import { useMapStore } from "@/app/store/useMapStore";

const ObstacleDetailsModal = () => {
  const selectedObstacle = useMapStore((state) => state.selectedObstacle);
  const setSelectedObstacle = useMapStore((state) => state.setSelectedObstacle);

  if (!selectedObstacle) return null;

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
