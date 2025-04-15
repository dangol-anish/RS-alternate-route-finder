import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import React, { useState } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { useAuthStore } from "@/app/store/useAuthStore";

const Signin = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignIn = async () => {
    try {
      const res = await fetch(
        `http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:5000/signin`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await res.json();

      console.log(data);

      if (res.ok) {
        const session = data.session;
        const user = data?.user;

        await useAuthStore.getState().saveSession({
          user: {
            id: data?.user?.id,
            email: user.email,
            full_name: user.full_name,
            phone: user.phone,
            photo: user.photo || null,
          },
          accessToken: session.access_token,
          refreshToken: session.refresh_token,
        });

        Toast.show({
          type: "success",
          text1: "Welcome back!",
        });

        router.replace("/"); // Redirect to home
      } else {
        Alert.alert("Sign in failed", data?.error || "Unknown error");
      }
    } catch (error: any) {
      Alert.alert("Sign In Error", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.signinHeader}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <Text style={styles.headerText}>Sign In</Text>

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
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleSignIn}>
        <Text style={styles.buttonText}>Sign In</Text>
      </TouchableOpacity>

      <View style={styles.signupPrompt}>
        <Text style={styles.promptText}>Don't have an account?</Text>
        <TouchableOpacity onPress={() => router.push("/signup")}>
          <Text style={styles.signupText}> Sign up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Signin;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    justifyContent: "center",
  },
  signinHeader: {
    position: "absolute",
    top: 50,
    left: 20,
  },
  headerText: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
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
    color: "#007AFF",
    fontWeight: "600",
  },
});
