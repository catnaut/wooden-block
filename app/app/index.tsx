import { Text, View, Pressable, Platform } from "react-native";
import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring,
  withSequence,
  Easing,
  withTiming,
  withDelay,
  runOnJS,
} from "react-native-reanimated";
import Svg, { Path, G } from "react-native-svg";
import { useSettings } from '../hooks/useSettings';
import { useSound } from '../hooks/useSound';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Button, ButtonIcon } from "@/components/ui/button";

// 生成随机数的辅助函数
const random = (min: number, max: number) => {
  return Math.random() * (max - min) + min;
};

// 获取点击数量对应的样式
const getClickStyle = (clickCount: number, isDark: boolean) => {
  if (clickCount >= 10) {
    return {
      text: `+${clickCount}`,
      color: isDark ? '#FF6B6B' : '#FF4444',
      scale: 1.5,
      fontSize: 28
    };
  } else if (clickCount >= 5) {
    return {
      text: `+${clickCount}`,
      color: isDark ? '#4ECDC4' : '#2A9D8F',
      scale: 1.3,
      fontSize: 24
    };
  } else if (clickCount >= 2) {
    return {
      text: `+${clickCount}`,
      color: isDark ? '#95E1D3' : '#2A9D8F',
      scale: 1.2,
      fontSize: 22
    };
  }
  return {
    text: '+1',
    color: isDark ? '#ffffff' : '#333333',
    scale: 1,
    fontSize: 20
  };
};

// 飘出的文字动画组件
const FloatingText = ({ 
  onComplete, 
  offset, 
  clickCount,
  isDark
}: { 
  onComplete: () => void, 
  offset: { x: number, y: number },
  clickCount: number,
  isDark: boolean
}) => {
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);
  const style = getClickStyle(clickCount, isDark);

  useEffect(() => {
    // 开始动画
    translateY.value = withSequence(
      withTiming(-60 + offset.y, {
        duration: 1200,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      }),
    );
    
    translateX.value = withSequence(
      withTiming(offset.x, {
        duration: 1200,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      }),
    );
    
    opacity.value = withSequence(
      withTiming(1, { duration: 100 }),
      withDelay(
        600,
        withTiming(0, {
          duration: 600,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        }, () => {
          runOnJS(onComplete)();
        })
      )
    );

    scale.value = withSequence(
      withTiming(style.scale * 1.2, { duration: 100 }),
      withTiming(style.scale, { duration: 200 }),
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
      { scale: scale.value }
    ],
    opacity: opacity.value,
    position: 'absolute',
    top: -20,
    width: '100%',
    alignItems: 'center',
    pointerEvents: 'none',
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Text style={{ 
        fontSize: style.fontSize, 
        color: style.color,
        fontWeight: 'bold',
      }}>
        {style.text}
      </Text>
    </Animated.View>
  );
};

export default function Index() {
  const router = useRouter();
  const { settings } = useSettings();
  const { playSound } = useSound();
  const [count, setCount] = useState(0);
  const scale = useSharedValue(1);
  const rotate = useSharedValue('0deg');
  const [floatingTexts, setFloatingTexts] = useState<Array<{ 
    id: number; 
    offset: { x: number; y: number };
    clickCount: number;
  }>>([]);
  
  // 用于防抖的状态
  const clickBuffer = useRef<{
    count: number;
    timeout: NodeJS.Timeout | null;
  }>({
    count: 0,
    timeout: null
  });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { rotate: rotate.value }
      ],
    };
  });

  const triggerAnimation = useCallback((clickCount: number) => {
    setCount(prev => prev + clickCount);
    
    // 触发震动（只在移动端且开启震动设置时）
    if (settings.vibration && Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    // 播放声音
    playSound();

    setFloatingTexts(prev => [...prev, {
      id: Date.now(),
      offset: {
        x: random(-30, 30),
        y: random(-20, 20)
      },
      clickCount
    }]);
    
    // 缩放动画
    scale.value = withSequence(
      withSpring(0.92, {
        damping: 10,
        mass: 0.6,
        stiffness: 100,
        overshootClamping: false,
        restDisplacementThreshold: 0.01,
        restSpeedThreshold: 2,
      }),
      withSpring(1.05, {
        damping: 8,
        mass: 0.5,
        stiffness: 100,
      }),
      withSpring(1, {
        damping: 12,
        mass: 0.5,
        stiffness: 100,
      })
    );

    // 旋转动画
    rotate.value = withSequence(
      withTiming('-1deg', {
        duration: 50,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      }),
      withTiming('1deg', {
        duration: 100,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      }),
      withTiming('0deg', {
        duration: 150,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      })
    );
  }, [settings, playSound]);

  const handlePress = useCallback(() => {
    clickBuffer.current.count += 1;
    
    // 清除之前的定时器
    if (clickBuffer.current.timeout) {
      clearTimeout(clickBuffer.current.timeout);
    }
    
    // 设置新的定时器
    clickBuffer.current.timeout = setTimeout(() => {
      const clickCount = clickBuffer.current.count;
      clickBuffer.current.count = 0;
      triggerAnimation(clickCount);
    }, 200);
  }, []);

  const handleFloatingComplete = useCallback((id: number) => {
    setFloatingTexts(prev => prev.filter(item => item.id !== id));
  }, []);

  return (
    <View className={`flex-1 ${settings.theme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-[#f7f7f7]'}`}>
      <Button
        className="absolute top-5 left-5 rounded-xl p-2 w-12 h-12"
        onPress={() => router.push('/settings')}
        size="lg"
      >
        <ButtonIcon as={SettingIcon} />
      </Button>

      <View className="flex-1 justify-center items-center -mt-20">
        <View className="items-center mb-10">
          <Text className={`text-xl font-medium tracking-[0.5px] mb-2 ${
            settings.theme === 'dark' ? 'text-white/60' : 'text-black/60'
          }`}>
            功德
          </Text>
          <Text className={`text-[64px] font-bold tracking-[-1px] ${
            settings.theme === 'dark' ? 'text-white' : 'text-black'
          }`}>
            {count}
          </Text>
        </View>

        <Pressable 
          onPress={handlePress}
          className="p-5 rounded-[32px] mt-5"
        >
          <View className="relative">
            {floatingTexts.map(({ id, offset, clickCount }) => (
              <FloatingText 
                key={id} 
                offset={offset}
                clickCount={clickCount}
                isDark={settings.theme === 'dark'}
                onComplete={() => handleFloatingComplete(id)} 
              />
            ))}
            <Animated.View style={[animatedStyle]}>
              <Svg width={200} height={160} viewBox="0 0 247 197">
                <G id="#eeeeeeff">
                  <Path
                    fill={settings.theme === 'dark' ? "#eeeeee" : "#333333"}
                    opacity="1.00"
                    d="M 109.12 6.53 C 124.09 4.27 139.37 2.82 154.47 4.79 C 173.07 7.14 191.38 14.02 206.02 25.89 C 217.01 34.77 225.17 46.63 231.55 59.13 C 237.81 72.25 241.16 86.53 243.92 100.74 C 225.49 104.75 206.58 105.76 187.77 106.20 C 186.21 100.02 183.12 93.94 177.74 90.25 C 172.00 85.96 163.98 84.19 157.26 87.18 C 145.99 91.69 139.62 105.22 142.63 116.85 C 145.12 127.39 154.97 136.11 166.05 135.69 C 176.18 134.97 184.61 126.81 187.19 117.22 C 192.74 116.73 198.32 116.63 203.89 116.32 C 217.57 115.26 231.14 113.14 244.82 111.98 C 245.52 121.28 246.13 130.75 244.11 139.94 C 242.32 149.02 239.23 158.07 233.39 165.39 C 224.88 176.55 212.15 183.64 199.01 187.98 C 187.42 191.86 175.20 193.41 163.05 194.29 C 140.40 195.87 117.64 195.62 94.99 194.19 C 74.79 192.81 54.55 190.78 34.79 186.17 C 27.91 184.54 21.07 182.47 14.77 179.21 C 8.58 175.93 4.23 169.71 2.72 162.92 C -0.48 151.41 3.00 139.09 9.20 129.21 C 14.61 119.75 27.61 116.88 30.81 105.83 C 35.50 90.01 37.28 73.40 42.87 57.82 C 47.56 45.36 54.34 33.26 64.82 24.75 C 77.25 14.19 93.24 9.04 109.12 6.53 Z"
                  />
                </G>
              </Svg>
            </Animated.View>
          </View>
        </Pressable>
      </View>
    </View>
  );
}

const SettingIcon = () => {
  const { settings } = useSettings();

  return (
    <Ionicons name="settings-outline" size={24} color={settings.theme === 'dark' ? 'white' : 'black'} />
  )
}