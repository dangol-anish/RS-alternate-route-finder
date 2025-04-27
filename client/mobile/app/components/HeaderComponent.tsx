import {
  StyleSheet,
  TextInput,
  View,
  TouchableOpacity,
  Image,
  Text,
} from "react-native";
import React, { useRef, useState } from "react";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useMapStore } from "../store/useMapStore";
import { useAuthStore } from "../store/useAuthStore";
import SearchOverlay from "./search/SearchOverlay";
import MapView from "react-native-maps";
import { themeColors } from "../styles/colors";

// Props now accepts the mapRef
const HeaderComponent = ({ mapRef }: { mapRef: React.RefObject<MapView> }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [searchText, setSearchText] = useState("");
  const user = useAuthStore((state) => state.user);
  const inputRef = useRef<TextInput>(null);

  // Animate map to the selected location
  const handleResultPress = ({
    latitude,
    longitude,
  }: {
    latitude: number;
    longitude: number;
  }) => {
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
      setIsFocused(false); // close overlay
      inputRef.current?.blur();
    }
  };

  const handleClear = () => {
    setSearchText("");
  };

  const handleUnfocus = () => {
    setIsFocused(false);
    inputRef.current?.blur();
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        {/* Left Icon */}
        <TouchableOpacity onPress={isFocused ? handleUnfocus : () => {}}>
          <Image
            source={require("../../assets/logo/logo.png")}
            style={{ width: 24, height: 24, borderRadius: 0 }} // Customize the size
          />
        </TouchableOpacity>

        {/* TextInput */}
        <TouchableOpacity
          style={styles.textInputWrapper}
          onPress={() => {
            setIsFocused(true);
            inputRef.current?.focus();
          }}
          activeOpacity={1}
        >
          <TextInput
            ref={inputRef}
            placeholder="Search..."
            placeholderTextColor="#8a7567"
            style={styles.textInput}
            value={searchText}
            onChangeText={setSearchText}
            onFocus={() => setIsFocused(true)}
            editable={false}
          />
        </TouchableOpacity>

        {/* Clear icon */}
        {isFocused && searchText !== "" && (
          <TouchableOpacity onPress={handleClear}>
            <Ionicons name="close-circle" size={24} color="black" />
          </TouchableOpacity>
        )}

        {/* Profile */}
        {!user?.photo ? (
          <Image
            source={require("../../assets/logo/Person.png")}
            style={{
              width: 24,
              height: 24,
              borderRadius: 0,
            }} // Customize the size
            resizeMode="contain"
          />
        ) : (
          <Image
            source={{ uri: user.photo }}
            style={styles.image}
            resizeMode="cover"
          />
        )}
      </View>

      {/* Search Modal Overlay */}
      <SearchOverlay
        visible={isFocused}
        searchText={searchText}
        onChangeText={setSearchText}
        onClear={handleClear}
        onClose={handleUnfocus}
        inputRef={inputRef}
        onResultPress={handleResultPress} // 🔥 KEY LINE
      />
    </View>
  );
};

export default HeaderComponent;

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  container: {
    flexDirection: "row",
    backgroundColor: themeColors.off_white,
    margin: 16,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 50,
    elevation: 24,
    shadowColor: themeColors.brown,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 4,
    alignItems: "center",
  },
  textInputWrapper: {
    flex: 1,
    marginHorizontal: 10,
  },
  textInput: {
    backgroundColor: themeColors.off_white,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  image: {
    height: 30,
    width: 30,
    borderColor: "black",

    borderRadius: 70,
  },
});
