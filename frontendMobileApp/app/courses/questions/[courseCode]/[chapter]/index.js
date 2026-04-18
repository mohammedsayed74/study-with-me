import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { COLORS, RADIUS, SPACING, TYPO } from "../../../../../src/theme/theme";

export default function LevelSelectionScreen() {
  const { courseCode, chapter } = useLocalSearchParams();

  const formattedChapter = chapter?.replace("-", " ");
  
  const levels = [
    { id: "easy", title: "Easy" },
    { id: "medium", title: "Medium" },
    { id: "hard", title: "Hard" },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color={COLORS.navy2} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.pageTitle}>{formattedChapter} Levels</Text>
          <Text style={styles.pageSubtitle}>{courseCode}</Text>
        </View>
      </View>

      <View style={styles.content}>
        {levels.map((level) => (
          <TouchableOpacity
            key={level.id}
            style={styles.levelBtn}
            onPress={() => router.push(`/courses/questions/${courseCode}/${chapter}/${level.id}`)}
          >
            <Text style={styles.levelBtnText}>{level.title}</Text>
            <Feather name="chevron-right" size={20} color={COLORS.white} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    paddingTop: 60,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: SPACING.sm,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.card,
    justifyContent: "center",
    alignItems: "center",
  },
  pageTitle: {
    ...TYPO.h2,
    fontSize: 20,
    textTransform: 'capitalize'
  },
  pageSubtitle: {
    ...TYPO.body,
    marginTop: 2,
  },
  content: {
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  levelBtn: {
    backgroundColor: COLORS.navy2,
    padding: SPACING.lg,
    borderRadius: RADIUS.button,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  levelBtnText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "700",
  },
});
