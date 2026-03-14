import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { COLORS, RADIUS, SPACING, TYPO } from "../../src/theme/theme";
import { getCourse, updateCourse } from "../../src/services/coursesService";

export default function EditCourseScreen() {
  const { courseCode } = useLocalSearchParams();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const course = await getCourse(courseCode);
        setTitle(course.title);
        setDescription(course.description);
      } catch (err) {
        setError(err.message || "Failed to load course details.");
      } finally {
        setLoadingData(false);
      }
    };
    fetchCourse();
  }, [courseCode]);

  const handleSave = async () => {
    setError("");
    if (!title.trim()) {
      return setError("Course title is required.");
    }
    if (!description.trim()) {
      return setError("Description is required.");
    }

    setSaving(true);
    try {
      await updateCourse(courseCode, title.trim(), description.trim());
      Alert.alert("Success", "Course updated successfully!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err) {
      setError(err.message || "Failed to update course.");
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
            disabled={saving}
          >
            <Feather name="arrow-left" size={22} color={COLORS.navy2} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.pageTitle}>Edit Course</Text>
            <Text style={styles.pageSubtitle}>{courseCode}</Text>
          </View>
        </View>

        {/* Body */}
        {loadingData ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={COLORS.navy2} />
            <Text style={styles.loadingText}>Loading course...</Text>
          </View>
        ) : (
          <View style={styles.card}>
            {/* Error */}
            {error ? (
              <View style={styles.errorBox}>
                <Feather name="alert-circle" size={15} color={COLORS.error} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Title */}
            <Text style={styles.label}>Course Title</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. Introduction to React"
              placeholderTextColor={COLORS.muted}
              editable={!saving}
            />

            {/* Description */}
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Describe the course..."
              placeholderTextColor={COLORS.muted}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              editable={!saving}
            />

            {/* Buttons */}
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.btn, styles.btnSecondary]}
                onPress={() => router.back()}
                disabled={saving}
              >
                <Text style={styles.btnSecondaryText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.btn, styles.btnPrimary, saving && styles.btnDisabled]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Feather name="save" size={16} color="#fff" />
                    <Text style={styles.btnPrimaryText}>Save Changes</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  content: {
    paddingBottom: 40,
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

  centered: {
    paddingTop: 80,
    alignItems: "center",
    gap: SPACING.sm,
  },
  loadingText: {
    ...TYPO.body,
  },

  card: {
    margin: SPACING.lg,
    padding: SPACING.lg,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.card,
  },

  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFEBEE",
    padding: SPACING.sm,
    borderRadius: RADIUS.input,
    marginBottom: SPACING.md,
  },
  errorText: {
    flex: 1,
    color: COLORS.error,
    fontSize: 13,
  },

  label: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 8,
    marginTop: SPACING.md,
  },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.input,
    paddingHorizontal: SPACING.md,
    paddingVertical: 13,
    fontSize: 14,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  textArea: {
    height: 110,
    textAlignVertical: "top",
  },

  buttonRow: {
    flexDirection: "row",
    gap: SPACING.sm,
    marginTop: SPACING.lg,
  },
  btn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: RADIUS.button,
  },
  btnSecondary: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    flex: 0.8,
  },
  btnSecondaryText: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.muted,
  },
  btnPrimary: {
    backgroundColor: COLORS.navy2,
    flex: 1.2,
  },
  btnPrimaryText: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.white,
  },
  btnDisabled: {
    opacity: 0.6,
  },
});
