import { View, Text } from "react-native";
import { Link } from "expo-router";

export default function TypesNotFound() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Types directory - Not a route</Text>
      <Link href="/">Go back home</Link>
    </View>
  );
}
