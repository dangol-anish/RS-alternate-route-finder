// import React from "react";
// import { createNativeStackNavigator } from "@react-navigation/native-stack"; // React Navigation Stack
// import LoginScreen from "../screens/LoginScreen"; // Your Login screen
// import RegisterScreen from "../screens/SignIn"; // Your Register screen (optional)

// const Stack = createNativeStackNavigator(); // Create stack navigator

// export default function AuthStack() {
//   return (
//     <Stack.Navigator screenOptions={{ headerShown: false }}>
//       {/* Login screen */}
//       <Stack.Screen name="Login" component={LoginScreen} />

//       {/* Register screen */}
//       <Stack.Screen name="Register" component={RegisterScreen} />
//     </Stack.Navigator>
//   );
// }

// Placeholder component to satisfy Expo Router's default export requirement
import React from "react";
import { View, Text } from "react-native";

export default function AuthStack() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Auth Stack - Not Implemented</Text>
    </View>
  );
}
