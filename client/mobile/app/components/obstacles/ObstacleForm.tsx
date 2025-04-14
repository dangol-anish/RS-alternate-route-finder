import React, { useState } from "react";
import { Modal, View, Text, TextInput, Button, StyleSheet } from "react-native";

interface ObstacleFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    type: string;
    expected_duration: string;
    severity: string;
    comments?: string;
  }) => void;
}

const ObstacleForm: React.FC<ObstacleFormProps> = ({
  visible,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    expected_duration: "",
    severity: "",
    comments: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    onSubmit(formData);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.container}>
        <View style={styles.form}>
          <Text style={styles.label}>Obstacle Name</Text>
          <TextInput
            style={styles.input}
            onChangeText={(text) => handleChange("name", text)}
          />

          <Text style={styles.label}>Type</Text>
          <TextInput
            style={styles.input}
            onChangeText={(text) => handleChange("type", text)}
          />

          <Text style={styles.label}>Expected Duration (e.g., 01:00:00)</Text>
          <TextInput
            style={styles.input}
            onChangeText={(text) => handleChange("expected_duration", text)}
          />

          <Text style={styles.label}>Severity</Text>
          <TextInput
            style={styles.input}
            onChangeText={(text) => handleChange("severity", text)}
          />

          <Text style={styles.label}>Comments (optional)</Text>
          <TextInput
            style={styles.input}
            onChangeText={(text) => handleChange("comments", text)}
          />

          <Button title="Submit" onPress={handleSubmit} />
          <Button title="Cancel" color="red" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  form: {
    margin: 20,
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
  },
  label: {
    marginTop: 10,
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    marginTop: 5,
    borderRadius: 5,
  },
});

export default ObstacleForm;
