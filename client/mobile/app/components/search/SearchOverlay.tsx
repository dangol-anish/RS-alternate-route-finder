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
import { Entypo, Ionicons } from "@expo/vector-icons";
import { themeColors } from "@/app/styles/colors";

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
              <Ionicons name="arrow-back" size={24} color={themeColors.brown} />
            </TouchableOpacity>
            <TextInput
              ref={inputRef}
              placeholder="Search..."
              style={styles.fullscreenInput}
              value={searchText}
              onChangeText={onChangeText}
              placeholderTextColor="#8a7567"
              autoFocus
            />
            {searchText !== "" && (
              <TouchableOpacity onPress={onClear}>
                <Entypo name="cross" size={24} color={themeColors.brown} />
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
            ListEmptyComponent={
              searchText.trim() !== "" ? (
                <View style={styles.noResults}>
                  <Text style={styles.noResultsText}>No results found</Text>
                </View>
              ) : null
            }
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
    backgroundColor: themeColors.off_white,
  },
  searchBox: {
    flexDirection: "row",
    backgroundColor: themeColors.off_white,
    margin: 16,
    marginTop: 9,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 50,
    elevation: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.9,
    shadowRadius: 4,
    alignItems: "center",
  },
  fullscreenInput: {
    flex: 1,
    backgroundColor: themeColors.off_white,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  backButton: {
    paddingRight: 4,
  },
  resultItem: {
    padding: 16,
    borderBottomColor: "#ccc",
    borderBottomWidth: 1,
  },
  noResults: {
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 30,
  },
  noResultsText: {
    color: themeColors.brown, // Or choose a color that fits your theme
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    opacity: 0.7,
  },
});
