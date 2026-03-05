import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, RADIUS, SPACING, TYPO } from "../../src/theme/theme";

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isPasswordHidden, setIsPasswordHidden] = useState(true);
  const [isConfirmHidden, setIsConfirmHidden] = useState(true);

  const [role, setRole] = useState("Select Role");

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

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => {
            setRole((r) => (r === "Select Role" ? "Student" : "Select Role"));
          }}
          style={{
            flexDirection: "row",
            alignItems: "center",
            borderWidth: 1,
            borderColor: COLORS.border,
            borderRadius: RADIUS.input,
            paddingHorizontal: SPACING.md,
            paddingVertical: 12,
            marginBottom: SPACING.sm,
          }}
        >
          <Ionicons name="people-outline" size={18} color={COLORS.navy2} />
          <Text
            style={{
              marginLeft: SPACING.sm,
              color: role === "Select Role" ? COLORS.muted : COLORS.text,
            }}
          >
            {role}
          </Text>
          <View style={{ marginLeft: "auto" }}>
            <Ionicons name="chevron-down" size={18} color={COLORS.muted} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            backgroundColor: COLORS.navy2,
            borderRadius: RADIUS.button,
            paddingVertical: 14,
            alignItems: "center",
            marginTop: SPACING.md,
          }}
          onPress={() => {
            router.replace("/auth/login");
          }}
        >
          <Text style={TYPO.button}>Register</Text>
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
