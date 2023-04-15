import { Animated } from "react-native";
import React, { useEffect, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
export const WidthInView = ({ children, style, width = 200 }) => {
  const [WidthAnim] = useState(new Animated.Value(width/2));
  const startAnimation = () => {
    Animated.timing(WidthAnim, {
      toValue: width,
      duration: 1500,
      useNativeDriver: false,
    }).start();
  };

  useFocusEffect(
    React.useCallback(() => {
      startAnimation();
      return () => {
        WidthAnim.setValue(0);
      };
    }, [])
  );

  return (
    <Animated.View style={{ ...style, width: WidthAnim }}>
      {children}
    </Animated.View>
  );
};
