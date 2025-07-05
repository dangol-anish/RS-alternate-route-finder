import { StyleSheet, TouchableOpacity, View, Text } from "react-native";
import React, { useState, useEffect, useRef } from "react";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Ionicons } from "@expo/vector-icons";
import ClearPathButton from "./ClearPathButton";
import CurrentLocationButton from "./CurrentLocationButton";
import { useMapStore } from "@/lib/useMapStore";
import { useAuthStore } from "@/lib/useAuthStore";
import Toast from "react-native-toast-message";
import { themeColors } from "../styles/colors";

type SelectionMode = "source" | "destination" | "obstacle" | "none";

interface FloatingActionComponentProps {
  onLocateCurrentLocation: () => void;
  clearPath: () => void;
  onUseMyLocation: () => void;
  onSearchPress: () => void;
}

const FloatingActionComponent: React.FC<FloatingActionComponentProps> = ({
  onLocateCurrentLocation,
  clearPath,
  onUseMyLocation,
  onSearchPress,
}) => {
  const selectionMode = useMapStore((state) => state.selectionMode);
  const setSelectionMode = useMapStore((state) => state.setSelectionMode);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const [tooltip, setTooltip] = useState<null | string>(null);
  const tooltipTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (tooltip) {
      if (tooltipTimeout.current) clearTimeout(tooltipTimeout.current);
      tooltipTimeout.current = setTimeout(() => {
        setTooltip(null);
      }, 5000);
    }
    return () => {
      if (tooltipTimeout.current) clearTimeout(tooltipTimeout.current);
    };
  }, [tooltip]);

  const Button = ({
    iconName,
    mode,
    tooltipText,
  }: {
    iconName: keyof typeof MaterialIcons.glyphMap;
    mode: SelectionMode;
    tooltipText: string;
  }) => {
    const [pressed, setPressed] = useState(false);
    const isActive = selectionMode === mode;
    const isDisabled = mode === "obstacle" && !isAuthenticated;

    const handlePress = () => {
      if (mode === "obstacle" && !isAuthenticated) {
        Toast.show({
          type: "error",
          text1: "Login Required",
          text2: "You must be logged in to set obstacles.",
        });
        return;
      }
      setSelectionMode(isActive ? "none" : mode);
    };

    return (
      <View style={{ alignItems: "center" }}>
        {tooltip === mode && (
          <View style={styles.tooltip}>
            <Text style={styles.tooltipText}>{tooltipText}</Text>
          </View>
        )}
        <TouchableOpacity
          style={[
            styles.floatingButton,
            isActive && { backgroundColor: "#4682B4" },
            isDisabled && { backgroundColor: "#d3d3d3" },
            pressed && { opacity: 0.6 }, // manual feedback
          ]}
          activeOpacity={0.8}
          onPress={handlePress}
          onPressIn={() => setPressed(true)}
          onLongPress={() => setTooltip(mode)}
          onPressOut={() => {
            setPressed(false);
            setTooltip(null);
          }}
        >
          <MaterialIcons
            name={iconName}
            size={24}
            color={isActive ? "white" : isDisabled ? "gray" : "black"}
          />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.floatingView}>
      <ClearPathButton clearPath={clearPath} />
      <View style={{ alignItems: "center" }}>
        {tooltip === "search" && (
          <View style={styles.tooltip}>
            <Text style={styles.tooltipText}>Search</Text>
          </View>
        )}
        <TouchableOpacity
          style={styles.floatingButton}
          activeOpacity={0.8}
          onPress={onSearchPress}
          onLongPress={() => setTooltip("search")}
          onPressOut={() => setTooltip(null)}
        >
          <Ionicons name="search" size={24} color="black" />
        </TouchableOpacity>
      </View>
      <Button iconName="place" mode="source" tooltipText="Set Source" />
      <Button
        iconName="flag"
        mode="destination"
        tooltipText="Set Destination"
      />
      <Button iconName="block" mode="obstacle" tooltipText="Set Obstacle" />
      <CurrentLocationButton
        onLocateCurrentLocation={onLocateCurrentLocation}
      />
    </View>
  );
};

export default FloatingActionComponent;

const styles = StyleSheet.create({
  floatingView: {
    position: "absolute",
    bottom: 10,
    right: 0,
    margin: 16,
    flex: 1,
    gap: 16,
  },
  floatingButton: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  bottomLeftButton: {
    position: "absolute",
    left: 16,
    bottom: 70, // adjust as needed to sit above the menu bar
    backgroundColor: "white",
    padding: 16,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  tooltip: {
    position: "absolute",
    right: 60,
    top: "40%",
    transform: [{ translateY: -16 }], // vertical center, adjust as needed
    backgroundColor: themeColors.off_white,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    shadowColor: themeColors.gray,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    zIndex: 100,
    marginRight: 8,
    width: 100,
  },
  tooltipText: {
    color: themeColors.brown,
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
});
