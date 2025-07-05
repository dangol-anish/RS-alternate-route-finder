import { Stack } from "expo-router";

export default function TypesLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      {/* This layout prevents type files from being treated as routes */}
    </Stack>
  );
}
