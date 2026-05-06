import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown, FadeInUp, FadeIn } from "react-native-reanimated";
import { COLORS, RADIUS, SPACING, TYPO } from "../../src/theme/theme";
import { loginUser } from "../../src/services/authService";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordHidden, setIsPasswordHidden] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
      const result = await loginUser({ email, password });
      await AsyncStorage.setItem("token", result.token);
      await AsyncStorage.setItem("user_name", result.name || result.user?.name || "");
      await AsyncStorage.setItem("user_role", result.role || result.user?.role || "student");
      router.replace("/(tabs)/dashboard");
    } catch (error) {
      Alert.alert("Login failed", error.message || "Invalid email or password.");
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
            <Text style={styles.headerSubtitle}>Sign in to access your dashboard, courses, and AI study tools.</Text>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(200).duration(800).springify()} style={styles.cardContainer}>
            <Text style={styles.cardTitle}>Welcome Back</Text>
            <Text style={styles.cardSubtitle}>Enter your credentials to access your account.</Text>

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
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={isPasswordHidden}
                rightIcon={isPasswordHidden ? "eye-outline" : "eye-off-outline"}
                onRightIconPress={() => setIsPasswordHidden((v) => !v)}
              />
            </View>

            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={() => router.push("/auth/resetPassword")}
            >
              <Text style={styles.forgotPasswordText}>Forgot password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.primaryButton, loading && styles.primaryButtonDisabled]}
              disabled={loading}
              onPress={handleLogin}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>{loading ? "Logging in…" : "Log In"}</Text>
              {!loading && <Ionicons name="arrow-forward" size={20} color={COLORS.white} style={{marginLeft: 8}} />}
            </TouchableOpacity>

            <View style={styles.footerContainer}>
              <Text style={styles.footerText}>Don’t have an account? </Text>
              <TouchableOpacity onPress={() => router.replace("/auth/register")}>
                <Text style={styles.footerLink}>Register</Text>
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
    height: '45%',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: SPACING.lg,
    paddingTop: Platform.OS === 'ios' ? 80 : 60,
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
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: SPACING.xl,
  },
  forgotPasswordText: {
    fontSize: 13,
    fontFamily: "PlusJakartaSans_700Bold",
    color: COLORS.authPrimary,
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
