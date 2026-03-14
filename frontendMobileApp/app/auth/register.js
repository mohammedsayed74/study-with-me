import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
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
  const [loading, setLoading] = useState(false);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: COLORS.sky,
        padding: SPACING.lg,
        justifyContent: "center",
      }}
    >
      <Text
        style={[
          TYPO.label,
          {
            textAlign: "center",
            marginBottom: SPACING.md,
            fontSize: 16,
            fontWeight: "800",
          },
        ]}
      >
        Study With Me
      </Text>

      <View
        style={{
          backgroundColor: COLORS.white,
          borderRadius: RADIUS.card,
          padding: SPACING.lg,
          borderWidth: 1,
          borderColor: "rgba(2,16,36,0.08)",
        }}
      >
        <Text style={[TYPO.h2, { textAlign: "center" }]}>Create Account</Text>
        <Text
          style={[
            TYPO.body,
            {
              textAlign: "center",
              marginTop: SPACING.xs,
              marginBottom: SPACING.lg,
            },
          ]}
        >
          Join the community to start studying.
        </Text>

        <InputWithIcon
          icon="person-outline"
          placeholder="Full Name"
          value={fullName}
          onChangeText={setFullName}
          autoCapitalize="words"
        />

        <InputWithIcon
          icon="mail-outline"
          placeholder="Email Address"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <InputWithIcon
          icon="lock-closed-outline"
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={isPasswordHidden}
          rightIcon={isPasswordHidden ? "eye-outline" : "eye-off-outline"}
          onRightIconPress={() => setIsPasswordHidden((v) => !v)}
        />

        <InputWithIcon
          icon="lock-closed-outline"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={isConfirmHidden}
          rightIcon={isConfirmHidden ? "eye-outline" : "eye-off-outline"}
          onRightIconPress={() => setIsConfirmHidden((v) => !v)}
        />

        <View style={{ marginBottom: SPACING.sm }}>
          <Text
            style={{
              fontSize: 12,
              fontWeight: "700",
              color: COLORS.muted,
              marginBottom: 8,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            I am a…
          </Text>
          <View style={{ flexDirection: "row", gap: 10 }}>
            {["student", "teacher"].map((option) => {
              const isActive = role === option;
              return (
                <TouchableOpacity
                  key={option}
                  onPress={() => setRole(option)}
                  style={{
                    flex: 1,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    paddingVertical: 12,
                    borderRadius: RADIUS.button,
                    borderWidth: 1.5,
                    borderColor: isActive ? COLORS.navy2 : COLORS.border,
                    backgroundColor: isActive ? COLORS.navy2 : COLORS.white,
                  }}
                >
                  <Ionicons
                    name={
                      option === "student"
                        ? "school-outline"
                        : "briefcase-outline"
                    }
                    size={16}
                    color={isActive ? "#fff" : COLORS.muted}
                  />
                  <Text
                    style={{
                      fontWeight: "700",
                      fontSize: 14,
                      color: isActive ? "#fff" : COLORS.muted,
                      textTransform: "capitalize",
                    }}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <TouchableOpacity
          style={{
            backgroundColor: loading ? COLORS.blue : COLORS.navy2,
            borderRadius: RADIUS.button,
            paddingVertical: 14,
            alignItems: "center",
            marginTop: SPACING.md,
          }}
          disabled={loading}
          onPress={async () => {
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
              const result = await registerUser({
                name: fullName,
                email,
                password,
                role,
              });
              // Save token so the user stays logged in
              await AsyncStorage.setItem("token", result.token);
              router.replace("/(tabs)/home");
            } catch (error) {
              Alert.alert("Registration failed", error.message);
            } finally {
              setLoading(false);
            }
          }}
        >
          <Text style={TYPO.button}>
            {loading ? "Creating account…" : "Register"}
          </Text>
        </TouchableOpacity>

        <View style={{ marginTop: SPACING.lg, alignItems: "center" }}>
          <Text style={TYPO.body}>
            Already have an account?{" "}
            <Text
              style={TYPO.link}
              onPress={() => router.replace("/auth/login")}
            >
              Log In
            </Text>
          </Text>
        </View>
      </View>
    </View>
  );
}

function InputWithIcon({ icon, rightIcon, onRightIconPress, style, ...props }) {
  return (
    <View
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          borderWidth: 1,
          borderColor: COLORS.border,
          borderRadius: RADIUS.input,
          paddingHorizontal: SPACING.md,
          paddingVertical: 10,
          marginBottom: SPACING.sm,
          backgroundColor: COLORS.white,
        },
        style,
      ]}
    >
      <Ionicons name={icon} size={18} color={COLORS.navy2} />

      <TextInput
        {...props}
        placeholderTextColor={COLORS.muted}
        style={{
          flex: 1,
          marginLeft: SPACING.sm,
          paddingVertical: 0,
          color: COLORS.text,
          fontSize: 14,
        }}
      />

      {rightIcon ? (
        <TouchableOpacity onPress={onRightIconPress} hitSlop={10}>
          <Ionicons name={rightIcon} size={18} color={COLORS.muted} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
