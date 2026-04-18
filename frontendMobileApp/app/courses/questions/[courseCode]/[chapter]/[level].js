import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import { COLORS } from "../../../../../src/theme/theme";
import TeacherQuizManager from "../../../../../src/components/TeacherQuizManager";
import StudentQuiz from "../../../../../src/components/StudentQuiz";

export default function QuizAreaScreen() {
  const { courseCode, chapter, level } = useLocalSearchParams();
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRole = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (token) {
          const decodedToken = jwtDecode(token);
          setUserRole(decodedToken.role);
        } else {
          router.replace("/auth/login");
        }
      } catch (err) {
        console.error("Error decoding token", err);
      } finally {
        setLoading(false);
      }
    };
    loadRole();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.navy2} />
      </View>
    );
  }

  if (!userRole) {
    return null; 
  }

  return (
    <View style={styles.container}>
      {userRole === "teacher" || userRole === "doctor" ? (
        <TeacherQuizManager courseCode={courseCode} chapter={chapter} level={level} />
      ) : (
        <StudentQuiz courseCode={courseCode} chapter={chapter} level={level} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: COLORS.white }
});
