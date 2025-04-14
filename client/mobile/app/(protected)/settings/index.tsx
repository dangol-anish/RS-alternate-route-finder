// settings.js

import SettingsItem from "@/app/components/auth/SettingsItem";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

const settings = () => {
  return <SettingsItem />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
  },
});

export default settings;
