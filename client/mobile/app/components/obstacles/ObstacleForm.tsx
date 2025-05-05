import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import { ObstacleFormProps } from "@/app/types/obstacleForm";
import { themeColors } from "@/app/styles/colors";
import * as FileSystem from "expo-file-system";

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
    type: "",
    expected_duration_hours: "0",
    expected_duration_minutes: "0",
    severity: "",
    comments: "",
  });

  const [image, setImage] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) {
      setFormData({
        name: "",
        type: "",
        expected_duration_hours: "0",
        expected_duration_minutes: "0",
        severity: "",
        comments: "",
      });
      setImage(null);
    }
  }, [visible]);

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
      name.trim() === "" ||
      type.trim() === "" ||
      severity.trim() === "" ||
      expected_duration_hours === "" ||
      expected_duration_minutes === ""
    ) {
      Alert.alert(
        "Validation Error",
        "All fields except Comments and Image are required."
      );
      return false;
    }

    return true;
  };

  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert("Permission Denied", "Camera roll permission is required.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      const imageUri = result.assets[0].uri;
      setImage(imageUri);

      try {
        const base64Image = await FileSystem.readAsStringAsync(imageUri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        setImage(`data:image/jpeg;base64,${base64Image}`);
      } catch (error) {
        Alert.alert("Error", "Failed to process the image.");
      }
    }
  };

  const getFileName = (uri: string) => {
    return uri.split("/").pop();
  };

  const handleSubmit = () => {
    if (validateForm()) {
      const { expected_duration_hours, expected_duration_minutes } = formData;
      const totalDuration = `${expected_duration_hours}:${expected_duration_minutes}:00`;

      // Handle image as optional, convert null to undefined
      const dataToSubmit = {
        ...formData,
        expected_duration: totalDuration,
        image: image || undefined, // If image is null, set it as undefined
      };

      onSubmit(dataToSubmit);
      onClose();
      setFormData({
        name: "",
        type: "",
        expected_duration_hours: "0",
        expected_duration_minutes: "0",
        severity: "",
        comments: "",
      });
      setImage(null);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.container}>
        <View style={styles.form}>
          <ScrollView>
            <View style={styles.header}>
              <Text style={styles.headerText}>Add an Obstacle</Text>
              <TouchableOpacity onPress={onClose}>
                <Text style={styles.closeIcon}>×</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(text) => handleChange("name", text)}
              placeholder="Enter the obstacle name..."
            />

            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.type}
                onValueChange={(itemValue) => handleChange("type", itemValue)}
                style={styles.picker}
              >
                <Picker.Item
                  label="Select an obstacle type"
                  value=""
                  style={{ color: "grey" }}
                />
                {obstacleTypes.map((type) => (
                  <Picker.Item key={type} label={type} value={type} />
                ))}
              </Picker>
            </View>

            <Text style={styles.label}>Expected Duration</Text>
            <View style={styles.durationRow}>
              <Text>Hours:</Text>
              <View style={styles.pickerContainerSmall}>
                <Picker
                  selectedValue={formData.expected_duration_hours}
                  onValueChange={(itemValue) =>
                    handleChange("expected_duration_hours", itemValue)
                  }
                  style={styles.pickerTime}
                >
                  {[...Array(24).keys()].map((i) => (
                    <Picker.Item
                      key={i}
                      label={i.toString()}
                      value={i.toString()}
                    />
                  ))}
                </Picker>
              </View>

              <Text>Minutes:</Text>
              <View style={styles.pickerContainerSmall}>
                <Picker
                  selectedValue={formData.expected_duration_minutes}
                  onValueChange={(itemValue) =>
                    handleChange("expected_duration_minutes", itemValue)
                  }
                  style={styles.pickerTime}
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
            </View>

            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.severity}
                onValueChange={(itemValue) =>
                  handleChange("severity", itemValue)
                }
                style={styles.picker}
              >
                <Picker.Item
                  label="Pick a level of severity"
                  value=""
                  style={{ color: "grey" }}
                />
                {severityLevels.map((level) => (
                  <Picker.Item key={level} label={level} value={level} />
                ))}
              </Picker>
            </View>

            <TextInput
              style={[styles.input, styles.textarea]}
              value={formData.comments}
              onChangeText={(text) => handleChange("comments", text)}
              multiline
              numberOfLines={4}
              placeholder="Add any comments here (optional)"
              scrollEnabled={true}
            />

            <View>
              <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
                <Text style={styles.imageButtonText}>Select Image</Text>
              </TouchableOpacity>
              <Text style={styles.imageStatusText}>
                {image
                  ? `Selected Image: ${getFileName(image)}`
                  : "No image selected"}
              </Text>
            </View>

            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
              <Text style={styles.submitBtnText}>Add an Obstacle</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  form: {
    margin: 20,
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
    maxHeight: "90%",
  },
  label: {
    fontWeight: "400",
    marginVertical: 5,
    opacity: 0.5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    height: 50,
    paddingHorizontal: 10,
    fontSize: 16,
    marginBottom: 10,
  },
  textarea: {
    height: 100,
    textAlignVertical: "top",
  },
  durationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
    marginBottom: 10,
  },
  pickerContainer: {
    marginVertical: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: "#f2f2f2",
    borderRadius: 8,
  },
  pickerContainerSmall: {
    marginHorizontal: 5,
    paddingHorizontal: 5,
    backgroundColor: "#f2f2f2",
    borderRadius: 8,
    width: 100,
  },
  picker: {
    height: 50,
  },
  pickerTime: {
    height: 50,
    width: 100,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  closeIcon: {
    fontSize: 24,
    fontWeight: "bold",
    color: "gray",
    paddingHorizontal: 10,
  },
  submitBtn: {
    backgroundColor: themeColors.green,
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 15,
  },
  submitBtnText: {
    fontSize: 16,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: "white",
  },
  imageButton: {
    borderWidth: 2,
    borderColor: themeColors.green,
    borderStyle: "dashed",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: "transparent",
  },
  imageButtonText: {
    color: themeColors.green,
    fontWeight: "600",
    alignSelf: "center",
  },
  imageStatusText: {
    marginTop: 8,
    fontStyle: "italic",
    color: "#555",
  },
});

export default ObstacleForm;
