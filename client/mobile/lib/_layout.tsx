import { Stack } from "expo-router";

export default function StoreLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      {/* This layout prevents store files from being treated as routes */}
    </Stack>
  );
}
