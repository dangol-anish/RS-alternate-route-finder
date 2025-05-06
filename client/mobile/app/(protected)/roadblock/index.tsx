// roadblock.js

import Roadblock from "@/app/components/obstacles/Roadblock";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

const roadblock = () => {
  return <Roadblock />;
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

export default roadblock;
