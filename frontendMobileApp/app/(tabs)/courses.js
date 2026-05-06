import React, { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  Platform,
} from "react-native";
import Animated, { FadeInUp, FadeInDown } from "react-native-reanimated";
import RNPickerSelect from "react-native-picker-select";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, RADIUS, SPACING, TYPO } from "../../src/theme/theme";
import { getCourses, deleteCourse } from "../../src/services/coursesService";
import { router, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";

const DEPARTMENT_ITEMS = [
  { label: "Computer Science", value: "Computer Science" },
  { label: "Mathematics", value: "Mathematics" },
  { label: "Statistics", value: "Statistics" },
];

const YEAR_ITEMS = [
  { label: "Year 1", value: 1 },
  { label: "Year 2", value: 2 },
  { label: "Year 3", value: 3 },
  { label: "Year 4", value: 4 },
];

export default function CoursesScreen() {
  const [courses, setCourses] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [department, setDepartment] = useState(null);
  const [year, setYear] = useState(null);
  const [search, setSearch] = useState("");

  useFocusEffect(
    useCallback(() => {
      const fetchCourses = async () => {
        try {
          const res = await getCourses();
          setCourses(res);
          const token = await AsyncStorage.getItem("token");
          if (token) {
            const decodedToken = jwtDecode(token);
            setIsAdmin(decodedToken.role === "teacher");
          }
        } catch (err) {
          console.error("Failed to load courses:", err);
        }
      };
      fetchCourses();
    }, []),
  );

  const isClearing = useRef(false);

  const handleClear = () => {
    isClearing.current = true;
    setSearch("");
    setDepartment(null);
    setYear(null);
    // Ignore the immediate auto-correct fired by pickers without placeholders
    setTimeout(() => {
      isClearing.current = false;
    }, 100);
  };

  const filteredCourses = courses.filter((course) => {
    if (search) {
      const text = search.toLowerCase();
      const matches =
        course.title.toLowerCase().includes(text) ||
        course.courseCode.toLowerCase().includes(text);

      if (!matches) return false;
    }

    if (department) {
      if (course.department !== department) return false;
    }

    if (year) {
      if (course.year !== year) return false;
    }

    return true;
  });

  const handleDelete = (courseCode, title) => {
    Alert.alert(
      "Delete Course",
      `Are you sure you want to delete "${title}"?\nThis cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteCourse(courseCode);
              setCourses((prev) =>
                prev.filter((c) => c.courseCode !== courseCode),
              );
            } catch (err) {
              Alert.alert("Error", err.message || "Failed to delete course.");
            }
          },
        },
      ],
    );
  };

  const renderCourse = ({ item, index }) => (
    <Animated.View entering={FadeInUp.delay(index * 100).duration(500).springify()}>
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        onPress={() =>
          router.push({
            pathname: "/courses/[courseCode]",
            params: { courseCode: item.courseCode },
          })
        }
      >
        <View style={styles.headerRow}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text numberOfLines={1} ellipsizeMode="tail" style={styles.title}>
              {item.title}
            </Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.courseCode}</Text>
          </View>
        </View>

        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>

        {isAdmin && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() =>
                router.push({
                  pathname: "/courses/editCourse",
                  params: { courseCode: item.courseCode },
                })
              }
            >
              <Ionicons name="create-outline" size={16} color={COLORS.authPrimary} />
              <Text style={styles.editText}>Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => handleDelete(item.courseCode, item.title)}
            >
              <Ionicons name="trash-outline" size={16} color={COLORS.error} />
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#052859', '#021024']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      />
      
      <View style={styles.headerContent}>
        <Animated.Text entering={FadeInDown.duration(600).springify()} style={styles.pageTitle}>
          My Courses
        </Animated.Text>
        <Animated.Text entering={FadeInDown.delay(100).duration(600).springify()} style={styles.pageSubtitle}>
          Discover and manage your study materials.
        </Animated.Text>

        <Animated.View entering={FadeInDown.delay(200).duration(600).springify()} style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={COLORS.authTextMuted} />
            <TextInput
              placeholder="Search course name or code..."
              placeholderTextColor={COLORS.authTextMuted}
              value={search}
              onChangeText={setSearch}
              style={styles.searchInput}
            />
          </View>
          {(search || department || year) && (
            <TouchableOpacity style={styles.clearBtn} onPress={handleClear}>
              <Ionicons name="close-circle" size={22} color={COLORS.error} />
            </TouchableOpacity>
          )}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).duration(600).springify()} style={styles.filtersContainer}>
          <View style={styles.filterWrapper}>
            <RNPickerSelect
              value={department}
              onValueChange={(value) => {
                if (!isClearing.current) setDepartment(value);
              }}
              onDonePress={() => {
                if (department === null) setDepartment(DEPARTMENT_ITEMS[0].value);
              }}
              items={DEPARTMENT_ITEMS}
              placeholder={{}}
              useNativeAndroidPickerStyle={false}
            >
              <View style={styles.pickerCustomChild}>
                <Text style={[styles.pickerCustomText, !department && { color: COLORS.authTextMuted }]}>
                  {department ? department : "All Departments"}
                </Text>
                <Ionicons name="chevron-down" size={18} color={COLORS.authPrimary} />
              </View>
            </RNPickerSelect>
          </View>

          <View style={styles.filterWrapper}>
            <RNPickerSelect
              value={year}
              onValueChange={(value) => {
                if (!isClearing.current) setYear(value);
              }}
              onDonePress={() => {
                if (year === null) setYear(YEAR_ITEMS[0].value);
              }}
              items={YEAR_ITEMS}
              placeholder={{}}
              useNativeAndroidPickerStyle={false}
            >
              <View style={styles.pickerCustomChild}>
                <Text style={[styles.pickerCustomText, !year && { color: COLORS.authTextMuted }]}>
                  {year ? `Year ${year}` : "All Years"}
                </Text>
                <Ionicons name="chevron-down" size={18} color={COLORS.authPrimary} />
              </View>
            </RNPickerSelect>
          </View>
        </Animated.View>
      </View>

      <Animated.FlatList
        data={filteredCourses}
        keyExtractor={(item) => item._id}
        renderItem={renderCourse}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />

      {isAdmin && (
        <Animated.View entering={FadeInUp.delay(600).duration(600).springify()} style={styles.fabContainer}>
          <TouchableOpacity
            style={styles.fab}
            onPress={() => router.push("/courses/addCourse")}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={['#2b8cee', '#1e66b8']}
              style={styles.fabGradient}
            >
              <Ionicons name="add" size={32} color="white" />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.authBg,
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 280,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  headerContent: {
    padding: SPACING.lg,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: SPACING.sm,
  },
  pageTitle: {
    fontSize: 28,
    fontFamily: "PlusJakartaSans_800ExtraBold",
    color: COLORS.white,
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 15,
    fontFamily: "PlusJakartaSans_500Medium",
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: SPACING.xl,
  },
  searchSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.button,
    paddingHorizontal: 16,
    height: 50,
    shadowColor: COLORS.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  searchInput: {
    marginLeft: 10,
    flex: 1,
    fontSize: 15,
    fontFamily: "PlusJakartaSans_500Medium",
    color: COLORS.authTextMain,
  },
  clearBtn: {
    marginLeft: 12,
    backgroundColor: COLORS.white,
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  filtersContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  filterWrapper: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.button,
    shadowColor: COLORS.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  listContent: {
    padding: SPACING.lg,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    borderRadius: RADIUS.card,
    marginBottom: 16,
    shadowColor: COLORS.navy,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 15,
    elevation: 4,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontFamily: "PlusJakartaSans_800ExtraBold",
    color: COLORS.authTextMain,
  },
  badge: {
    backgroundColor: COLORS.authInputBg,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  badgeText: {
    color: COLORS.authPrimary,
    fontSize: 12,
    fontFamily: "PlusJakartaSans_800ExtraBold",
  },
  description: {
    marginTop: 10,
    color: COLORS.authTextMuted,
    fontSize: 14,
    fontFamily: "PlusJakartaSans_500Medium",
    lineHeight: 22,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.authInputBorder,
  },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.authInputBg,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: `${COLORS.error}15`,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  editText: {
    fontSize: 13,
    fontFamily: "PlusJakartaSans_700Bold",
    color: COLORS.authPrimary,
  },
  deleteText: {
    fontSize: 13,
    fontFamily: "PlusJakartaSans_700Bold",
    color: COLORS.error,
  },
  fabContainer: {
    position: "absolute",
    right: 24,
    bottom: 30,
  },
  fab: {
    width: 64,
    height: 64,
    borderRadius: 32,
    shadowColor: COLORS.authPrimary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    overflow: "hidden",
  },
  fabGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  pickerCustomChild: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  pickerCustomText: {
    fontSize: 14,
    fontFamily: "PlusJakartaSans_700Bold",
    color: COLORS.authTextMain,
    flex: 1,
  },
});


