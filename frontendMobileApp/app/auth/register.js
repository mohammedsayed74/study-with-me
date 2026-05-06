import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { COLORS, RADIUS, SPACING, TYPO } from "../../src/theme/theme";
import { registerUser } from "../../src/services/authService";

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordHidden, setIsPasswordHidden] = useState(true);
  const [isConfirmHidden, setIsConfirmHidden] = useState(true);
  const [role, setRole] = useState("student");
  const [year, setYear] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!fullName || !email || !password || !confirmPassword) {
      Alert.alert("Missing fields", "Please fill in all fields.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Password mismatch", "Passwords do not match.");
      return;
    }
    try {
      setLoading(true);
      const payload = { name: fullName, email, password, role };
      if (role === "student") payload.year = year;
      const result = await registerUser(payload);
      await AsyncStorage.setItem("token", result.token);
      await AsyncStorage.setItem("user_name", result.name || result.user?.name || fullName);
      await AsyncStorage.setItem("user_role", result.role || result.user?.role || role);
      router.replace("/(tabs)/dashboard");
    } catch (error) {
      Alert.alert("Registration failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#052859', '#021024']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBackground}
      />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <Animated.View entering={FadeInDown.duration(800).springify()} style={styles.headerContainer}>
            <View style={styles.brandContainer}>
              <Ionicons name="book" size={32} color={COLORS.authPrimary} />
              <Text style={styles.brandTitle}>Study With Me</Text>
            </View>
            <Text style={styles.headerSubtitle}>Join the community and start your learning journey today.</Text>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(200).duration(800).springify()} style={styles.cardContainer}>
            <Text style={styles.cardTitle}>Create Account</Text>
            <Text style={styles.cardSubtitle}>Please fill in your details below.</Text>

            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>FULL NAME</Text>
              <InputWithIcon
                icon="person-outline"
                placeholder="Enter your full name"
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
              <InputWithIcon
                icon="mail-outline"
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>PASSWORD</Text>
              <InputWithIcon
                icon="lock-closed-outline"
                placeholder="Create a password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={isPasswordHidden}
                rightIcon={isPasswordHidden ? "eye-outline" : "eye-off-outline"}
                onRightIconPress={() => setIsPasswordHidden((v) => !v)}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>CONFIRM PASSWORD</Text>
              <InputWithIcon
                icon="lock-closed-outline"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={isConfirmHidden}
                rightIcon={isConfirmHidden ? "eye-outline" : "eye-off-outline"}
                onRightIconPress={() => setIsConfirmHidden((v) => !v)}
              />
            </View>

            {/* Role Toggle */}
            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>I AM A...</Text>
              <View style={styles.roleContainer}>
                {["student", "teacher"].map((option) => {
                  const isActive = role === option;
                  return (
                    <TouchableOpacity
                      key={option}
                      onPress={() => setRole(option)}
                      style={[styles.roleButton, isActive && styles.roleButtonActive]}
                      activeOpacity={0.8}
                    >
                      <Ionicons
                        name={option === "student" ? "school-outline" : "briefcase-outline"}
                        size={18}
                        color={isActive ? COLORS.white : COLORS.authTextMuted}
                      />
                      <Text style={[styles.roleText, isActive && styles.roleTextActive]}>
                        {option}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Year Picker */}
            {role === "student" && (
              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>ACADEMIC YEAR</Text>
                <View style={styles.yearContainer}>
                  {[1, 2, 3, 4].map((y) => {
                    const isActive = year === y;
                    return (
                      <TouchableOpacity
                        key={y}
                        onPress={() => setYear(y)}
                        style={[styles.yearButton, isActive && styles.yearButtonActive]}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.yearText, isActive && styles.yearTextActive]}>
                          Year {y}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            <TouchableOpacity
              style={[styles.primaryButton, loading && styles.primaryButtonDisabled]}
              disabled={loading}
              onPress={handleRegister}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>{loading ? "Creating account…" : "Register"}</Text>
              {!loading && <Ionicons name="arrow-forward" size={20} color={COLORS.white} style={{marginLeft: 8}} />}
            </TouchableOpacity>

            <View style={styles.footerContainer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.replace("/auth/login")}>
                <Text style={styles.footerLink}>Log In</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
          
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function InputWithIcon({ icon, rightIcon, onRightIconPress, style, ...props }) {
  return (
    <View style={[styles.inputWrapper, style]}>
      <Ionicons name={icon} size={20} color="#94a3b8" style={styles.inputIconLeft} />
      <TextInput
        {...props}
        placeholderTextColor="#94a3b8"
        style={styles.inputField}
      />
      {rightIcon && (
        <TouchableOpacity onPress={onRightIconPress} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} style={styles.inputIconRight}>
          <Ionicons name={rightIcon} size={20} color="#94a3b8" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.authBg,
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: SPACING.lg,
    paddingTop: Platform.OS === 'ios' ? 80 : 60,
    paddingBottom: 40,
  },
  headerContainer: {
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.sm,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  brandTitle: {
    fontSize: 24,
    fontFamily: "PlusJakartaSans_800ExtraBold",
    color: COLORS.white,
    marginLeft: 10,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 15,
    fontFamily: "PlusJakartaSans_500Medium",
    color: "rgba(255, 255, 255, 0.8)",
    lineHeight: 22,
  },
  cardContainer: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.card,
    padding: SPACING.xl,
    shadowColor: COLORS.navy,
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.1,
    shadowRadius: 30,
    elevation: 10,
  },
  cardTitle: {
    fontSize: 26,
    fontFamily: "PlusJakartaSans_800ExtraBold",
    color: COLORS.authTextMain,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    fontFamily: "PlusJakartaSans_500Medium",
    color: COLORS.authTextMuted,
    marginBottom: SPACING.xl,
  },
  formGroup: {
    marginBottom: SPACING.md,
  },
  inputLabel: {
    fontSize: 11,
    fontFamily: "PlusJakartaSans_700Bold",
    color: COLORS.authTextMuted,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.authInputBg,
    borderWidth: 1,
    borderColor: COLORS.authInputBorder,
    borderRadius: RADIUS.input,
    paddingHorizontal: 16,
    height: 52,
  },
  inputIconLeft: {
    marginRight: 12,
  },
  inputField: {
    flex: 1,
    color: COLORS.authTextMain,
    fontSize: 15,
    fontFamily: "PlusJakartaSans_500Medium",
    height: '100%',
  },
  inputIconRight: {
    marginLeft: 10,
  },
  roleContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  roleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: RADIUS.button,
    backgroundColor: COLORS.authInputBg,
    borderWidth: 1,
    borderColor: COLORS.authInputBorder,
    gap: 8,
  },
  roleButtonActive: {
    backgroundColor: COLORS.authPrimary,
    borderColor: COLORS.authPrimary,
  },
  roleText: {
    fontSize: 14,
    fontFamily: "PlusJakartaSans_700Bold",
    color: COLORS.authTextMuted,
    textTransform: 'capitalize',
  },
  roleTextActive: {
    color: COLORS.white,
  },
  yearContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  yearButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    borderRadius: RADIUS.button,
    backgroundColor: COLORS.authInputBg,
    borderWidth: 1,
    borderColor: COLORS.authInputBorder,
  },
  yearButtonActive: {
    backgroundColor: COLORS.authPrimary,
    borderColor: COLORS.authPrimary,
  },
  yearText: {
    fontSize: 13,
    fontFamily: "PlusJakartaSans_700Bold",
    color: COLORS.authTextMuted,
  },
  yearTextActive: {
    color: COLORS.white,
  },
  primaryButton: {
    backgroundColor: COLORS.authPrimary,
    flexDirection: 'row',
    height: 54,
    borderRadius: RADIUS.button,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.authPrimary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
    marginTop: SPACING.md,
  },
  primaryButtonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontFamily: "PlusJakartaSans_700Bold",
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
  footerText: {
    fontSize: 14,
    fontFamily: "PlusJakartaSans_500Medium",
    color: COLORS.authTextMuted,
  },
  footerLink: {
    fontSize: 14,
    fontFamily: "PlusJakartaSans_700Bold",
    color: COLORS.authPrimary,
  },
});
