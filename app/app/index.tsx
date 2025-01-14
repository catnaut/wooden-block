import { Text, View, Pressable, Platform } from "react-native";
import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
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
import { useSettings } from "../hooks/useSettings";
import { useSound } from "../hooks/useSound";
import { useWebSocket } from "../hooks/useWebSocket";
import Ionicons from "@expo/vector-icons/Ionicons";

// 生成随机数的辅助函数
const random = (min: number, max: number) => {
  return Math.random() * (max - min) + min;
};

// 获取点击数量对应的样式
const getClickStyle = (
  clickCount: number,
  isDark: boolean,
  isOthersClick: boolean = false
) => {
  if (isOthersClick) {
    return {
      text: `+${clickCount}`,
      color: isDark ? "rgba(255, 255, 255, 0.4)" : "rgba(0, 0, 0, 0.3)", // 半透明的白色/黑色
      scale: 0.9,
      fontSize: 18,
      fontStyle: "normal" as const,
    };
  }

  if (clickCount >= 10) {
    return {
      text: `+${clickCount}`,
      color: isDark ? "#FF6B6B" : "#FF4444",
      scale: 1.5,
      fontSize: 28,
      fontStyle: "normal" as const,
    };
  } else if (clickCount >= 5) {
    return {
      text: `+${clickCount}`,
      color: isDark ? "#4ECDC4" : "#2A9D8F",
      scale: 1.3,
      fontSize: 24,
      fontStyle: "normal" as const,
    };
  } else if (clickCount >= 2) {
    return {
      text: `+${clickCount}`,
      color: isDark ? "#95E1D3" : "#2A9D8F",
      scale: 1.2,
      fontSize: 22,
      fontStyle: "normal" as const,
    };
  }
  return {
    text: "+1",
    color: isDark ? "#ffffff" : "#333333",
    scale: 1,
    fontSize: 20,
    fontStyle: "normal" as const,
  };
};

// 飘出的文字动画组件
const FloatingText = ({
  onComplete,
  offset,
  clickCount,
  isDark,
  isOthersClick = false,
}: {
  onComplete: () => void;
  offset: { x: number; y: number };
  clickCount: number;
  isDark: boolean;
  isOthersClick?: boolean;
}) => {
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);
  const style = getClickStyle(clickCount, isDark, isOthersClick);

  useEffect(() => {
    // 开始动画
    translateY.value = withSequence(
      withTiming(-60 + offset.y, {
        duration: 1200,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      })
    );

    translateX.value = withSequence(
      withTiming(offset.x, {
        duration: 1200,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      })
    );

    opacity.value = withSequence(
      withTiming(1, { duration: 100 }),
      withDelay(
        600,
        withTiming(
          0,
          {
            duration: 600,
            easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          },
          () => {
            runOnJS(onComplete)();
          }
        )
      )
    );

    scale.value = withSequence(
      withTiming(style.scale * 1.2, { duration: 100 }),
      withTiming(style.scale, { duration: 200 })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
    position: "absolute",
    top: -20,
    width: "100%",
    alignItems: "center",
    pointerEvents: "none",
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Text
        style={{
          fontSize: style.fontSize,
          color: style.color,
          fontWeight: "bold",
          fontStyle: style.fontStyle,
        }}
      >
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
  const rotate = useSharedValue("0deg");
  const [floatingTexts, setFloatingTexts] = useState<
    Array<{
      id: number;
      offset: { x: number; y: number };
      clickCount: number;
      isOthersClick: boolean;
    }>
  >([]);

  // 用于防抖的状态
  const clickBuffer = useRef<{
    count: number;
    timeout: NodeJS.Timeout | null;
  }>({
    count: 0,
    timeout: null,
  });

  const handleTotalClicksUpdate = useCallback((total: number) => {
    console.log("handleTotalClicksUpdate:", total);
    setCount(total);
  }, []);

  const handleOthersClick = useCallback(() => {
    console.log("handleOthersClick");
    triggerAnimation(1, true, true);
    setCount((total) => total + 1);
  }, []);

  // WebSocket 集成
  const { addClick } = useWebSocket(
    handleTotalClicksUpdate,
    handleOthersClick
  );

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }, { rotate: rotate.value }],
    };
  });

  const triggerAnimation = useCallback(
    (
      clickCount: number,
      showNumber: boolean = true,
      isOthersClick: boolean = false
    ) => {
      // 触发震动（只在移动端且开启震动设置时）
      if (Platform.OS !== "web" && settings.vibration) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      // 播放声音
      playSound();

      // 只在显示数字时添加浮动文字
      if (showNumber) {
        setFloatingTexts((prev) => [
          ...prev,
          {
            id: Math.random() * 1000000000,
            offset: {
              x: random(-30, 30),
              y: random(-20, 20),
            },
            clickCount,
            isOthersClick,
          },
        ]);
      }

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
        withTiming("-1deg", {
          duration: 50,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        }),
        withTiming("1deg", {
          duration: 100,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        }),
        withTiming("0deg", {
          duration: 150,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        })
      );
    },
    [settings, playSound, scale, rotate, setFloatingTexts]
  );

  const handlePress = useCallback(() => {
    clickBuffer.current.count += 1;

    // 立即触发动画，但不显示数字
    triggerAnimation(1, false);

    // 添加到 WebSocket 队列
    addClick();

    // 清除之前的定时器
    if (clickBuffer.current.timeout) {
      clearTimeout(clickBuffer.current.timeout);
    }

    // 设置新的定时器
    clickBuffer.current.timeout = setTimeout(() => {
      const clickCount = clickBuffer.current.count;
      clickBuffer.current.count = 0;
      // 最后一次点击结束后，显示总数
      if (clickCount > 0) {
        // 本地立刻修改
        setCount((prev) => prev + clickCount);
        triggerAnimation(clickCount, true);
      }
    }, 200);
  }, [triggerAnimation, addClick]);

  const handleFloatingComplete = useCallback((id: number) => {
    setFloatingTexts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  return (
    <View
      className={`flex-1 ${
        settings.theme === "dark" ? "bg-[#1a1a1a]" : "bg-[#f7f7f7]"
      }`}
    >
      <View className="flex-1 items-center justify-center">
        {/* Settings Button */}
        <View className="absolute right-4 top-14">
          <Pressable
            onPress={() => router.push("/settings")}
            className="p-2 rounded-full active:opacity-70"
            style={({ pressed }) => [
              pressed && Platform.OS === "ios" ? { opacity: 0.7 } : {},
            ]}
          >
            <Ionicons
              name="settings-outline"
              size={24}
              color={settings.theme === "dark" ? "#fff" : "#000"}
            />
          </Pressable>
        </View>

        <View className="items-center mb-10">
          <Text
            className={`text-xl font-medium tracking-[0.5px] mb-2 ${
              settings.theme === "dark" ? "text-white/60" : "text-black/60"
            }`}
          >
            功德
          </Text>
          <Text
            className={`text-[64px] font-bold tracking-[-1px] ${
              settings.theme === "dark" ? "text-white" : "text-black"
            }`}
          >
            {count}
          </Text>
        </View>

        <Pressable onPress={handlePress} className="p-5 rounded-[32px] mt-5">
          <View className="relative">
            {floatingTexts.map(({ id, offset, clickCount, isOthersClick }) => (
              <FloatingText
                key={id}
                onComplete={() => handleFloatingComplete(id)}
                offset={offset}
                clickCount={clickCount}
                isDark={settings.theme === "dark"}
                isOthersClick={isOthersClick}
              />
            ))}
            <Animated.View style={[animatedStyle]}>
              <Svg width={200} height={160} viewBox="0 0 247 197">
                <G id="#eeeeeeff">
                  <Path
                    fill={settings.theme === "dark" ? "#eeeeee" : "#333333"}
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
    <Ionicons
      name="settings-outline"
      size={24}
      color={settings.theme === "dark" ? "white" : "black"}
    />
  );
};
