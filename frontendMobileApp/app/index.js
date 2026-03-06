import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { COLORS, RADIUS, SPACING, TYPO } from "../src/theme/theme";

export default function HomeScreen() {
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("token");
      router.replace("/auth/login");
    } catch (error) {
      console.log("Logout error:", error);
    }
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: COLORS.white,
        justifyContent: "center",
        alignItems: "center",
        padding: SPACING.lg,
      }}
    >
      <Text style={[TYPO.h2, { marginBottom: SPACING.lg }]}>Home Screen</Text>

      <TouchableOpacity
        onPress={handleLogout}
        style={{
          backgroundColor: COLORS.navy2,
          paddingVertical: 14,
          paddingHorizontal: 28,
          borderRadius: RADIUS.button,
        }}
      >
        <Text style={TYPO.button}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
}
