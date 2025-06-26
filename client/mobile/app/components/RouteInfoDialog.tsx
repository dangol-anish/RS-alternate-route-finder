import React, { useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";
import { PanGestureHandler, State } from "react-native-gesture-handler";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
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
  return `${h > 0 ? h + "h " : ""}${m} min`;
}

const RouteInfoDialog: React.FC<Props> = ({
  sourceName,
  destinationName,
  distanceKm,
  onClose,
}) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const closing = useRef(false);

  const handleGestureEvent = (event: any) => {
    const y = event.nativeEvent.translationY;
    if (y < 0) {
      translateY.setValue(0);
    } else {
      translateY.setValue(y);
    }
  };

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
        <View style={styles.dragHandle} />
        {/* <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <MaterialIcons name="close" size={28} color="#333" />
        </TouchableOpacity> */}
        <Text style={styles.title}>Route Information</Text>

        <View style={styles.row}>
          <MaterialIcons
            name="location-on"
            size={22}
            color={themeColors.green}
          />
          <Text style={styles.label}>
            <Text style={styles.bold}></Text> {sourceName}
          </Text>
        </View>

        <View style={styles.row}>
          <MaterialIcons name="place" size={22} color={themeColors.brown} />
          <Text style={styles.label}>
            <Text style={styles.bold}></Text> {destinationName}
          </Text>
        </View>

        <Text style={styles.label}>
          <Text style={styles.bold}>Distance:</Text> {distanceKm.toFixed(2)} km
        </Text>

        <View>
          <Text style={styles.label}>
            <Text style={styles.bold}>Estimated Time:</Text>
          </Text>

          <View style={styles.estimatedTimeView}>
            <View style={styles.timeItem}>
              <FontAwesome5 name="walking" size={20} color="black" />
              <Text style={styles.timeText}>
                {formatTime(distanceKm / speeds.foot)}
              </Text>
            </View>
            <View style={styles.timeItem}>
              <MaterialIcons name="motorcycle" size={24} color="black" />
              <Text style={styles.timeText}>
                {formatTime(distanceKm / speeds.motorcycle)}
              </Text>
            </View>
            <View style={styles.timeItem}>
              <FontAwesome5 name="car" size={24} color="black" />
              <Text style={styles.timeText}>
                {formatTime(distanceKm / speeds.car)}
              </Text>
            </View>
          </View>
        </View>
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
    display: "flex",
    flexDirection: "column",

    justifyContent: "center",
    gap: 10,
  },
  dragHandle: {
    width: 40,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#ccc",
    alignSelf: "center",
    marginBottom: 12,
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
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  label: {
    fontSize: 16,
    marginLeft: 6,
  },
  bold: {
    fontWeight: "bold",
  },
  timeItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 8,
  },
  timeText: {
    fontSize: 15,
    marginLeft: 10,
  },

  estimatedTimeView: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 5,
  },
});

export default RouteInfoDialog;
