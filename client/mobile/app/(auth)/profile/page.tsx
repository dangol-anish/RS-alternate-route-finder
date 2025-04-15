import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Image,
  Alert,
  ScrollView,
  Pressable,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useAuthStore } from "@/app/store/useAuthStore";

const ProfileEditPage = () => {
  const { user, setUser } = useAuthStore();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);

  const handleSave = async () => {
    if (!user) return;

    try {
      const response = await fetch(
        `http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:5000/update_profile`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: user.id,
            full_name: fullName,
            photo: photo,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        console.error("Failed to update profile:", result.error);
        Alert.alert("Error", result.error || "Failed to update profile.");
        return;
      }

      // ✅ Update user in the store with the new full_name and photo
      setUser({
        ...user,
        full_name: fullName,
        photo: photo || user.photo,
      });

      Alert.alert("Success", "Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "Something went wrong.");
    }
  };

  useEffect(() => {
    if (user) {
      setFullName(user.full_name);
      setEmail(user.email);
      setPhone(user.phone);
      setPhoto(user.photo);
    }
  }, [user]);

  const handlePickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission required", "Gallery access is required.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      allowsEditing: true,
    });

    if (!result.canceled) {
      setPhoto(result.assets[0].uri);
    }
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>No user data found.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Pressable onPress={handlePickImage}>
        {photo ? (
          <Image source={{ uri: photo }} style={styles.profileImage} />
        ) : (
          <View style={styles.placeholderImage}>
            <Text>Tap to Add Photo</Text>
          </View>
        )}
      </Pressable>

      <Text style={styles.label}>Full Name</Text>
      <TextInput
        style={styles.input}
        value={fullName}
        onChangeText={setFullName}
      />

      <View style={{ marginTop: 20, width: "100%" }}>
        <Pressable style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
};

export default ProfileEditPage;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: "center",
  },
  label: {
    alignSelf: "flex-start",
    marginTop: 16,
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    marginTop: 4,
    width: "100%",
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  placeholderImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  saveButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
