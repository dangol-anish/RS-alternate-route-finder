import { Stack } from "expo-router";

export default function HooksLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      {/* This layout prevents hook files from being treated as routes */}
    </Stack>
  );
}
