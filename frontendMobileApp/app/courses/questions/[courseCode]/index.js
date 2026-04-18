import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { COLORS, RADIUS, SPACING, TYPO } from "../../../../src/theme/theme";

export default function ChapterSelectionScreen() {
  const { courseCode } = useLocalSearchParams();

  const chapters = [
    { id: "chapter-1", title: "Chapter 1 Practice" },
    { id: "chapter-2", title: "Chapter 2 Practice" },
    { id: "chapter-3", title: "Chapter 3 Practice" },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color={COLORS.navy2} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.pageTitle}>Question Bank</Text>
          <Text style={styles.pageSubtitle}>{courseCode}</Text>
        </View>
      </View>

      <View style={styles.content}>
        {chapters.map((chapter) => (
          <TouchableOpacity
            key={chapter.id}
            style={styles.chapterBtn}
            onPress={() => router.push(`/courses/questions/${courseCode}/${chapter.id}`)}
          >
            <Text style={styles.chapterBtnText}>{chapter.title}</Text>
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
  },
  pageSubtitle: {
    ...TYPO.body,
    marginTop: 2,
  },
  content: {
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  chapterBtn: {
    backgroundColor: COLORS.navy2,
    padding: SPACING.lg,
    borderRadius: RADIUS.button,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  chapterBtnText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "700",
  },
});
