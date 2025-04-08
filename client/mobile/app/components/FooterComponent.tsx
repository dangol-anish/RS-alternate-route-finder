import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";

interface FooterComponentProps {
  setSelectedTab: (tab: string) => void;
  selectedTab: string;
}

const FooterComponent: React.FC<FooterComponentProps> = ({
  setSelectedTab,
  selectedTab,
}) => {
  const getIconColor = (tab: string) =>
    selectedTab === tab ? "blue" : "black";

  const getTextStyle = (tab: string) => ({
    color: selectedTab === tab ? "blue" : "black",
    fontWeight: selectedTab === tab ? ("bold" as const) : ("normal" as const),
  });

  return (
    <View style={styles.view}>
      <View style={styles.container} onTouchEnd={() => setSelectedTab("index")}>
        <Ionicons
          name="compass-outline"
          size={20}
          color={getIconColor("index")}
        />
        <Text style={[styles.iconText, getTextStyle("index")]}>Explore</Text>
      </View>
      <View style={styles.container} onTouchEnd={() => setSelectedTab("you")}>
        <Ionicons
          name="bookmark-outline"
          size={20}
          color={getIconColor("you")}
        />
        <Text style={[styles.iconText, getTextStyle("you")]}>You</Text>
      </View>
      <View
        style={styles.container}
        onTouchEnd={() => setSelectedTab("roadblock")}
      >
        <Ionicons
          name="warning-outline"
          size={20}
          color={getIconColor("roadblock")}
        />
        <Text style={[styles.iconText, getTextStyle("roadblock")]}>
          Roadblock
        </Text>
      </View>
    </View>
  );
};

export default FooterComponent;

const styles = StyleSheet.create({
  view: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 10,
    backgroundColor: "white",
    zIndex: 999,
  },
  container: {
    alignItems: "center",
    flexDirection: "column",
    gap: 4,
  },
  iconText: {
    fontSize: 10,
  },
});
