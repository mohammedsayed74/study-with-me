import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, RADIUS, SPACING, TYPO } from "../../src/theme/theme";
import { loginUser } from "../../src/services/authService";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordHidden, setIsPasswordHidden] = useState(true);

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
        <Text style={[TYPO.h2, { textAlign: "center" }]}>Welcome Back</Text>
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
          Enter your credentials to access your account.
        </Text>

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

        <TouchableOpacity
          style={{ alignSelf: "flex-end", marginTop: SPACING.xs }}
        >
          <Text style={TYPO.link}>Forgot password?</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            backgroundColor: COLORS.navy2,
            borderRadius: RADIUS.button,
            paddingVertical: 14,
            alignItems: "center",
            marginTop: SPACING.lg,
          }}
          onPress={async () => {
            try {
              const payload = {
                email,
                password,
              };

              const result = await loginUser(payload);
              await AsyncStorage.setItem("token", result.token);
              console.log("Login success:", result);
              router.replace("/(tabs)/home");
            } catch (error) {
              console.log("Login error:", error.message);
            }
          }}
        >
          <Text style={TYPO.button}>Log In</Text>
        </TouchableOpacity>

        <View style={{ marginTop: SPACING.lg, alignItems: "center" }}>
          <Text style={TYPO.body}>
            Don’t have an account?{" "}
            <Text
              style={TYPO.link}
              onPress={() => router.replace("/auth/register")}
            >
              Register
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
