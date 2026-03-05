import React, { useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  useWindowDimensions,
} from "react-native";
import PagerView from "react-native-pager-view";
import { router } from "expo-router";
import { COLORS, RADIUS, SPACING, TYPO } from "../../src/theme/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Onboarding() {
  const pagerRef = useRef(null);
  const { width } = useWindowDimensions();
  const [page, setPage] = useState(0);

  const slides = useMemo(
    () => [
      {
        key: "slide1",
        title: "Access Course Materials",
        subtitle:
          "Browse notes, slides, and resources shared by students in your college.",
        image: require("../../assets/onboarding1.png"),
        buttonBg: COLORS.blueSoft,
        buttonText: COLORS.white,
      },
      {
        key: "slide2",
        title: "Practice with Smart Quizzes",
        subtitle:
          "Generate exam-style quizzes from the question bank and test your understanding.",
        image: require("../../assets/onboarding2.png"),
        buttonBg: COLORS.navy2,
        buttonText: COLORS.white,
      },
    ],
    [],
  );

  const goLogin = async () => {
    await AsyncStorage.setItem("hasSeenOnboarding", "true");
    router.replace("/auth/login");
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.sky }}>
      <View
        style={{
          paddingTop: SPACING.xl,
          paddingHorizontal: SPACING.lg,
          paddingBottom: SPACING.md,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Text style={[TYPO.label, { fontSize: 16, fontWeight: "800" }]}>
          Study With Me
        </Text>

        <TouchableOpacity onPress={goLogin} hitSlop={10}>
          <Text style={[TYPO.link, { fontSize: 14 }]}>Skip</Text>
        </TouchableOpacity>
      </View>

      <PagerView
        ref={pagerRef}
        style={{ flex: 1 }}
        initialPage={0}
        onPageSelected={(e) => setPage(e.nativeEvent.position)}
      >
        {slides.map((s, idx) => (
          <View key={s.key} style={{ flex: 1, paddingHorizontal: SPACING.lg }}>
            <View
              style={{
                marginTop: SPACING.md,
                borderRadius: RADIUS.card,
                backgroundColor: "rgba(255,255,255,0.55)",
                borderWidth: 1,
                borderColor: "rgba(2,16,36,0.08)",
                padding: SPACING.lg,
                alignItems: "center",
                justifyContent: "center",
                height: 320,
              }}
            >
              <Image
                source={s.image}
                resizeMode="contain"
                style={{ width: width * 0.65, height: 240 }}
              />
            </View>
            <View style={{ marginTop: SPACING.xl, alignItems: "center" }}>
              <Text style={[TYPO.h2, { textAlign: "center" }]}>{s.title}</Text>
              <Text
                style={[
                  TYPO.body,
                  { textAlign: "center", marginTop: SPACING.sm, maxWidth: 320 },
                ]}
              >
                {s.subtitle}
              </Text>
            </View>
            <View style={{ marginTop: "auto", paddingBottom: SPACING.xl }}>
              <Dots total={2} activeIndex={page} />

              {idx === slides.length - 1 && (
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={goLogin}
                  style={{
                    backgroundColor: COLORS.navy2,
                    borderRadius: RADIUS.button,
                    paddingVertical: 16,
                    alignItems: "center",
                    marginTop: SPACING.lg,
                  }}
                >
                  <Text style={[TYPO.button, { color: COLORS.white }]}>
                    Get Started
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}
      </PagerView>
    </View>
  );
}

function Dots({ total, activeIndex }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "center", gap: 10 }}>
      {Array.from({ length: total }).map((_, i) => {
        const isActive = i === activeIndex;
        return (
          <View
            key={i}
            style={{
              width: isActive ? 22 : 8,
              height: 8,
              borderRadius: 999,
              backgroundColor: isActive ? COLORS.blue : "rgba(2,16,36,0.25)",
            }}
          />
        );
      })}
    </View>
  );
}
