import React, { useState } from "react";
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
import { router } from "expo-router";
import { Ionicons, Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { COLORS, RADIUS, SPACING, TYPO } from "../../src/theme/theme";
import { API_BASE_URL } from "../../src/config/api";

const validatePassword = (pass) => {
  if (pass.length < 8) return "Password must be at least 8 characters long";
  if (pass.includes(" ")) return "Password cannot contain spaces";
  if (!/[A-Z]/.test(pass)) return "Password must contain at least one uppercase letter";
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(pass))
    return 'Password must contain at least one symbol (e.g., @, #)';
  return null;
};

export default function ResetPasswordScreen() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  const handleSubmit = async () => {
    setFeedback({ type: "", message: "" });

    if (!currentPassword || !newPassword || !confirmPassword) {
      return setFeedback({ type: "error", message: "All fields are required." });
    }
    if (newPassword !== confirmPassword) {
      return setFeedback({ type: "error", message: "New passwords do not match." });
    }
    const validationError = validatePassword(newPassword);
    if (validationError) {
      return setFeedback({ type: "error", message: validationError });
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/users/reset-password`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFeedback({ type: "error", message: data.message || "Something went wrong." });
        setLoading(false);
        return;
      }

      setFeedback({ type: "success", message: data.message || "Password updated successfully!" });
      setLoading(false);

      // Clear fields
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      // Navigate back after brief delay
      setTimeout(() => {
        router.back();
      }, 1800);
    } catch (err) {
      setFeedback({ type: "error", message: err.message || "Something went wrong." });
      setLoading(false);
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
            disabled={loading}
          >
            <Feather name="arrow-left" size={22} color={COLORS.navy2} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.pageTitle}>Reset Password</Text>
            <Text style={styles.pageSubtitle}>Update your security credentials</Text>
          </View>
        </View>

        <View style={styles.card}>
          {/* Feedback banner */}
          {feedback.message ? (
            <View
              style={[
                styles.feedbackBox,
                feedback.type === "error" ? styles.feedbackError : styles.feedbackSuccess,
              ]}
            >
              <Ionicons
                name={feedback.type === "error" ? "alert-circle" : "checkmark-circle"}
                size={18}
                color={feedback.type === "error" ? COLORS.error : COLORS.success}
              />
              <Text
                style={[
                  styles.feedbackText,
                  { color: feedback.type === "error" ? COLORS.error : COLORS.success },
                ]}
              >
                {feedback.message}
              </Text>
            </View>
          ) : null}

          {/* Password hint */}
          <View style={styles.hintBox}>
            <Feather name="shield" size={14} color={COLORS.blue} />
            <Text style={styles.hintText}>
              Password must be 8+ characters, include an uppercase letter and a symbol (e.g. @, #).
            </Text>
          </View>

          {/* Current Password */}
          <Text style={styles.label}>Current Password</Text>
          <PasswordInput
            value={currentPassword}
            onChangeText={setCurrentPassword}
            placeholder="Enter current password"
            show={showCurrent}
            onToggle={() => setShowCurrent((v) => !v)}
            editable={!loading}
          />

          {/* New Password */}
          <Text style={styles.label}>New Password</Text>
          <PasswordInput
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="At least 8 characters"
            show={showNew}
            onToggle={() => setShowNew((v) => !v)}
            editable={!loading}
          />

          {/* Confirm New Password */}
          <Text style={styles.label}>Confirm New Password</Text>
          <PasswordInput
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Repeat new password"
            show={showConfirm}
            onToggle={() => setShowConfirm((v) => !v)}
            editable={!loading}
          />

          {/* Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.btn, styles.btnSecondary]}
              onPress={() => router.back()}
              disabled={loading}
            >
              <Text style={styles.btnSecondaryText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btn, styles.btnPrimary, loading && styles.btnDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="lock-closed" size={16} color="#fff" />
                  <Text style={styles.btnPrimaryText}>Update Password</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function PasswordInput({ value, onChangeText, placeholder, show, onToggle, editable }) {
  return (
    <View style={styles.inputWrapper}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.muted}
        secureTextEntry={!show}
        editable={editable}
        autoCapitalize="none"
      />
      <TouchableOpacity onPress={onToggle} style={styles.eyeBtn} hitSlop={8}>
        <Ionicons name={show ? "eye-off-outline" : "eye-outline"} size={20} color={COLORS.muted} />
      </TouchableOpacity>
    </View>
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

  feedbackBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: SPACING.sm,
    borderRadius: RADIUS.input,
    marginBottom: SPACING.md,
  },
  feedbackError: { backgroundColor: "#FFEBEE" },
  feedbackSuccess: { backgroundColor: "#E8F5E9" },
  feedbackText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
  },

  hintBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "#EFF6FF",
    borderRadius: RADIUS.input,
    padding: SPACING.sm,
    marginBottom: SPACING.md,
  },
  hintText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.blue,
    lineHeight: 18,
  },

  label: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 8,
    marginTop: SPACING.md,
  },

  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.input,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingRight: SPACING.sm,
  },
  input: {
    flex: 1,
    paddingHorizontal: SPACING.md,
    paddingVertical: 13,
    fontSize: 14,
    color: COLORS.text,
  },
  eyeBtn: {
    padding: 6,
  },

  buttonRow: {
    flexDirection: "row",
    gap: SPACING.sm,
    marginTop: SPACING.xl,
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
