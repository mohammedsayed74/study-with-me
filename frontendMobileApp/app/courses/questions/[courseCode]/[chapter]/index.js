import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { COLORS, RADIUS, SPACING, TYPO } from "../../../../../src/theme/theme";

export default function LevelSelectionScreen() {
  const { courseCode, chapter } = useLocalSearchParams();

  const formattedChapter = chapter?.replace("-", " ");
  
  const levels = [
    { id: "easy", title: "Easy", color: "#10b981", icon: "sentiment-satisfied", description: "Basic concepts and straightforward questions to build confidence." },
    { id: "medium", title: "Medium", color: "#f59e0b", icon: "sentiment-neutral", description: "Balanced challenge focusing on application and logical reasoning." },
    { id: "hard", title: "Hard", color: "#ef4444", icon: "sentiment-dissatisfied", description: "Complex scenarios and advanced problems for mastery." }
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

      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
        <View style={styles.content}>
          {levels.map((level) => (
            <View key={level.id} style={styles.levelCard}>
              <View style={[styles.iconWrapper, { backgroundColor: level.color + '15' }]}>
                <MaterialIcons name={level.icon} size={32} color={level.color} />
              </View>
              <Text style={styles.levelTitle}>{level.title}</Text>
              <Text style={styles.levelDesc}>{level.description}</Text>
              <TouchableOpacity
                style={[styles.startBtn, { backgroundColor: level.color }]}
                onPress={() => router.push(`/courses/questions/${courseCode}/${chapter}/${level.id}`)}
              >
                <Text style={styles.startBtnText}>Practice {level.title}</Text>
                <Feather name="arrow-right" size={16} color={COLORS.white} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
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
    paddingBottom: 40,
    gap: SPACING.lg,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  levelCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.card,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: 'rgba(125, 160, 202, 0.15)',
    elevation: 2,
    shadowColor: COLORS.navy2,
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    alignItems: 'center',
    width: '100%',
  },
  iconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  levelTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#052859',
    marginBottom: 8,
  },
  levelDesc: {
    fontSize: 14,
    color: COLORS.muted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.xl,
  },
  startBtn: {
    width: '100%',
    padding: 16,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  startBtnText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 16,
  },
});
