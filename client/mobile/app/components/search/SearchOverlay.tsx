import React, { RefObject, useEffect, useState } from "react";
import {
  Modal,
  View,
  TouchableWithoutFeedback,
  Keyboard,
  TextInput,
  TouchableOpacity,
  FlatList,
  Text,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

type SearchOverlayProps = {
  visible: boolean;
  searchText: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
  onClose: () => void;
  inputRef: RefObject<TextInput>;
  onResultPress: (location: { latitude: number; longitude: number }) => void;
};

type PlaceResult = {
  name: string;
  latitude: number;
  longitude: number;
};

const SearchOverlay: React.FC<SearchOverlayProps> = ({
  visible,
  searchText,
  onChangeText,
  onClear,
  onClose,
  inputRef,
  onResultPress,
}) => {
  const [results, setResults] = useState<PlaceResult[]>([]);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (searchText.trim() === "") {
        setResults([]);
        return;
      }

      try {
        const response = await fetch(
          `http://${
            process.env.EXPO_PUBLIC_IP_ADDRESS
          }:5000/search_place?q=${encodeURIComponent(searchText)}`
        );
        const data = await response.json();

        const parsedResults: PlaceResult[] = data.map((place: any) => ({
          name: place.display_name,
          latitude: place.lat,
          longitude: place.lon,
        }));

        setResults(parsedResults);
      } catch (error) {
        console.error("Search error:", error);
      }
    };

    const debounce = setTimeout(fetchSearchResults, 300); // debounced API call
    return () => clearTimeout(debounce);
  }, [searchText]);

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.overlay}>
          <View style={styles.searchBox}>
            <TouchableOpacity onPress={onClose} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
            <TextInput
              ref={inputRef}
              placeholder="Search..."
              style={styles.fullscreenInput}
              value={searchText}
              onChangeText={onChangeText}
              autoFocus
            />
            {searchText !== "" && (
              <TouchableOpacity onPress={onClear}>
                <Ionicons name="close-circle" size={24} color="black" />
              </TouchableOpacity>
            )}
          </View>

          <FlatList
            data={results}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() =>
                  onResultPress({
                    latitude: item.latitude,
                    longitude: item.longitude,
                  })
                }
                style={styles.resultItem}
              >
                <Text>{item.name}</Text>
                <Text style={{ fontSize: 12, color: "#666" }}>
                  {item.latitude}, {item.longitude}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default SearchOverlay;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "white",
    paddingTop: 20,
    paddingHorizontal: 16,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f2f2f2",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 10,
  },
  fullscreenInput: {
    flex: 1,
    marginHorizontal: 10,
    fontSize: 16,
  },
  backButton: {
    paddingRight: 4,
  },
  resultItem: {
    padding: 16,
    borderBottomColor: "#ccc",
    borderBottomWidth: 1,
  },
});
