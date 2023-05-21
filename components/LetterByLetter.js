import React, {useEffect, useState} from 'react';
import {Animated, Text, View} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {WidthInView} from '../components/WidthInView';
export const LetterByLetterText = ({children, textStyle, marginR = 15}) => {
  const [letterAnimations, setLetterAnimations] = useState([]);
  useFocusEffect(
    React.useCallback(() => {
      const text = children.trim();
      const newLetterAnimations = [];
      for (let i = 0; i < text.length; i++) {
        newLetterAnimations.push(new Animated.Value(0));
      }
      setLetterAnimations(newLetterAnimations);
    }, [children]),
  );

  useEffect(() => {
    const animations = letterAnimations.map((letterAnimation, index) =>
      Animated.timing(letterAnimation, {
        toValue: 1,
        delay: 50 * index,
        useNativeDriver: true,
      }),
    );

    Animated.stagger(50, animations).start();
  }, [letterAnimations]);

  return (
    <WidthInView width={90} style={{flexDirection: 'row', marginRight: marginR, alignItems: 'center'}}>
      {children
        .trim()
        .split('')
        .map((letter, index) => (
          <Animated.Text key={index} style={[textStyle, {opacity: letterAnimations[index]}]}>
            {letter}
          </Animated.Text>
        ))}
    </WidthInView>
  );
};
