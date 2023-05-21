import {Animated} from 'react-native';
import React, {useEffect, useState} from 'react';

export const FadeInView = props => {
  const [fadeAnim] = useState(new Animated.Value(0)); // Инициализируем значение анимации

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: true, // Использование нативного драйвера
    }).start(); // Запускаем анимацию
  }, []);

  return (
    <Animated.View // Внешний контейнер анимации
      style={{
        ...props.style,
        opacity: fadeAnim, // Применяем анимацию прозрачности
      }}>
      {props.children}
    </Animated.View>
  );
};
