// you.js

import React from "react";
import { StyleSheet, Text, View } from "react-native";

const you = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>you</Text>
    </View>
  );
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

export default you;
