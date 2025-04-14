import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import React from "react";
import { useMapStore } from "@/app/store/useMapStore";
import { Entypo } from "@expo/vector-icons";
import SettingsOptionsItems from "./MenuItems";
import MenuItems from "./MenuItems";

const Menu = () => {
  return <MenuItems />;
};

export default Menu;
