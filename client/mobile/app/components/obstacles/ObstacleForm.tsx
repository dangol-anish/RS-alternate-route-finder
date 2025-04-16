import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker"; // Importing the Picker for Expo
import { ObstacleFormProps } from "@/app/types/obstacleForm";

const obstacleTypes: string[] = [
  "Pothole",
  "Accident",
  "Construction",
  "Debris",
  "Flooding",
  "Traffic Jam",
  "Protest",
  "Others",
];

const severityLevels: string[] = ["Low", "Moderate", "High", "Critical"];

const ObstacleForm: React.FC<ObstacleFormProps> = ({
  visible,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    type: "Others",
    expected_duration_hours: "0", // Default to 0 hours
    expected_duration_minutes: "0", // Default to 0 minutes
    severity: "Low",
    comments: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const {
      name,
      type,
      expected_duration_hours,
      expected_duration_minutes,
      severity,
    } = formData;
    if (
      !name ||
      !type ||
      !expected_duration_hours ||
      !expected_duration_minutes ||
      !severity
    ) {
      Alert.alert(
        "Validation Error",
        "All fields except Comments are required."
      );
      return false;
    }
    return true;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      const { expected_duration_hours, expected_duration_minutes } = formData;
      const totalDuration = `${expected_duration_hours}:${expected_duration_minutes}:00`; // Create the "HH:MM:SS" format

      onSubmit({ ...formData, expected_duration: totalDuration });
      onClose();
      setFormData({
        name: "",
        type: "Others",
        expected_duration_hours: "0",
        expected_duration_minutes: "0",
        severity: "Low",
        comments: "",
      });
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.container}>
        <View style={styles.form}>
          <Text style={styles.label}>Obstacle Name</Text>
          <TextInput
            style={styles.input}
            value={formData.name}
            onChangeText={(text) => handleChange("name", text)}
          />

          <Text style={styles.label}>Type</Text>
          <Picker
            selectedValue={formData.type}
            onValueChange={(itemValue) => handleChange("type", itemValue)}
            style={styles.input}
          >
            {obstacleTypes.map((type) => (
              <Picker.Item key={type} label={type} value={type} />
            ))}
          </Picker>

          <Text style={styles.label}>Expected Duration</Text>
          <View style={styles.durationRow}>
            <Text>Hours:</Text>
            <Picker
              selectedValue={formData.expected_duration_hours}
              onValueChange={(itemValue) =>
                handleChange("expected_duration_hours", itemValue)
              }
              style={styles.durationInput}
            >
              {[...Array(24).keys()].map((i) => (
                <Picker.Item
                  key={i}
                  label={i.toString()}
                  value={i.toString()}
                />
              ))}
            </Picker>

            <Text>Minutes:</Text>
            <Picker
              selectedValue={formData.expected_duration_minutes}
              onValueChange={(itemValue) =>
                handleChange("expected_duration_minutes", itemValue)
              }
              style={styles.durationInput}
            >
              {[...Array(60).keys()].map((i) => (
                <Picker.Item
                  key={i}
                  label={i.toString()}
                  value={i.toString()}
                />
              ))}
            </Picker>
          </View>

          <Text style={styles.label}>Severity</Text>
          <Picker
            selectedValue={formData.severity}
            onValueChange={(itemValue) => handleChange("severity", itemValue)}
            style={styles.input}
          >
            {severityLevels.map((level) => (
              <Picker.Item key={level} label={level} value={level} />
            ))}
          </Picker>

          <Text style={styles.label}>Comments (optional)</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            value={formData.comments}
            onChangeText={(text) => handleChange("comments", text)}
            multiline
            numberOfLines={4}
            placeholder="Add any comments here"
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
  textarea: {
    height: 100,
    textAlignVertical: "top",
  },
  durationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  durationInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    marginHorizontal: 5,
    borderRadius: 5,
    width: 70,
    textAlign: "center",
  },
});

export default ObstacleForm;
