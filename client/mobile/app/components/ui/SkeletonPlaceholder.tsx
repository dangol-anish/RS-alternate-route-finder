import React, { useEffect, useRef } from "react";
import { Animated, View, StyleSheet } from "react-native";

type SkeletonProps = {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
};

const SkeletonPlaceholder: React.FC<SkeletonProps> = ({
  width = "100%",
  height = 20,
  borderRadius = 4,
  style,
}) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, [shimmerAnim]);

  const backgroundColor = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#ececec", "#f5f5f5"],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        { width, height, borderRadius, backgroundColor },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  skeleton: {
    marginVertical: 4,
    marginHorizontal: 0,
  },
});

export default SkeletonPlaceholder;
