import React, { useEffect, useRef, useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  Text,
  StyleSheet,
  ActivityIndicator,
  Keyboard,
  Image,
} from "react-native";
import { Entypo, Ionicons } from "@expo/vector-icons";
import { themeColors } from "@/app/styles/colors";
import SkeletonPlaceholder from "../ui/SkeletonPlaceholder";
import { useAuthStore } from "@/lib/useAuthStore";

interface InlineSearchBarProps {
  mapRef: React.RefObject<any>;
}

interface PlaceResult {
  name: string;
  latitude: number;
  longitude: number;
}

const InlineSearchBar: React.FC<InlineSearchBarProps> = ({ mapRef }) => {
  const user = useAuthStore((state) => state.user);
  const [searchText, setSearchText] = useState("");
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    let debounce: NodeJS.Timeout;
    const fetchSearchResults = async () => {
      if (searchText.trim().length < 2) {
        setResults([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const response = await fetch(
          `${
            process.env.EXPO_PUBLIC_IP_ADDRESS
          }/search_place?q=${encodeURIComponent(searchText)}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Check if data is an array and not empty
        if (!Array.isArray(data)) {
          console.error("Search error: Response is not an array:", data);
          setResults([]);
          return;
        }

        const parsedResults: PlaceResult[] = data.map((place: any) => ({
          name: place.display_name || place.name || "Unknown location",
          latitude: Number(place.lat) || 0,
          longitude: Number(place.lon) || 0,
        }));
        setResults(parsedResults);
      } catch (error) {
        console.error("Search error:", error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };
    if (searchText.trim().length >= 2) {
      debounce = setTimeout(fetchSearchResults, 500);
    } else {
      setResults([]);
      setLoading(false);
    }
    return () => clearTimeout(debounce);
  }, [searchText]);

  const handleResultPress = (item: PlaceResult) => {
    setIsFocused(false);
    setSearchText("");
    setResults([]);
    Keyboard.dismiss();
    if (mapRef.current) {
      mapRef.current.injectJavaScript(`
        map.flyTo([${item.latitude}, ${item.longitude}], 16);
        true;
      `);
    }
  };

  const handleClear = () => {
    setSearchText("");
    setResults([]);
  };

  return (
    <View style={[styles.wrapper, { pointerEvents: "box-none" }]}>
      {isFocused && (searchText.length > 0 || loading) && (
        <TouchableOpacity
          style={[StyleSheet.absoluteFillObject, { zIndex: 100 }]}
          activeOpacity={1}
          onPress={() => {
            setIsFocused(false);
            inputRef.current?.blur();
          }}
        />
      )}
      <View style={styles.container}>
        {isFocused ? (
          <Ionicons
            name="search"
            size={24}
            color={themeColors.brown}
            style={{ marginRight: 8 }}
          />
        ) : (
          <Image
            source={require("../../../assets/logo/logo.png")}
            style={{ width: 24, height: 24, borderRadius: 0, marginRight: 8 }}
          />
        )}
        <TextInput
          ref={inputRef}
          placeholder="Search..."
          placeholderTextColor="#8a7567"
          style={styles.textInput}
          value={searchText}
          onChangeText={setSearchText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          autoCorrect={false}
          autoCapitalize="none"
        />
        {isFocused ? (
          <TouchableOpacity onPress={handleClear} style={{ marginLeft: 8 }}>
            <Entypo name="cross" size={24} color={themeColors.brown} />
          </TouchableOpacity>
        ) : !user?.photo ? (
          <Image
            source={require("../../../assets/logo/Person.png")}
            style={{ width: 24, height: 24, borderRadius: 0, marginLeft: 8 }}
            resizeMode="contain"
          />
        ) : (
          <Image
            source={{ uri: user.photo }}
            style={{ width: 30, height: 30, borderRadius: 70, marginLeft: 8 }}
            resizeMode="cover"
          />
        )}
      </View>
      {isFocused && (searchText.length > 0 || loading) && (
        <View style={styles.dropdown}>
          {loading ? (
            <ActivityIndicator
              size="small"
              color={themeColors.brown}
              style={{ margin: 12 }}
            />
          ) : searchText.length > 0 && results.length > 0 ? (
            <FlatList
              data={results}
              keyExtractor={(_, index) => index.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handleResultPress(item)}
                  style={styles.resultItem}
                >
                  <Text numberOfLines={1} style={styles.resultName}>
                    {item.name}
                  </Text>
                  <Text style={styles.resultCoords}>
                    {item.latitude}, {item.longitude}
                  </Text>
                </TouchableOpacity>
              )}
              style={{ maxHeight: 320 }}
              showsVerticalScrollIndicator={true}
            />
          ) : searchText.length > 0 && !loading && results.length === 0 ? (
            <Text style={styles.noResultsText}>No results found</Text>
          ) : null}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    zIndex: 100,
    position: "absolute",
    top: 40,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  container: {
    flexDirection: "row",
    backgroundColor: themeColors.off_white,
    marginHorizontal: 16,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 50,
    elevation: 24,
    shadowColor: themeColors.brown,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 4,
    alignItems: "center",
    width: "92%",
  },
  textInput: {
    flex: 1,
    backgroundColor: themeColors.off_white,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    fontSize: 16,
  },
  dropdown: {
    position: "absolute",
    top: 60,
    left: 16,
    right: 16,
    backgroundColor: themeColors.off_white,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 2,
    paddingVertical: 4,
    width: "92%",
    alignSelf: "center",
  },
  resultItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomColor: "#eee",
    borderBottomWidth: 1,
  },
  resultName: {
    fontSize: 15,
    fontWeight: "500",
    color: themeColors.brown,
  },
  resultCoords: {
    fontSize: 12,
    color: "#888",
  },
  noResultsText: {
    color: themeColors.brown,
    fontSize: 15,
    fontWeight: "bold",
    textAlign: "center",
    opacity: 0.7,
    padding: 16,
  },
});

export default InlineSearchBar;
