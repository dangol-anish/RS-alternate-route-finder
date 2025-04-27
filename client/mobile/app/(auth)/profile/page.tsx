import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Image,
  Pressable,
  ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { useAuthStore } from "@/app/store/useAuthStore";
import Toast from "react-native-toast-message";
import { themeColors } from "@/app/styles/colors";
import { useRouter } from "expo-router"; // <<< NEW

const ProfileEditPage = () => {
  const { user, setUser } = useAuthStore();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [isPhotoChanged, setIsPhotoChanged] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter(); // <<< NEW

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
      Toast.show({
        type: "error",
        text1: "Permission required",
        text2: "Gallery access is required.",
      });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      allowsEditing: true,
    });

    if (!result.canceled) {
      setPhoto(result.assets[0].uri);
      setIsPhotoChanged(true);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);

    let base64Image = null;

    if (photo && isPhotoChanged && photo.startsWith("file://")) {
      try {
        const imageBase64 = await FileSystem.readAsStringAsync(photo, {
          encoding: FileSystem.EncodingType.Base64,
        });

        base64Image = `data:image/jpeg;base64,${imageBase64}`;
      } catch (error) {
        console.error("Error converting image:", error);
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Failed to process the image.",
        });
        setIsSaving(false);
        return;
      }
    }

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
            photo: base64Image,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        console.error("Failed to update profile:", result.error);
        Toast.show({
          type: "error",
          text1: "Error",
          text2: result.error || "Failed to update profile.",
        });
        setIsSaving(false);
        return;
      }

      setUser({
        ...user,
        full_name: fullName,
        photo: result.photo_url || user.photo,
      });

      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Profile updated successfully!",
      });

      // ✅ Navigate back to settings page
      router.push("/settings");
    } catch (error) {
      console.error("Error updating profile:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Something went wrong.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>No user data found.</Text>
      </View>
    );
  }

  return (
    <>
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
          <Pressable
            onPress={handleSave}
            disabled={isSaving}
            style={({ pressed }) => [
              styles.saveButton,
              isSaving && { opacity: 0.6 },
              pressed && { transform: [{ scale: 0.96 }] },
            ]}
          >
            <Text style={styles.saveButtonText}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
      <Toast />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    top: 0,
    padding: 20,
    alignItems: "center",
    backgroundColor: themeColors.off_white,
    flex: 1,
    paddingTop: 70,
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
    backgroundColor: themeColors.green,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  text: {
    top: 30,
  },
});

export default ProfileEditPage;
