import React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { COLORS, RADIUS, SPACING, TYPO } from "../../src/theme/theme";
const courses = [
  {
    id: "1",
    title: "Mathematics",
    courseCode: "MATH101",
    description: "Introduction to algebra and basic mathematics."
  },
  {
    id: "2",
    title: "Physics",
    courseCode: "PHY101",
    description: "Basic concepts of mechanics and motion."
  },
  {
    id: "3",
    title: "Computer Science",
    courseCode: "CS101",
    description: "Introduction to programming and algorithms."
  }
];

export default function CoursesScreen() {

  const renderCourse = ({ item }) => (
    <View style={styles.card}>
      
      <View style={styles.headerRow}>
        <Text style={styles.title}>{item.title}</Text>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>{item.courseCode}</Text>
        </View>
      </View>

      <Text style={styles.description}>{item.description}</Text>

    </View>
  );

  return (
    <View style={styles.container}>

      <Text style={styles.pageTitle}>My Courses</Text>

      <FlatList
        data={courses}
        keyExtractor={(item) => item.id}
        renderItem={renderCourse}
        showsVerticalScrollIndicator={false}
      />

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    padding: 20,
    backgroundColor: COLORS.white,
  },

  pageTitle: 
   TYPO.h1
  ,

  card: {
    backgroundColor: "white",
    padding: 18,
    borderRadius: RADIUS.card,
    marginBottom: 16,

    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: 
   TYPO.h2
  ,

  badge: {
    backgroundColor: COLORS.blue,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },

  badgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },

  description: {
    marginTop: 10,
    color: COLORS.grey,
    fontSize: 14,
    lineHeight: 20,
  }

});