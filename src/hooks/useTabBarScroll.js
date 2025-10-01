import { useRef, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const useTabBarScroll = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  
  const lastOffset = useRef(0);
  const isTabBarVisible = useRef(true);

  const tabBarStyle = {
    position: 'absolute',
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
    paddingTop: 15,
    height: 70 + insets.bottom,
  };

  // Reset tab bar when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      // Get the tab navigator (direct parent)
      const tabNavigator = navigation.getParent();
      if (tabNavigator) {
        tabNavigator.setOptions({
          tabBarStyle: tabBarStyle,
        });
      }
      isTabBarVisible.current = true;
      lastOffset.current = 0;
    }, [navigation, insets.bottom])
  );

  const onScroll = useCallback((event) => {
    const currentOffset = event.nativeEvent.contentOffset.y;
    const diff = currentOffset - lastOffset.current;

    // Ignore very small movements
    if (Math.abs(diff) < 1) {
      return;
    }

    // Get the tab navigator (direct parent)
    const tabNavigator = navigation.getParent();

    // Don't hide tab bar if we're at the top
    if (currentOffset <= 0) {
      if (!isTabBarVisible.current && tabNavigator) {
        tabNavigator.setOptions({
          tabBarStyle: tabBarStyle,
        });
        isTabBarVisible.current = true;
      }
      lastOffset.current = currentOffset;
      return;
    }

    // Scrolling DOWN (content going up) - HIDE tab bar
    if (diff > 0 && isTabBarVisible.current && tabNavigator) {
      tabNavigator.setOptions({
        tabBarStyle: {
          display: 'none',
        },
      });
      isTabBarVisible.current = false;
    }
    // Scrolling UP (content going down) - SHOW tab bar
    else if (diff < 0 && !isTabBarVisible.current && tabNavigator) {
      tabNavigator.setOptions({
        tabBarStyle: tabBarStyle,
      });
      isTabBarVisible.current = true;
    }

    lastOffset.current = currentOffset;
  }, [navigation, insets.bottom]);

  return { onScroll, insets };
};

export default useTabBarScroll;