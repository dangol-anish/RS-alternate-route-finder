import {
  StyleSheet,
  TextInput,
  View,
  TouchableOpacity,
  Image,
} from "react-native";
import React, { useRef, useState } from "react";
import { Ionicons } from "@expo/vector-icons";

const HeaderComponent = () => {
  const [isFocused, setIsFocused] = useState(false);
  const [searchText, setSearchText] = useState("");
  const inputRef = useRef<TextInput>(null);

  const handleUnfocus = () => {
    if (inputRef.current) {
      inputRef.current.blur();
    }
  };

  const handleClear = () => {
    setSearchText(""); // Clear the text
    if (inputRef.current) {
      inputRef.current.focus(); // Keep focus after clearing
    }
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        {/* Left Icon or Back Button */}
        {isFocused ? (
          <TouchableOpacity onPress={handleUnfocus}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity>
            <Ionicons name="menu" size={24} color="black" />
          </TouchableOpacity>
        )}

        {/* TextInput */}
        <TextInput
          ref={inputRef}
          placeholder="Search..."
          style={styles.textInput}
          value={searchText}
          onChangeText={setSearchText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />

        {/* Clear Button (Cross Icon) on Focus */}
        {isFocused && searchText !== "" && (
          <TouchableOpacity onPress={handleClear}>
            <Ionicons name="close-circle" size={24} color="black" />
          </TouchableOpacity>
        )}

        {/* Right Icon when not focused */}
        {!isFocused && (
          <Image
            source={require("../../public/my-notion-face-portrait.png")}
            style={styles.image}
          />
        )}
      </View>
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
    paddingTop: 10,
  },
  container: {
    flexDirection: "row",
    backgroundColor: "white",
    margin: 16,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 50,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    alignItems: "center",
  },
  textInput: {
    flex: 1,
    marginHorizontal: 10,
    backgroundColor: "white",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
  },

  image: {
    height: 30,
    width: 30,
    borderColor: "black",
    borderWidth: 0.5,
    borderRadius: 70,
  },
});
