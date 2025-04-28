import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
} from "react-native";
import React, { useState } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { themeColors } from "@/app/styles/colors";

const Signup = () => {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const isValidNepaliPhone = (number: string) => {
    return (
      number.startsWith("+977") ||
      number.startsWith("98") ||
      number.startsWith("97")
    );
  };

  const handleSignup = async () => {
    if (!fullName || !email || !phoneNumber || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    if (!isValidNepaliPhone(phoneNumber)) {
      Alert.alert(
        "Invalid Phone Number",
        "Please enter a valid Nepali phone number."
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Password Mismatch", "Passwords do not match.");
      return;
    }

    try {
      const response = await fetch(
        `http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:5000/signup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            full_name: fullName,
            email,
            phone: phoneNumber,
            password,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        Alert.alert(
          "Signup Failed",
          result.error || "An error occurred. Please try again."
        );
        return;
      }

      Toast.show({
        type: "success",
        text1: "Signup Successful",
        text2: "Please sign in to continue.",
      });

      // Delay to let the toast show
      setTimeout(() => {
        router.replace("/signin");
      }, 1500);
    } catch (err: any) {
      Alert.alert("Signup Failed", err.message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.signupHeader}>
        <TouchableOpacity onPress={() => router.push("/settings")}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
      </View>
      <Image
        source={require("../../../assets/logo/mainLogo.png")}
        style={styles.logoStyle}
        resizeMode="contain"
      />
      <View style={styles.loginHeader}>
        <Text style={styles.headerText}>Get Started!</Text>
        <Text style={styles.headerSubText}> Welcome to RoadSense!</Text>
      </View>
      <View style={styles.colItems}>
        <TextInput
          style={styles.input}
          placeholder="Full Name"
          value={fullName}
          onChangeText={setFullName}
        />

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.button} onPress={handleSignup}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>

        <View style={styles.signupPrompt}>
          <Text style={styles.promptText}>Already have an account?</Text>
          <TouchableOpacity onPress={() => router.push("/signin")}>
            <Text style={styles.signupText}> Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default Signup;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    justifyContent: "center",
    backgroundColor: themeColors.off_white,
  },
  signupHeader: {
    position: "absolute",
    top: 50,
    left: 20,
  },
  headerText: {
    fontSize: 28,
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  button: {
    backgroundColor: themeColors.green,
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  logoStyle: {
    height: 150,
    width: 150,
    alignSelf: "center",
    marginTop: 40,
  },

  signupPrompt: {
    flexDirection: "row",
    justifyContent: "center",
  },
  promptText: {
    fontSize: 14,
    color: "#333",
  },
  signupText: {
    fontSize: 14,
    color: themeColors.green,
    fontWeight: "600",
  },

  colItems: {
    flexDirection: "column",
    gap: 15,
  },
  headerSubText: {
    fontSize: 16,
    fontWeight: "bold",
    opacity: 0.5,
  },
  loginHeader: {
    marginTop: 10,
    flexDirection: "column",
    marginBottom: 30,
    gap: 4,
  },
});
