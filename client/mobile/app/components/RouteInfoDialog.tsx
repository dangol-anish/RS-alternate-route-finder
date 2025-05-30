import React, { useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";
import { PanGestureHandler, State } from "react-native-gesture-handler";
import { MaterialIcons } from "@expo/vector-icons";
import { themeColors } from "../styles/colors";

type Props = {
  sourceName: string;
  destinationName: string;
  distanceKm: number;
  onClose: () => void;
};

const speeds = {
  foot: 5,
  motorcycle: 30,
  car: 50,
};

function formatTime(hours: number) {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h > 0 ? h + "h " : ""}${m}m`;
}

const RouteInfoDialog: React.FC<Props> = ({
  sourceName,
  destinationName,
  distanceKm,
  onClose,
}) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const closing = useRef(false);

  const handleGestureEvent = Animated.event(
    [{ nativeEvent: { translationY: translateY } }],
    { useNativeDriver: true }
  );

  const handleStateChange = (event: any) => {
    if (
      event.nativeEvent.translationY > 50 &&
      event.nativeEvent.state === State.END &&
      !closing.current
    ) {
      closing.current = true;
      Animated.timing(translateY, {
        toValue: 500,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        onClose();
      });
    } else if (event.nativeEvent.state === State.END) {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
    }
  };

  return (
    <PanGestureHandler
      onGestureEvent={handleGestureEvent}
      onHandlerStateChange={handleStateChange}
    >
      <Animated.View
        style={[styles.container, { transform: [{ translateY }] }]}
      >
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <MaterialIcons name="close" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Route Information</Text>
        <Text style={styles.label}>
          <Text style={styles.bold}>From:</Text> {sourceName}
        </Text>
        <Text style={styles.label}>
          <Text style={styles.bold}>To:</Text> {destinationName}
        </Text>
        <Text style={styles.label}>
          <Text style={styles.bold}>Distance:</Text> {distanceKm.toFixed(2)} km
        </Text>
        <Text style={styles.label}>
          <Text style={styles.bold}>Estimated Time:</Text>
        </Text>
        <Text style={styles.time}>
          🚶 Foot: {formatTime(distanceKm / speeds.foot)}
        </Text>
        <Text style={styles.time}>
          🏍️ Motorcycle: {formatTime(distanceKm / speeds.motorcycle)}
        </Text>
        <Text style={styles.time}>
          🚗 Car: {formatTime(distanceKm / speeds.car)}
        </Text>
      </Animated.View>
    </PanGestureHandler>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: themeColors.off_white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -2 },
    borderBottomColor: themeColors.gray,
    borderBottomWidth: 0.8,
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 10,
    padding: 4,
  },
  title: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 8,
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    marginBottom: 2,
  },
  bold: {
    fontWeight: "bold",
  },
  time: {
    fontSize: 15,
    marginLeft: 10,
    marginBottom: 2,
  },
});

export default RouteInfoDialog;
