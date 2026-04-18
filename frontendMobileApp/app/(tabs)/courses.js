import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
} from "react-native";
import RNPickerSelect from "react-native-picker-select";
import { COLORS, RADIUS, SPACING, TYPO } from "../../src/theme/theme";
import { getCourses, deleteCourse } from "../../src/services/coursesService";
import { Feather } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";

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
          const decodedToken = jwtDecode(token);
          setIsAdmin(decodedToken.role === "teacher");
        } catch (err) {
          console.error("Failed to load courses:", err);
        }
      };
      fetchCourses();
    }, [])
  );
  const handleClear = () => {
    setSearch("");
    setDepartment(null);
    setYear(null);
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
                prev.filter((c) => c.courseCode !== courseCode)
              );
            } catch (err) {
              Alert.alert("Error", err.message || "Failed to delete course.");
            }
          },
        },
      ]
    );
  };

  const renderCourse = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.75}
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
            <Feather name="edit" size={16} color={COLORS.navy2} />
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => handleDelete(item.courseCode, item.title)}
          >
            <Feather name="trash-2" size={16} color="red" />
            <Text style={styles.deleteText}>Delete</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.pageTitle}>My Courses</Text>
      <View style={{ flexDirection: "row"}}>
        <View style={styles.searchContainer}>
        <Feather name="search" size={18} color="#999" />

        <TextInput
          placeholder="Course name or code"
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />
        
      </View>
        {(search || department || year) && (
          <TouchableOpacity style={styles.clearBtn} onPress={handleClear}>
            <Feather name="x" size={18} color="red" />
            <Text style={styles.clearText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      
      <View style={styles.filtersContainer}>
        <View style={{ flex: 0.48 }}>
          <RNPickerSelect
            value={department}
            onValueChange={(value) => setDepartment(value)}
            placeholder={{ label: "All Departments", value: null }}
            items={[
              { label: "Computer Science", value: "Computer Science" },
              { label: "Mathematics", value: "Mathematics" },
              { label: "Statistics", value: "Statistics" },
            ]}
            style={pickerSelectStyles}
            useNativeAndroidPickerStyle={false}
            Icon={() => <Feather name="chevron-down" size={18} />}
          />
        </View>

        <View style={{ flex: 0.48 }}>
          <RNPickerSelect
            value={year}
            onValueChange={(value) => setYear(value)}
            placeholder={{ label: "All Years", value: null }}
            items={[
              { label: "Year 1", value: 1 },
              { label: "Year 2", value: 2 },
              { label: "Year 3", value: 3 },
              { label: "Year 4", value: 4 },
            ]}
            style={pickerSelectStyles}
            useNativeAndroidPickerStyle={false}
            Icon={() => <Feather name="chevron-down" size={18} />}
          />
        </View>
      </View>
      <FlatList
        data={filteredCourses}
        keyExtractor={(item) => item._id}
        renderItem={renderCourse}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      {isAdmin && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push("/courses/addCourse")}
        >
          <Feather name="plus" size={28} color="white" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: COLORS.white,
  },

  pageTitle: TYPO.h1,

  card: {
    backgroundColor: COLORS.card,
    padding: 18,
    borderRadius: RADIUS.card,
    marginBottom: 16,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: TYPO.h2,

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
  },

  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },

  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.white,
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },

  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.white,
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 30,
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },

  editText: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.navy2,
  },

  deleteText: {
    fontSize: 15,
    fontWeight: "600",
    color: "red",
  },

  fab: {
    position: "absolute",
    right: 20,
    bottom: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.navy2,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  filtersContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 15,
  },

  filterBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flex: 0.48,
    borderWidth: 1,
    borderColor: "#ddd",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 25,
    backgroundColor: "#f8f8f8",
  },

  filterText: {
    fontSize: 14,
    fontWeight: "500",
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginTop: 10,
  },

  searchInput: {
    marginLeft: 10,
    flex: 1,
    fontSize: 14,
  },
  clearBtn: {
    flexDirection: "row",
    width: 80,
    marginHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#eddada",
    paddingVertical: 12,
    borderRadius: 25,
    borderColor:"red",
    borderWidth:1,
    marginTop: 10,
    gap: 6,
  },

  clearText: {
    color: "red",
    fontWeight: "600",
    fontSize: 14,
  },
});
const pickerSelectStyles = {
  inputIOS: {
    backgroundColor: "#f8f8f8",
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    color: "#000",
    paddingRight: 30,
  },
  inputAndroid: {
    backgroundColor: "#f8f8f8",
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    color: "#000",
    paddingRight: 30,
  },
  iconContainer: {
    top: 12,
    right: 12,
  },
};