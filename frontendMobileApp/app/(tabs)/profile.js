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
  Image,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { jwtDecode } from "jwt-decode";
import * as ImagePicker from "expo-image-picker";
import Animated, { FadeInUp, FadeInDown } from "react-native-reanimated";
import { getProfile, uploadProfilePicture, deleteProfilePicture } from "../../src/services/profileService";
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
                <Ionicons name="checkmark-circle" size={20} color={COLORS.authPrimary} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

function Avatar({ imageUri, onPress, onDelete, uploading }) {
  return (
    <View style={styles.avatarWrapperContainer}>
      <TouchableOpacity onPress={onPress} style={styles.avatarRing} activeOpacity={0.8}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.avatarImage} />
        ) : (
          <View style={styles.avatarDefault}>
            <Ionicons name="person" size={45} color={COLORS.authPrimary} />
          </View>
        )}
        <View style={styles.avatarEditBadge}>
          {uploading ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <Ionicons name="camera" size={14} color={COLORS.white} />
          )}
        </View>
      </TouchableOpacity>
      {imageUri ? (
        <TouchableOpacity style={styles.trashBadge} onPress={onDelete}>
          <Ionicons name="trash" size={16} color={COLORS.white} />
        </TouchableOpacity>
      ) : null}
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
  
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [coverPhoto, setCoverPhoto] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

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

      setName((await AsyncStorage.getItem(`profileName_${userEmail}`)) || data.user.name || "");
      setNickName((await AsyncStorage.getItem(`profileNickName_${userEmail}`)) || "");
      setGender((await AsyncStorage.getItem(`profileGender_${userEmail}`)) || "");
      setDescription((await AsyncStorage.getItem(`profileDesc_${userEmail}`)) || "");
      setProfilePhoto(data.user.profilePicture || null);
      setCoverPhoto((await AsyncStorage.getItem(`coverPhoto_${userEmail}`)) || null);
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
      if (coverPhoto) await AsyncStorage.setItem(`coverPhoto_${email}`, coverPhoto);
    }
    setIsEditing((v) => !v);
  };

  const handleImageResult = async (result, type) => {
    if (!result.canceled) {
      if (type === 'cover') {
        setCoverPhoto(result.assets[0].uri);
      } else {
        setUploadingPhoto(true);
        try {
          const uri = result.assets[0].uri;
          const fileName = uri.split('/').pop() || "profile.jpg";
          const res = await uploadProfilePicture(uri, fileName, "image/jpeg");
          setProfilePhoto(res.profilePicture);
        } catch (err) {
          Alert.alert("Error", err.message || "Failed to upload photo");
        } finally {
          setUploadingPhoto(false);
        }
      }
    }
  };

  const pickImage = async (type) => {
    if (type === 'cover' && !isEditing) return;

    Alert.alert(
      "Update Photo",
      "Choose an option",
      [
        {
          text: "Take a Photo",
          onPress: async () => {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert("Permission required", "Sorry, we need camera permissions to make this work!");
              return;
            }
            let result = await ImagePicker.launchCameraAsync({
              allowsEditing: true,
              aspect: type === 'cover' ? [16, 9] : [1, 1],
              quality: 0.8,
            });
            handleImageResult(result, type);
          }
        },
        {
          text: "Choose from Gallery",
          onPress: async () => {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert("Permission required", "Sorry, we need camera roll permissions to make this work!");
              return;
            }
            let result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              aspect: type === 'cover' ? [16, 9] : [1, 1],
              quality: 0.8,
            });
            handleImageResult(result, type);
          }
        },
        {
          text: "Cancel",
          style: "cancel"
        }
      ]
    );
  };

  const handleDeletePhoto = () => {
    Alert.alert("Delete Photo", "Are you sure you want to remove your profile picture?", [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Delete", 
        style: "destructive", 
        onPress: async () => {
          setUploadingPhoto(true);
          try {
            await deleteProfilePicture();
            setProfilePhoto(null);
          } catch(err) {
            Alert.alert("Error", err.message || "Failed to delete photo");
          } finally {
            setUploadingPhoto(false);
          }
        }
      }
    ]);
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
        <ActivityIndicator size="large" color={COLORS.authPrimary} />
        <Text style={[TYPO.body, { marginTop: 12, fontFamily: "PlusJakartaSans_500Medium" }]}>Loading profile…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerScreen}>
        <Ionicons name="alert-circle-outline" size={48} color={COLORS.error} />
        <Text style={[TYPO.body, { marginTop: 12, textAlign: "center", fontFamily: "PlusJakartaSans_500Medium" }]}>
          {error}
        </Text>
        <TouchableOpacity style={styles.retryBtn} onPress={loadProfile}>
          <Text style={{color: COLORS.white, fontFamily: "PlusJakartaSans_700Bold"}}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.root} showsVerticalScrollIndicator={false}>
      <TouchableOpacity 
        activeOpacity={isEditing ? 0.8 : 1} 
        onPress={() => pickImage('cover')}
      >
        {coverPhoto ? (
          <Image source={{ uri: coverPhoto }} style={styles.banner} />
        ) : (
          <LinearGradient
            colors={['#052859', '#021024']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.banner}
          />
        )}
        {isEditing && (
          <View style={styles.coverEditOverlay}>
            <Ionicons name="camera" size={24} color={COLORS.white} />
            <Text style={styles.coverEditText}>Change Cover</Text>
          </View>
        )}
      </TouchableOpacity>

      <Animated.View entering={FadeInDown.duration(600).springify()} style={styles.avatarWrapper}>
        <Avatar 
          imageUri={profilePhoto} 
          onPress={() => pickImage('profile')} 
          onDelete={handleDeletePhoto}
          uploading={uploadingPhoto}
        />
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(100).duration(600).springify()}>
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
            activeOpacity={0.8}
          >
            <Ionicons
              name={isEditing ? "checkmark-circle" : "create-outline"}
              size={18}
              color="#fff"
            />
            <Text style={styles.editBtnText}>
              {isEditing ? "Save Profile" : "Edit Profile"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.resetBtn}
            onPress={() => router.push("/auth/resetPassword")}
            activeOpacity={0.8}
          >
            <Ionicons name="lock-closed" size={16} color={COLORS.authTextMuted} />
            <Text style={styles.resetBtnText}>Password</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Details</Text>

          <FieldCard label="Full Name">
            <TextInput
              style={[styles.input, isEditing && styles.inputEditing]}
              value={name}
              editable={isEditing}
              onChangeText={setName}
              placeholder="Your full name"
              placeholderTextColor={COLORS.authTextMuted}
            />
          </FieldCard>

          <FieldCard label="Nick Name">
            <TextInput
              style={[styles.input, isEditing && styles.inputEditing]}
              value={nickName}
              editable={isEditing}
              onChangeText={setNickName}
              placeholder="Your nickname"
              placeholderTextColor={COLORS.authTextMuted}
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
                <Ionicons name="chevron-down" size={18} color={COLORS.authPrimary} />
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
              placeholderTextColor={COLORS.authTextMuted}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </FieldCard>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Access</Text>
          <View style={styles.emailCard}>
            <View style={styles.emailIconCircle}>
              <Ionicons name="mail" size={20} color={COLORS.authPrimary} />
            </View>
            <View style={{flex: 1}}>
              <Text style={styles.emailText}>{email}</Text>
              <Text style={styles.emailSub}>Primary email address</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <Ionicons name="log-out" size={20} color="#fff" />
          <Text style={styles.logoutBtnText}>Log Out</Text>
        </TouchableOpacity>

        <View style={{ height: 60 }} />
      </Animated.View>

      <GenderModal
        visible={showGenderModal}
        selected={gender}
        onSelect={setGender}
        onClose={() => setShowGenderModal(false)}
      />
    </ScrollView>
  );
}

const AVATAR_SIZE = 100;
const BANNER_HEIGHT = 160;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.authBg },

  centerScreen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.xl,
    backgroundColor: COLORS.authBg,
  },

  retryBtn: {
    marginTop: SPACING.lg,
    backgroundColor: COLORS.authPrimary,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: RADIUS.button,
  },

  banner: {
    height: BANNER_HEIGHT,
    width: "100%",
  },
  coverEditOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverEditText: {
    color: COLORS.white,
    fontFamily: "PlusJakartaSans_700Bold",
    marginTop: 8,
  },
  avatarWrapper: {
    alignSelf: "center",
    marginTop: -(AVATAR_SIZE / 2),
    zIndex: 10,
  },
  avatarWrapperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative'
  },
  avatarRing: {
    width: AVATAR_SIZE + 8,
    height: AVATAR_SIZE + 8,
    borderRadius: (AVATAR_SIZE + 8) / 2,
    backgroundColor: COLORS.authBg,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.navy,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 8,
  },
  avatarImage: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
  },
  avatarDefault: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: COLORS.authInputBg,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.authInputBorder,
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.authPrimary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.authBg,
  },
  trashBadge: {
    position: 'absolute',
    bottom: 0,
    left: -10,
    backgroundColor: COLORS.error,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.authBg,
    zIndex: 20
  },

  nameRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: SPACING.sm,
    gap: 8,
  },
  displayName: {
    fontSize: 24,
    fontFamily: "PlusJakartaSans_800ExtraBold",
    color: COLORS.authTextMain,
  },
  roleBadge: {
    backgroundColor: COLORS.authInputBg,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.authInputBorder,
  },
  roleBadgeTeacher: { 
    backgroundColor: "#fffbeb",
    borderColor: "#fde68a"
  },
  roleBadgeText: {
    fontSize: 12,
    fontFamily: "PlusJakartaSans_800ExtraBold",
    color: COLORS.authPrimary,
  },
  displayEmail: {
    textAlign: "center",
    color: COLORS.authTextMuted,
    fontSize: 14,
    fontFamily: "PlusJakartaSans_500Medium",
    marginTop: 4,
  },

  actionRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: COLORS.authPrimary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: RADIUS.button,
    flex: 1,
    justifyContent: "center",
    shadowColor: COLORS.authPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveBtn: { 
    backgroundColor: COLORS.success,
    shadowColor: COLORS.success,
  },
  editBtnText: { 
    color: "#fff", 
    fontFamily: "PlusJakartaSans_700Bold", 
    fontSize: 14 
  },
  resetBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: COLORS.white,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: RADIUS.button,
    borderWidth: 1,
    borderColor: COLORS.authInputBorder,
    flex: 1,
    justifyContent: "center",
    shadowColor: COLORS.navy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  resetBtnText: { 
    color: COLORS.authTextMain, 
    fontFamily: "PlusJakartaSans_700Bold", 
    fontSize: 14 
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.authInputBorder,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.xl,
  },

  section: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "PlusJakartaSans_800ExtraBold",
    color: COLORS.authTextMain,
    marginBottom: SPACING.md,
  },

  fieldCard: { marginBottom: SPACING.md },
  fieldLabel: {
    fontSize: 12,
    fontFamily: "PlusJakartaSans_700Bold",
    color: COLORS.authTextMuted,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.input,
    paddingHorizontal: SPACING.md,
    paddingVertical: 14,
    fontSize: 15,
    fontFamily: "PlusJakartaSans_500Medium",
    color: COLORS.authTextMain,
    borderWidth: 1,
    borderColor: COLORS.authInputBorder,
  },
  inputEditing: {
    backgroundColor: COLORS.authInputBg,
    borderColor: COLORS.authPrimary,
  },
  inputText: { fontSize: 15, fontFamily: "PlusJakartaSans_500Medium", color: COLORS.authTextMain },
  inputPlaceholder: { fontSize: 15, fontFamily: "PlusJakartaSans_500Medium", color: COLORS.authTextMuted },
  inputRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  textarea: { minHeight: 120 },

  emailCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.card,
    padding: SPACING.md,
    gap: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.authInputBorder,
  },
  emailIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.authInputBg,
    justifyContent: "center",
    alignItems: "center",
  },
  emailText: { fontSize: 15, fontFamily: "PlusJakartaSans_700Bold", color: COLORS.authTextMain },
  emailSub: { fontSize: 13, fontFamily: "PlusJakartaSans_500Medium", color: COLORS.authTextMuted, marginTop: 2 },

  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.xl,
    backgroundColor: "#fee2e2",
    paddingVertical: 16,
    borderRadius: RADIUS.button,
    borderWidth: 1,
    borderColor: "#fca5a5",
  },
  logoutBtnText: { color: COLORS.error, fontFamily: "PlusJakartaSans_800ExtraBold", fontSize: 15 },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    width: "85%",
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.card,
    padding: SPACING.xl,
    shadowColor: COLORS.navy,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: "PlusJakartaSans_800ExtraBold",
    color: COLORS.authTextMain,
    marginBottom: SPACING.lg,
    textAlign: "center",
  },
  modalOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.button,
    marginBottom: 8,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.authInputBorder,
  },
  modalOptionActive: { 
    backgroundColor: COLORS.authInputBg,
    borderColor: COLORS.authPrimary,
  },
  modalOptionText: { fontSize: 15, fontFamily: "PlusJakartaSans_600SemiBold", color: COLORS.authTextMain },
  modalOptionTextActive: { fontFamily: "PlusJakartaSans_800ExtraBold", color: COLORS.authPrimary },
});
