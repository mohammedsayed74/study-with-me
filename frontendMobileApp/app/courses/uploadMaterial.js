import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Feather } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import { COLORS, RADIUS, SPACING, TYPO } from "../../src/theme/theme";
import { uploadMaterial } from "../../src/services/materialsService";

export default function UploadMaterialScreen() {
  const { courseCode } = useLocalSearchParams();

  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null); // { uri, name, size }
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  const handlePickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const picked = result.assets[0];
      setFile({ uri: picked.uri, name: picked.name, size: picked.size });
      setFeedback({ type: "", message: "" });
    } catch {
      Alert.alert("Error", "Could not open file picker.");
    }
  };

  const handleUpload = async () => {
    setFeedback({ type: "", message: "" });

    if (!title.trim()) {
      return setFeedback({
        type: "error",
        message: "Please provide a material title.",
      });
    }
    if (!file) {
      return setFeedback({
        type: "error",
        message: "Please select a PDF file.",
      });
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const decoded = jwtDecode(token);
      const isTeacher = decoded.role === "teacher";

      const result = await uploadMaterial(
        courseCode,
        title.trim(),
        file.uri,
        file.name,
      );

      const successMsg = isTeacher
        ? "Material uploaded and approved successfully!"
        : "Material uploaded! It is pending teacher approval.";

      Alert.alert("Success", successMsg, [
        {
          text: "OK",
          onPress: () =>
            router.replace({
              pathname: "/courses/[courseCode]",
              params: { courseCode },
            }),
        },
      ]);
    } catch (err) {
      setFeedback({
        type: "error",
        message: err.message || "An error occurred during upload.",
      });
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={handleCancel}
          disabled={loading}
        >
          <Feather name="arrow-left" size={22} color={COLORS.navy2} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.pageTitle}>Upload Material</Text>
          <Text style={styles.pageSubtitle}>to {courseCode}</Text>
        </View>
      </View>

      <View style={styles.card}>
        {/* Feedback */}
        {feedback.message ? (
          <View
            style={[
              styles.feedbackBox,
              feedback.type === "error"
                ? styles.feedbackError
                : styles.feedbackSuccess,
            ]}
          >
            <Feather
              name={feedback.type === "error" ? "alert-circle" : "check-circle"}
              size={16}
              color={feedback.type === "error" ? COLORS.error : COLORS.success}
            />
            <Text
              style={[
                styles.feedbackText,
                {
                  color:
                    feedback.type === "error" ? COLORS.error : COLORS.success,
                },
              ]}
            >
              {feedback.message}
            </Text>
          </View>
        ) : null}

        <Text style={styles.label}>Material Title</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Chapter 1 Notes"
          placeholderTextColor={COLORS.muted}
          value={title}
          onChangeText={setTitle}
          editable={!loading}
          returnKeyType="done"
        />

        <Text style={styles.label}>PDF File</Text>
        <TouchableOpacity
          style={[styles.filePicker, file && styles.filePickerFilled]}
          onPress={handlePickFile}
          disabled={loading}
          activeOpacity={0.7}
        >
          <View style={styles.filePickerInner}>
            <Feather
              name={file ? "file-text" : "upload-cloud"}
              size={26}
              color={file ? COLORS.navy2 : COLORS.blue}
            />
            {file ? (
              <View style={{ flex: 1 }}>
                <Text
                  style={styles.fileName}
                  numberOfLines={1}
                  ellipsizeMode="middle"
                >
                  {file.name}
                </Text>
                <Text style={styles.fileSize}>{formatFileSize(file.size)}</Text>
              </View>
            ) : (
              <Text style={styles.filePickerHint}>
                Tap to select a PDF file
              </Text>
            )}
            {file && (
              <Feather name="refresh-cw" size={14} color={COLORS.muted} />
            )}
          </View>
        </TouchableOpacity>

        {/* Info note for students */}
        <View style={styles.infoBox}>
          <Feather name="info" size={14} color={COLORS.blue} />
          <Text style={styles.infoText}>
            Student uploads will be reviewed by a teacher before becoming
            visible to everyone.
          </Text>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.btn, styles.btnSecondary]}
            onPress={handleCancel}
            disabled={loading}
          >
            <Text style={styles.btnSecondaryText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.btn,
              styles.btnPrimary,
              loading && styles.btnDisabled,
            ]}
            onPress={handleUpload}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Feather name="send" size={16} color="#fff" />
                <Text style={styles.btnPrimaryText}>Upload</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
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

  card: {
    margin: SPACING.lg,
    padding: SPACING.lg,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.card,
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

  filePicker: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.input,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderStyle: "dashed",
    padding: SPACING.md,
  },
  filePickerFilled: {
    borderStyle: "solid",
    borderColor: COLORS.navy2,
  },
  filePickerInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  filePickerHint: {
    flex: 1,
    fontSize: 14,
    color: COLORS.muted,
  },
  fileName: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.text,
  },
  fileSize: {
    fontSize: 11,
    color: COLORS.muted,
    marginTop: 2,
  },

  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "#EFF6FF",
    borderRadius: RADIUS.input,
    padding: SPACING.sm,
    marginTop: SPACING.md,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.blue,
    lineHeight: 18,
  },

  feedbackBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: SPACING.sm,
    borderRadius: RADIUS.input,
    marginBottom: SPACING.sm,
  },
  feedbackError: {
    backgroundColor: "#FFEBEE",
  },
  feedbackSuccess: {
    backgroundColor: "#E8F5E9",
  },
  feedbackText: {
    flex: 1,
    fontSize: 13,
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
