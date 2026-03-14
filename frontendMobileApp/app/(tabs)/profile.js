import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { jwtDecode } from "jwt-decode";
import { getProfile } from "../../src/services/profileService";
import { COLORS, RADIUS, SPACING, TYPO } from "../../src/theme/theme";

function GenderModal({ visible, selected, onSelect, onClose }) {
  const options = ["Male", "Female"];
  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.modalBox}>
          <Text style={styles.modalTitle}>Select Gender</Text>
          {options.map((opt) => (
            <TouchableOpacity
              key={opt}
              style={[
                styles.modalOption,
                selected === opt && styles.modalOptionActive,
              ]}
              onPress={() => {
                onSelect(opt);
                onClose();
              }}
            >
              <Text
                style={[
                  styles.modalOptionText,
                  selected === opt && styles.modalOptionTextActive,
                ]}
              >
                {opt}
              </Text>
              {selected === opt && (
                <Ionicons name="checkmark" size={18} color={COLORS.navy2} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

function Avatar({ name }) {
  const initials = name
    ? name
        .trim()
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";
  return (
    <View style={styles.avatarRing}>
      <LinearGradient
        colors={["#5483B3", "#052859"]}
        style={styles.avatarGradient}
      >
        <Text style={styles.avatarInitials}>{initials}</Text>
      </LinearGradient>
    </View>
  );
}

function FieldCard({ label, children }) {
  return (
    <View style={styles.fieldCard}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

export default function ProfileScreen() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("student");
  const [nickName, setNickName] = useState("");
  const [gender, setGender] = useState("");
  const [description, setDescription] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [showGenderModal, setShowGenderModal] = useState(false);

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        router.replace("/auth/login");
        return;
      }

      const decoded = jwtDecode(token);
      setRole(decoded.role || "student");

      const data = await getProfile(token);
      const userEmail = data.user.email;
      setEmail(userEmail);

      setName(
        (await AsyncStorage.getItem(`profileName_${userEmail}`)) ||
          data.user.name ||
          "",
      );
      setNickName(
        (await AsyncStorage.getItem(`profileNickName_${userEmail}`)) || "",
      );
      setGender(
        (await AsyncStorage.getItem(`profileGender_${userEmail}`)) || "",
      );
      setDescription(
        (await AsyncStorage.getItem(`profileDesc_${userEmail}`)) || "",
      );
    } catch (err) {
      setError(err.message || "Failed to load profile.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleToggleEdit = async () => {
    if (isEditing) {
      await AsyncStorage.setItem(`profileName_${email}`, name);
      await AsyncStorage.setItem(`profileNickName_${email}`, nickName);
      await AsyncStorage.setItem(`profileGender_${email}`, gender);
      await AsyncStorage.setItem(`profileDesc_${email}`, description);
    }
    setIsEditing((v) => !v);
  };

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.removeItem("token");
          router.replace("/auth/login");
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.centerScreen}>
        <ActivityIndicator size="large" color={COLORS.navy2} />
        <Text style={[TYPO.body, { marginTop: 12 }]}>Loading profile…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerScreen}>
        <Ionicons name="alert-circle-outline" size={48} color={COLORS.error} />
        <Text style={[TYPO.body, { marginTop: 12, textAlign: "center" }]}>
          {error}
        </Text>
        <TouchableOpacity style={styles.retryBtn} onPress={loadProfile}>
          <Text style={TYPO.button}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.root} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={["#C6DDF0", "#EEDFEA", "#FEF7E2"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.banner}
      />

      <View style={styles.avatarWrapper}>
        <Avatar name={name} />
      </View>

      <View style={styles.nameRow}>
        <Text style={styles.displayName}>{name || "Your Name"}</Text>
        <View
          style={[
            styles.roleBadge,
            role === "teacher" && styles.roleBadgeTeacher,
          ]}
        >
          <Text style={styles.roleBadgeText}>
            {role === "teacher" ? "Teacher" : "Student"}
          </Text>
        </View>
      </View>
      <Text style={styles.displayEmail}>{email}</Text>

      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[styles.editBtn, isEditing && styles.saveBtn]}
          onPress={handleToggleEdit}
        >
          <Ionicons
            name={isEditing ? "checkmark-circle-outline" : "create-outline"}
            size={18}
            color="#fff"
          />
          <Text style={styles.editBtnText}>
            {isEditing ? "Save" : "Edit Profile"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.resetBtn}
          onPress={() => router.push("/auth/resetPassword")}
        >
          <Ionicons name="lock-closed-outline" size={16} color={COLORS.navy2} />
          <Text style={styles.resetBtnText}>Password</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profile Info</Text>

        <FieldCard label="Full Name">
          <TextInput
            style={[styles.input, isEditing && styles.inputEditing]}
            value={name}
            editable={isEditing}
            onChangeText={setName}
            placeholder="Your full name"
            placeholderTextColor={COLORS.muted}
          />
        </FieldCard>

        <FieldCard label="Nick Name">
          <TextInput
            style={[styles.input, isEditing && styles.inputEditing]}
            value={nickName}
            editable={isEditing}
            onChangeText={setNickName}
            placeholder="Your nickname"
            placeholderTextColor={COLORS.muted}
          />
        </FieldCard>

        <FieldCard label="Gender">
          <TouchableOpacity
            style={[
              styles.input,
              styles.inputRow,
              isEditing && styles.inputEditing,
            ]}
            onPress={() => isEditing && setShowGenderModal(true)}
            activeOpacity={isEditing ? 0.7 : 1}
          >
            <Text style={gender ? styles.inputText : styles.inputPlaceholder}>
              {gender || "Select gender"}
            </Text>
            {isEditing && (
              <Ionicons name="chevron-down" size={16} color={COLORS.muted} />
            )}
          </TouchableOpacity>
        </FieldCard>

        <FieldCard label="About Me">
          <TextInput
            style={[
              styles.input,
              styles.textarea,
              isEditing && styles.inputEditing,
            ]}
            value={description}
            editable={isEditing}
            onChangeText={setDescription}
            placeholder="Write something about yourself…"
            placeholderTextColor={COLORS.muted}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </FieldCard>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>My Email Address</Text>
        <View style={styles.emailCard}>
          <View style={styles.emailIconCircle}>
            <Ionicons name="mail" size={20} color={COLORS.blue} />
          </View>
          <View>
            <Text style={styles.emailText}>{email}</Text>
            <Text style={styles.emailSub}>Primary email</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#fff" />
        <Text style={styles.logoutBtnText}>Log Out</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />

      <GenderModal
        visible={showGenderModal}
        selected={gender}
        onSelect={setGender}
        onClose={() => setShowGenderModal(false)}
      />
    </ScrollView>
  );
}

const AVATAR_SIZE = 90;
const BANNER_HEIGHT = 130;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.white },

  centerScreen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.xl,
    backgroundColor: COLORS.white,
  },

  retryBtn: {
    marginTop: SPACING.lg,
    backgroundColor: COLORS.navy2,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: RADIUS.button,
  },

  banner: {
    height: BANNER_HEIGHT,
    width: "100%",
  },
  avatarWrapper: {
    alignSelf: "center",
    marginTop: -(AVATAR_SIZE / 2),
    zIndex: 10,
  },
  avatarRing: {
    width: AVATAR_SIZE + 6,
    height: AVATAR_SIZE + 6,
    borderRadius: (AVATAR_SIZE + 6) / 2,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
  },
  avatarGradient: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitials: {
    fontSize: 32,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 1,
  },

  nameRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: SPACING.sm,
    gap: 8,
  },
  displayName: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.text,
  },
  roleBadge: {
    backgroundColor: "#EBF3FF",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  roleBadgeTeacher: { backgroundColor: "#FFF7E0" },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.navy2,
  },
  displayEmail: {
    textAlign: "center",
    color: COLORS.muted,
    fontSize: 13,
    marginTop: 4,
  },

  actionRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.navy2,
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: RADIUS.button,
    flex: 1,
    justifyContent: "center",
  },
  saveBtn: { backgroundColor: COLORS.success },
  editBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },

  resetBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.white,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: RADIUS.button,
    borderWidth: 1.5,
    borderColor: COLORS.navy2,
    flex: 1,
    justifyContent: "center",
  },
  resetBtnText: { color: COLORS.navy2, fontWeight: "700", fontSize: 14 },

  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.xl,
  },

  section: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.text,
    marginBottom: SPACING.md,
  },

  fieldCard: { marginBottom: SPACING.md },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.muted,
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  input: {
    backgroundColor: "#F5F8FF",
    borderRadius: RADIUS.input,
    paddingHorizontal: SPACING.md,
    paddingVertical: 13,
    fontSize: 15,
    color: COLORS.text,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  inputEditing: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.blue,
  },
  inputText: { fontSize: 15, color: COLORS.text },
  inputPlaceholder: { fontSize: 15, color: COLORS.muted },
  inputRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  textarea: { minHeight: 100 },

  emailCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F8FF",
    borderRadius: RADIUS.card,
    padding: SPACING.md,
    gap: SPACING.md,
  },
  emailIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#EBF3FF",
    justifyContent: "center",
    alignItems: "center",
  },
  emailText: { fontSize: 14, fontWeight: "600", color: COLORS.text },
  emailSub: { fontSize: 12, color: COLORS.muted, marginTop: 2 },

  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.xl,
    backgroundColor: "#D32F2F",
    paddingVertical: 14,
    borderRadius: RADIUS.button,
  },
  logoutBtnText: { color: "#fff", fontWeight: "800", fontSize: 15 },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: SPACING.lg,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.text,
    marginBottom: SPACING.md,
    textAlign: "center",
  },
  modalOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: SPACING.md,
    borderRadius: 12,
    marginBottom: 4,
  },
  modalOptionActive: { backgroundColor: "#EBF3FF" },
  modalOptionText: { fontSize: 15, color: COLORS.text },
  modalOptionTextActive: { fontWeight: "700", color: COLORS.navy2 },
});
