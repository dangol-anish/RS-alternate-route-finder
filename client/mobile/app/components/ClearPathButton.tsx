import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

interface ClearPathProps {
  clearPath: () => void;
}

const ClearPathButton: React.FC<ClearPathProps> = ({ clearPath }) => {
  return (
    <TouchableOpacity style={styles.floatingButton} onPress={clearPath}>
      <MaterialIcons name="restart-alt" size={24} color="black" />
    </TouchableOpacity>
  );
};

export default ClearPathButton;

const styles = StyleSheet.create({
  floatingButton: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 50,
  },
});
