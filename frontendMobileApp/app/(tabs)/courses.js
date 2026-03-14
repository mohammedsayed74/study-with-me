import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { COLORS, RADIUS, SPACING, TYPO } from "../../src/theme/theme";
import { getCourses } from "../../src/services/coursesService";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
export default function CoursesScreen() {
  const [courses, setCourses] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    const fetchCourses = async () => {
      const res = await getCourses();
      //console.log(res.data);
      setCourses(res);
      let token = await AsyncStorage.getItem("token");
      const decodedToken = jwtDecode(token);
      setIsAdmin(decodedToken.role == "teacher");
      //console.log(decodedToken.role);
    };

    fetchCourses();
  }, []);

  const renderCourse = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={{ width: 200 }}>
          <Text numberOfLines={1} ellipsizeMode="tail" style={styles.title}>
            {item.title}
          </Text>
        </View>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>{item.courseCode}</Text>
        </View>
      </View>

      <Text style={styles.description}>{item.description}</Text>

      {isAdmin && (
        <View style={styles.actions}>
          <TouchableOpacity style={styles.editBtn}>
            <Feather name="edit" size={18} color={COLORS.navy2} />
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.deleteBtn}>
            <Feather name="trash-2" size={18} color="red" />
            <Text style={styles.deleteText}>Delete</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.pageTitle}>My Courses</Text>

      <FlatList
        data={courses}
        keyExtractor={(item) => item._id}
        renderItem={renderCourse}
        showsVerticalScrollIndicator={false}
      />
      {isAdmin && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => {
            router.push("/courses/addCourse");
          }}
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
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.navy2,
  },

  deleteText: {
    fontSize: 16,
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
});
