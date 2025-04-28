import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  Pressable,
} from "react-native";
import React, { useState } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { useAuthStore } from "@/app/store/useAuthStore";
import { themeColors } from "@/app/styles/colors";

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
      <Image
        source={require("../../../assets/logo/mainLogo.png")}
        style={styles.logoStyle}
        resizeMode="contain"
      />
      <View style={styles.loginHeader}>
        <Text style={styles.headerText}>Welcome Back!</Text>
        <Text style={styles.headerSubText}> Login to continue</Text>
      </View>

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

      <Pressable
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed,
        ]}
        onPress={handleSignIn}
      >
        <Text style={styles.buttonText}>Sign In</Text>
      </Pressable>

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
    backgroundColor: themeColors.off_white,
    paddingTop: 110,
  },
  logoStyle: {
    height: 150,
    width: 150,
    alignSelf: "center",
  },

  signinHeader: {
    position: "absolute",
    top: 50,
    left: 20,
  },
  loginHeader: {
    marginVertical: 30,
    flexDirection: "column",
    gap: 4,
  },
  headerText: {
    fontSize: 28,
    fontWeight: "bold",
  },
  headerSubText: {
    fontSize: 16,
    fontWeight: "bold",
    opacity: 0.5,
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
    backgroundColor: themeColors.green,
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
  buttonPressed: {
    backgroundColor: themeColors.light_green,
    transform: [{ scale: 0.98 }],
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
});
